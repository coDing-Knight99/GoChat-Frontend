import { useEffect, useId, useState } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";

const DEBOUNCE_DELAY = 350;

export default function AddContactModal({
  isOpen,
  onClose,
  onAddContact,
  searchUsers,
}) {
  const inputId = useId();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    const value = username.trim();
    if (!value) return undefined;

    let isCurrent = true;
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");
      try {
        const users = await searchUsers(value);
        if (isCurrent) setResults(Array.isArray(users) ? users : []);
      } catch (searchError) {
        if (isCurrent) {
          setResults([]);
          setError(searchError?.message || "Could not search for users.");
        }
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, searchUsers, username]);

  if (!isOpen) return null;

  const closeModal = () => {
    setUsername("");
    setResults([]);
    setError("");
    setIsSearching(false);
    onClose();
  };

  const handleUsernameChange = (event) => {
    const nextUsername = event.target.value;
    setUsername(nextUsername);
    if (!nextUsername.trim()) {
      setResults([]);
      setError("");
      setIsSearching(false);
    }
  };

  const handleAddContact = (user) => {
    setUsername("");
    setResults([]);
    setError("");
    onAddContact(user);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-contact-title"
      onMouseDown={(event) =>
        event.target === event.currentTarget && closeModal()
      }
    >
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2
              id="add-contact-title"
              className="text-lg font-semibold text-white"
            >
              Add a contact
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Search using their username.
            </p>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close add contact dialog"
            onClick={closeModal}
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </header>
        <div className="p-5">
          <label htmlFor={inputId} className="sr-only">
            Username
          </label>
          <div className="flex h-11 items-center gap-2 rounded-lg bg-slate-800 px-3 text-slate-400 focus-within:ring-2 focus-within:ring-emerald-400/30">
            <Icon name="search" size={18} />
            <input
              id={inputId}
              autoFocus
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter a username"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            {isSearching && (
              <span className="text-xs text-emerald-300">Searching…</span>
            )}
          </div>
          <div className="mt-4 max-h-72 overflow-y-auto">
            {error && (
              <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}
            {!error &&
              username.trim() &&
              !isSearching &&
              results.length === 0 && (
                <p className="px-1 py-5 text-center text-sm text-slate-500">
                  No users found.
                </p>
              )}
            {!username.trim() && (
              <p className="px-1 py-5 text-center text-sm text-slate-500">
                Start typing to find a contact.
              </p>
            )}
            {results.map((user) => {
              const name = user.name || user.username || user.user_id;
              return (
                <div
                  key={user.id || user._id || name}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-800"
                >
                  <Avatar person={{ ...user, name }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {name}
                    </p>
                    {user.username && (
                      <p className="truncate text-xs text-slate-400">
                        @{user.username.replace(/^@/, "")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-300"
                    onClick={() => handleAddContact({ ...user, name })}
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
