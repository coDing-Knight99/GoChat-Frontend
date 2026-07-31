import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthShell from "../components/AuthShell";
import axios from "axios";
const Base_URL = import.meta.env.VITE_API_BASE_URL
const usernamePattern = /^[a-z0-9_]{3,20}$/;
const field =
  "mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-400/10";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checkUsernameAvailability = async (username) => {
  await wait(500);
  const normalizedUsername = username.trim();
  const response = await axios.post(`${Base_URL}/checkavailable`, {
    username: normalizedUsername,
  });
  return { available: response.data.available };
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [availability, setAvailability] = useState({  
    username: "",
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!username || !usernamePattern.test(username)) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        if (!cancelled)
          setAvailability({
            username,
            status: result.available == "true" ? "available" : "taken",
          });
      } catch {
        if (!cancelled) setAvailability({ username, status: "error" });
      }
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username]);

  const availabilityStatus = !username
    ? "idle"
    : !usernamePattern.test(username)
      ? "invalid"
      : availability.username === username
        ? availability.status
        : "checking";
  const availabilityMessage = {
    checking: "Checking availability…",
    available: "Username is available",
    taken: "That username is taken",
    invalid: "Use 3–20 lowercase letters, numbers, or underscores",
    error: "Could not check availability",
  }[availabilityStatus];

  const submit = async (event) => {
    event.preventDefault();
    if (!usernamePattern.test(username))
      return toast.error(
        "Use 3–20 letters, numbers, or underscores for your username.",
      );
    if (availabilityStatus !== "available")
      return toast.error("Please choose an available username.");
    setIsSubmitting(true);
    try {
      const availability = await checkUsernameAvailability(username);
      if (!availability.available) {
        throw new Error("That username is no longer available.");
      }
      const res = await axios.post(`${Base_URL}/register`, {
        username: username,
        email: email,
        password: password,
      });
      const response = await axios.post(`${Base_URL}/login`, {
        username: username,
        password: password,
      });
      toast.success("Your account is ready!");
      navigate("/chat");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor =
    availabilityStatus === "available"
      ? "text-emerald-300"
      : availabilityStatus === "checking"
        ? "text-slate-400"
        : "text-rose-300";
  return (
    <AuthShell>
      <div className="mx-auto mt-18 max-w-sm">
        <p className="text-[10px] font-bold tracking-[0.14em] text-emerald-300">
          START YOUR JOURNEY
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Come on in.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Create an account and start connecting.
        </p>
        <form className="mt-8" onSubmit={submit}>
          <label className="mb-4 block text-xs font-semibold">
            Username
            <input
              className={field}
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your_username"
            />
            {availabilityMessage && (
              <span className={`mt-2 block font-normal ${statusColor}`}>
                {availabilityMessage}
              </span>
            )}
          </label>
          <label className="mb-4 block text-xs font-semibold">
            Email
            <input
              className={field}
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-xs font-semibold">
            Password
            <input
              className={field}
              required
              minLength="8"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button
            disabled={isSubmitting || availabilityStatus !== "available"}
            className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? "Please wait…" : "Create account"}{" "}
            <span className="ml-1 text-lg">→</span>
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-bold text-emerald-300 hover:text-emerald-200"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
