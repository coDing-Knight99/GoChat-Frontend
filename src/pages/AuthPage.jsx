import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import { checkUsernameAvailability, login, signUp } from "../services/authApi";

const usernamePattern = /^[a-z0-9_]{3,20}$/;

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [availability, setAvailability] = useState({
    username: "",
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLogin || !username || !usernamePattern.test(username))
      return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        if (!cancelled) {
          setAvailability({
            username,
            status: result.available ? "available" : "taken",
          });
        }
      } catch {
        if (!cancelled) setAvailability({ username, status: "error" });
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username, isLogin]);

  const availabilityStatus =
    isLogin || !username
      ? "idle"
      : !usernamePattern.test(username)
        ? "invalid"
        : availability.username === username
          ? availability.status
          : "checking";

  const submit = async (event) => {
    event.preventDefault();
    if (!usernamePattern.test(username)) {
      toast.error(
        "Use 3–20 lowercase letters, numbers, or underscores for your username.",
      );
      return;
    }
    if (!isLogin && availabilityStatus !== "available") {
      toast.error("Please choose an available username.");
      return;
    }

    setIsSubmitting(true);
    try {
      const action = isLogin ? login : signUp;
      const { user } = await action({ username, password });
      localStorage.setItem("gochat-current-user", user.username);
      toast.success(isLogin ? "Welcome back!" : "Your account is ready!");
      navigate("/chat");
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availabilityMessage = {
    checking: "Checking availability…",
    available: "Username is available",
    taken: "That username is taken",
    invalid: "Use 3–20 lowecase letters, numbers, or underscores",
    error: "Could not check availability",
  }[availabilityStatus];
  const availabilityColor =
    availabilityStatus === "available" ? "text-emerald-300" : "text-rose-300";
  const field =
    "mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-400/10";

  return (
    <main className="grid min-h-screen bg-slate-950 text-slate-100 lg:grid-cols-[42%_58%]">
      <section className="relative hidden overflow-hidden bg-emerald-950 px-13 py-10 lg:block">
        <Brand light />
        <div className="absolute top-[30%] z-10 max-w-sm">
          <div className="font-display text-7xl leading-none text-emerald-200">
            “
          </div>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight">
            Every great conversation starts with a hello.
          </h2>
          <p className="mt-5 leading-6 text-emerald-100/75">
            Join a calmer, more personal space for the people in your world.
          </p>
        </div>
        <div className="absolute -bottom-34 -right-43 size-117 rounded-full border border-emerald-200/40 bg-emerald-800" />
        <div className="absolute -bottom-12 -right-12 size-70 rounded-full border-[38px] border-emerald-200/20" />
        <div className="absolute right-22 top-47 z-10 rounded-[15px_15px_4px_15px] bg-amber-50 px-5 py-4 font-display text-slate-800 shadow-xl">
          Hello there <span>👋</span>
        </div>
      </section>
      <section className="p-7 sm:p-10 lg:px-[12%]">
        <Link
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-300"
          to="/"
        >
          <Icon name="arrow" size={18} /> Back to home
        </Link>
        <div className="mx-auto mt-18 max-w-sm">
          <p className="text-[10px] font-bold tracking-[0.14em] text-emerald-300">
            {isLogin ? "WELCOME BACK" : "START YOUR JOURNEY"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            {isLogin ? "Good to see you." : "Come on in."}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin
              ? "Enter your username to continue your conversations."
              : "Create an account and start connecting."}
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
              {!isLogin && availabilityMessage && (
                <span
                  className={`mt-2 block font-normal ${availabilityStatus === "checking" ? "text-slate-400" : availabilityColor}`}
                >
                  {availabilityMessage}
                </span>
              )}
            </label>
            <label className="block text-xs font-semibold">
              Password
              <input
                className={field}
                required
                minLength="8"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
            {isLogin && (
              <a
                className="mt-2 block text-right text-xs text-emerald-300 hover:text-emerald-200"
                href="#forgot"
              >
                Forgot password?
              </a>
            )}
            <button
              disabled={
                isSubmitting || (!isLogin && availabilityStatus !== "available")
              }
              className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              {isSubmitting
                ? "Please wait…"
                : isLogin
                  ? "Log in to goChat"
                  : "Create account"}{" "}
              <span className="ml-1 text-lg">→</span>
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "New to goChat?" : "Already have an account?"}{" "}
            <Link
              className="font-bold text-emerald-300 hover:text-emerald-200"
              to={isLogin ? "/signup" : "/login"}
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
