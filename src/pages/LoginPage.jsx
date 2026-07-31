import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import AuthShell from "../components/AuthShell";

import axios from "axios";
const Base_URL=import.meta.env.VITE_API_BASE_URL
const usernamePattern = /^[a-z0-9_]{3,20}$/;
const field =
  "mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-400/10";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!usernamePattern.test(username)) {
      toast.error("Enter a valid username.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${Base_URL}/login`, {
        username,
        password,
      });
      localStorage.setItem("gochat-current-user", username);
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (error) {
      
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mx-auto mt-18 max-w-sm">
        <p className="text-[10px] font-bold tracking-[0.14em] text-emerald-300">
          WELCOME BACK
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Good to see you.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your username to continue your conversations.
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
          </label>
          <label className="block text-xs font-semibold">
            Password
            <input
              className={field}
              required
              minLength="8"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <a
            className="mt-2 block text-right text-xs text-emerald-300 hover:text-emerald-200"
            href="#forgot"
          >
            Forgot password?
          </a>
          <button
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? "Please wait…" : "Log in to goChat"}{" "}
            <span className="ml-1 text-lg">→</span>
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          New to goChat?{" "}
          <Link
            className="font-bold text-emerald-300 hover:text-emerald-200"
            to="/signup"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
