import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Avatar from "../components/Avatar";
import AddContactModal from "../components/AddContactModal";
import Icon from "../components/Icon";
import Brand from "../components/Brand";
import axios from "axios";
import { BiExit, BiLogOut } from "react-icons/bi";
const Base_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = Base_URL?.replace(/^http/, "ws") || "";
const AVATAR_COLORS = ["bg-sky-200", "bg-violet-200", "bg-amber-200", "bg-rose-200"];

function formatMessageTime(timestamp = Date.now()) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeConversation(name, text, time, unread = 0) {
  return {
    name,
    text,
    time,
    unread,
    initials: name.slice(0, 1).toUpperCase(),
    color: AVATAR_COLORS[name.length % AVATAR_COLORS.length],
  };
}

function messageKey(message) {
  // Database records receive an ObjectID after the worker flushes them, while
  // their WebSocket copies do not. Use message content and its millisecond
  // timestamp so the two representations resolve to the same cached message.
  const timestamp = message.timestamp ? new Date(message.timestamp).getTime() : message.time;
  return `${message.side}-${message.text}-${timestamp}`;
}

function mergeMessages(...messageLists) {
  const uniqueMessages = new Map();

  messageLists.flat().forEach((message) => {
    uniqueMessages.set(messageKey(message), message);
  });
``
  return [...uniqueMessages.values()].sort(
    (first, second) => new Date(first.timestamp || 0) - new Date(second.timestamp || 0),
  );
}

export default function ChatPage() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const socketRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const selectedRef = useRef(selected);
  const messagesByContactRef = useRef(new Map());

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const storeMessages = (contactName, nextMessages) => {
    messagesByContactRef.current.set(contactName, nextMessages);

    if (selectedRef.current?.name === contactName) {
      setMessages(nextMessages);
    }
  };

  // Search filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return contacts.filter((contact) => {
      const nameMatch = contact.name?.toLowerCase().includes(q);
      const textMatch = contact.text?.toLowerCase().includes(q);
      const handleMatch = contact.handle?.toLowerCase().includes(q);
      return nameMatch || textMatch || handleMatch;
    });
  }, [contacts, query]);

  const searchUsers = useCallback(async (username) => {
    const response = await axios.post(`${Base_URL}/users/search`, {"username":username});
    const data = response.data;
    return Array.isArray(data) ? data : data.users || [];
  }, []);

  const addContact = (user) => {
    const name = user.name || user.username || user.user_id;
    const contact = {
      ...makeConversation(name, "", ""),
      ...user,
      name,
      handle: user.username ? `@${user.username.replace(/^@/, "")}` : user.handle,
      online: user.online ?? false,
    };

    setContacts((previousContacts) => [
      contact,
      ...previousContacts.filter((item) => item.name !== name),
    ]);
    setIsAddContactOpen(false);
    handleSelectContact(contact);
  };

  // 1. Fetch Message History (Initial or Pagination)
  const fetchMessages = useCallback(async (contactName, pageNum = 1, appendTop = false) => {
    try {
      if (appendTop) setIsLoadingMore(true);

      const response = await axios.get(
        `${Base_URL}/messages?contact=${encodeURIComponent(contactName)}&page=${pageNum}`
      );

      const { messages: fetchedDocs, pagination } = response.data;

      // Transform MongoDB schema -> React UI schema
      const formattedMessages = (fetchedDocs || []).map((doc) => ({
        id: String(doc.id),
        side: doc.sender_id === contactName ? "them" : "me",
        text: doc.msg,
        timestamp: doc.timestamp,
        time: formatMessageTime(doc.timestamp),
      }));

      if (selectedRef.current?.name === contactName) {
        setHasMore(pagination.has_more);
      }

      const cachedMessages = messagesByContactRef.current.get(contactName) || [];
      // The DB worker persists WebSocket messages in batches every 10 seconds.
      // Keep any live messages that have not reached the history endpoint yet.
      const nextMessages = mergeMessages(formattedMessages, cachedMessages);

      storeMessages(contactName, nextMessages);

      if (appendTop) {
        // Retain scroll offset when prepend historical messages to the top
        const container = scrollContainerRef.current;
        const previousScrollHeight = container ? container.scrollHeight : 0;

        // Adjust scroll position after state render
        requestAnimationFrame(() => {
          if (container && selectedRef.current?.name === contactName) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        });
      } else if (selectedRef.current?.name === contactName) {
        // Scroll to bottom on initial load
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        });
      }
    } catch (err) {
      console.error("Failed to load message history:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  // 2. Handle Contact Selection
  const handleSelectContact = (person) => {
    const selectedConversation = { ...person, unread: 0 };
    selectedRef.current = selectedConversation;
    setSelected(selectedConversation);
    setContacts((prev) =>
      prev.map((contact) =>
        contact.name === person.name ? selectedConversation : contact,
      ),
    );
    setPage(1);
    setMessages(messagesByContactRef.current.get(selectedConversation.name) || []);
    fetchMessages(selectedConversation.name, 1, false);
  };

  // 3. Handle Infinite Scroll (Top of Container)
  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoadingMore && selected) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(selected.name, nextPage, true);
    }
  };

  // 4. Send WebSocket Message
  const sendMessage = (event) => {
    event.preventDefault();
    if (!draft.trim() || !selected) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ msg: draft, receiver_id: selected.name })
      );

      const sentAt = formatMessageTime();
      const sentMessage = {
        id: `local-${Date.now()}`,
        side: "me",
        text: draft,
        time: sentAt,
        timestamp: new Date().toISOString(),
      };
      storeMessages(
        selected.name,
        [...(messagesByContactRef.current.get(selected.name) || []), sentMessage],
      );
      setContacts((prev) => [
        { ...selected, text: draft, time: sentAt, unread: 0 },
        ...prev.filter((contact) => contact.name !== selected.name),
      ]);
      setDraft("");

      // Scroll down after sending
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  };

  // 5. Initialize WebSocket & Conversations list
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws`);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected to Go server");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const sender = data.sender_id || data.sender || data.senderId || data.from;
        const text = data.msg || data.content || data.message || "";

        if (!sender) {
          console.warn("Received a message without a sender", data);
          return;
        }

        const time = formatMessageTime(data.timestamp);
        const isActiveConversation = selectedRef.current?.name === sender;

        setContacts((previousContacts) => {
          const existing = previousContacts.find((contact) => contact.name === sender);
          const conversation = {
            ...(existing || makeConversation(sender, text, time)),
            text,
            time,
            unread: isActiveConversation ? 0 : (existing?.unread || 0) + 1,
          };

          return [
            conversation,
            ...previousContacts.filter((contact) => contact.name !== sender),
          ];
        });

        const receivedMessage = {
          id: data.id ? String(data.id) : `live-${sender}-${data.timestamp || Date.now()}`,
          side: "them",
          text,
          time,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        storeMessages(
          sender,
          [...(messagesByContactRef.current.get(sender) || []), receivedMessage],
        );

        if (isActiveConversation) {
          setSelected((current) => (current ? { ...current, text, time, unread: 0 } : current));
        }

        if (isActiveConversation && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket connection closed");

    async function fetchConversations() {
      try {
        const response = await axios.get(
          `${Base_URL}/conversations`
        );
        const data = response.data || [];

        const formatted = data.map((item) => ({
          ...makeConversation(
            item.contact_id || "Unknown User",
            item.last_message || "",
            item.last_time ? formatMessageTime(item.last_time) : "",
          ),
          unread: item.unread || 0,
        }));

        setContacts(formatted);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    }

    fetchConversations();

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close();
      }
    };
  }, []);

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#07131a] text-slate-100 md:grid md:grid-cols-[72px_343px_1fr]">
      {/* Navigation Rail */}
      <aside className="z-10 hidden flex-col items-center bg-slate-900 py-5 md:flex">
        <button className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950">
          <Icon name="message" size={21} />
        </button>
        {/* <div className="mt-12 grid gap-2.5">
          <button className="grid size-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Icon name="message" size={21} />
          </button>
        </div> */}
        <button className="mt-auto flex justify-center items-center size-9 place-items-center rounded-full text-[30px] font-bold text-green-400">
        <BiLogOut/>
        </button>
      </aside>

      {/* Conversations List */}
      <aside className={`relative min-w-0 flex-1 border-r border-slate-800 bg-slate-900 md:flex-none ${selected ? "hidden md:block" : "block"}`}>
        <div className="flex items-center justify-between px-5 pb-4 pt-7">
          <div className="flex items-center gap-3"><span className="md:hidden"><Brand compact /></span><h1 className="text-2xl font-bold tracking-tight">Messages</h1></div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg bg-emerald-400/10 text-2xl text-emerald-300 hover:bg-emerald-400/20"
            aria-label="Add a contact"
            onClick={() => setIsAddContactOpen(true)}
          >
            ＋
          </button>
        </div>
        <div className="mx-4 flex h-10 items-center gap-2 rounded-lg bg-slate-800 px-2.5 text-slate-500">
          <Icon name="search" size={18} />
          <input
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
          />
        </div>
        <div className="flex gap-2 px-4 py-4">
          <button className="rounded-full bg-emerald-400/15 px-2.5 py-1.5 text-[11px] text-emerald-300">
            All <span className="ml-1 text-[9px]">{contacts.length}</span>
          </button>
        </div>
        <div className="h-[calc(100dvh-168px)] overflow-y-auto">
          {filtered.map((person) => (
            <button
              className={`relative flex w-full gap-2.5 px-4 py-3 text-left transition ${
                selected?.name === person.name
                  ? "bg-emerald-400/10"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => handleSelectContact(person)}
              key={person.name}
            >
              <Avatar person={person} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-1">
                  <b className="text-[13px]">{person.name}</b>
                  <time className="whitespace-nowrap text-[10px] text-slate-500">
                    {person.time}
                  </time>
                </div>
                <p className="mt-1 truncate text-[11px] text-slate-400">
                  {person.text}
                </p>
              </div>
              {person.unread > 0 && selected?.name !== person.name && (
                <span className="grid size-4 place-items-center self-end rounded-full bg-emerald-400 text-[9px] text-slate-950">
                  {person.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Window */}
      <section className={`min-h-0 min-w-0 flex-1 flex-col bg-[#07131a] ${selected ? "flex" : "hidden md:flex"}`}>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Icon name="message" size={30} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">
              Select a conversation
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Choose a contact from the sidebar to start chatting.
            </p>
          </div>
        ) : (
          <>
            <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <button type="button" aria-label="Back to conversations" onClick={() => setSelected(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 md:hidden"><Icon name="arrow" size={18} /></button>
                <Avatar person={selected} />
                <div>
                  <b className="block text-sm">{selected.name}</b>
                  <small className="text-[11px] text-slate-400">Online</small>
                </div>
              </div>
            </header>

            {/* Scrollable Message Container with Pagination */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-[11%]"
            >
              {/* Pagination Loader */}
              {isLoadingMore && (
                <div className="my-2 text-center text-xs text-emerald-400 animate-pulse">
                  Loading earlier messages...
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  className={`my-2 flex ${
                    message.side === "me" ? "justify-end" : ""
                  }`}
                  key={message.id || index}
                >
                  <div
                    className={`max-w-[88%] rounded-[4px_13px_13px_13px] px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:max-w-[75%] ${
                      message.side === "me"
                        ? "rounded-[13px_4px_13px_13px] bg-emerald-400 text-slate-950"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    {message.text}
                    <span
                      className={`mt-1 block text-right text-[9px] ${
                        message.side === "me"
                          ? "text-emerald-950/70"
                          : "text-slate-500"
                      }`}
                    >
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              className="flex h-19 shrink-0 items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 sm:gap-3 sm:px-7"
              onSubmit={sendMessage}
            >
              <input
                className="h-10 min-w-0 flex-1 rounded-lg bg-slate-800 px-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/30"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${selected?.name?.split(" ")[0] ?? ""}`}
              />
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              >
                <Icon name="send" size={19} />
              </button>
            </form>
          </>
        )}
      </section>
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onAddContact={addContact}
        searchUsers={searchUsers}
      />
    </main>
  );
}
