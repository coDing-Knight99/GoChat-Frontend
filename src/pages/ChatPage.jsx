import { useEffect, useMemo, useState, useRef } from "react";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { contacts } from "../data/contacts";
const Base_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = Base_URL.replace(/^http/, "ws");
const initialMessages = [
  {
    side: "them",
    text: "Hey! How’s the design coming along?",
    time: "10:38 AM",
  },
  {
    side: "me",
    text: "It’s coming together really nicely. I just finished the new dashboard screens.",
    time: "10:39 AM",
  },
  {
    side: "them",
    text: "Amazing! I can’t wait to see them. The last version already looked so clean.",
    time: "10:40 AM",
  },
  {
    side: "me",
    text: "That’s so kind, thank you! I’ll send you a preview later today.",
    time: "10:41 AM",
  },
];

export default function ChatPage() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const socketRef = useRef(null);
  const filtered = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.handle.includes(query.toLowerCase()),
      ),
    [query],
  );
  const sendMessage = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ msg: draft, receiver_id: selected.name }),
      );
      setMessages((prev) => [
        ...prev,
        {
          side: "me",
          text: draft,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setDraft("");
    }
  };
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Websocket connected to Go server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            side: "them",
            text: data.msg,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("Websocket error:", error);
    };

    ws.onclose = () => {
      console.log("Websocket connection closed");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close();
      }
    };
  }, []);
  return (
    <main className="grid h-screen grid-cols-[0_290px_1fr] overflow-hidden bg-slate-950 text-slate-100 md:grid-cols-[72px_343px_1fr]">
      <aside className="z-10 hidden flex-col items-center bg-slate-900 py-5 md:flex">
        <button className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950">
          <Icon name="message" size={21} />
        </button>
        <div className="mt-12 grid gap-2.5">
          <button className="grid size-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Icon name="message" size={21} />
          </button>
          <button className="grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            <span className="text-2xl">♧</span>
          </button>
          <button className="grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            <span className="text-2xl">⌁</span>
          </button>
        </div>
        <button className="mt-auto grid size-8 place-items-center rounded-full bg-orange-200 text-[10px] font-bold text-orange-950">
          JD
        </button>
      </aside>
      <aside className="relative min-w-0 border-r border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between px-5 pb-4 pt-7">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <button className="grid size-8 place-items-center rounded-lg bg-emerald-400/10 text-2xl text-emerald-300 hover:bg-emerald-400/20">
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
          <kbd className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ⌘ K
          </kbd>
        </div>
        <div className="flex gap-2 px-4 py-4">
          <button className="rounded-full bg-emerald-400/15 px-2.5 py-1.5 text-[11px] text-emerald-300">
            All <span className="ml-1 text-[9px]">6</span>
          </button>
          <button className="rounded-full bg-slate-800 px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white">
            Unread <span className="ml-1 text-[9px]">2</span>
          </button>
          <button className="ml-auto text-slate-500 hover:text-white">
            •••
          </button>
        </div>
        <div>
          {filtered.map((person) => (
            <button
              className={`relative flex w-full gap-2.5 px-4 py-3 text-left transition ${selected?.name === person.name ? "bg-emerald-400/10" : "hover:bg-slate-800"}`}
              onClick={() => setSelected(person)}
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
              {person.unread && (
                <span className="absolute bottom-3 right-4 grid size-4 place-items-center rounded-full bg-emerald-400 text-[9px] text-slate-950">
                  {person.unread}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900 p-3.5">
          <button className="flex w-full items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-orange-200 text-[10px] font-bold text-orange-950">
              JD
            </span>
            <b className="text-xs">Jamie Doe</b>
            <span className="ml-auto text-slate-400">⌄</span>
          </button>
        </div>
      </aside>
      <section className="flex min-h-0 min-w-0 flex-col bg-slate-950">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:22px_22px] px-6 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Icon name="message" size={30} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">
              Select a conversation
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
              Choose a contact from the list to view your messages and start
              chatting.
            </p>
          </div>
        ) : (
          <>
            <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <Avatar person={selected} />
                <span>
                  <b className="block text-sm">{selected.name}</b>
                  <small className="mt-0.5 block text-[11px] text-slate-400">
                    {selected.online ? "Active now" : "Last seen recently"}
                  </small>
                </span>
              </div>
              <div className="flex gap-2 text-slate-400 sm:gap-4">
                <button className="hover:text-emerald-300">
                  <Icon name="phone" />
                </button>
                <button className="hidden hover:text-emerald-300 sm:block">
                  <Icon name="video" />
                </button>
                <button className="hidden hover:text-emerald-300 sm:block">
                  <Icon name="search" />
                </button>
                <button className="hover:text-emerald-300">
                  <Icon name="dots" />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:22px_22px] px-5 py-6 sm:px-[11%]">
              <div className="mx-auto mb-7 w-max rounded bg-slate-800 px-2.5 py-1 text-[10px] text-slate-400">
                Today
              </div>
              {messages.map((message, index) => (
                <div
                  className={`my-2 flex ${message.side === "me" ? "justify-end" : ""}`}
                  key={`${message.time}-${index}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[4px_13px_13px_13px] px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:max-w-[75%] ${message.side === "me" ? "rounded-[13px_4px_13px_13px] bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-100"}`}
                  >
                    {message.text}
                    <span
                      className={`mt-1 block text-right text-[9px] ${message.side === "me" ? "text-emerald-950/70" : "text-slate-500"}`}
                    >
                      {message.time}
                      {message.side === "me" && (
                        <em className="ml-1 not-italic">✓✓</em>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex h-19 shrink-0 items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 sm:gap-3 sm:px-7"
              onSubmit={sendMessage}
            >
              <button
                className="text-slate-400 hover:text-emerald-300"
                type="button"
              >
                <Icon name="smile" />
              </button>
              <button
                className="hidden text-slate-400 hover:text-emerald-300 sm:block"
                type="button"
              >
                <Icon name="paperclip" />
              </button>
              <input
                className="h-10 min-w-0 flex-1 rounded-lg bg-slate-800 px-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/30"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${selected.name.split(" ")[0]}`}
              />
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-lg bg-emerald-400 text-slate-950 transition hover:bg-emerald-300"
              >
                <Icon name="send" size={19} />
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
