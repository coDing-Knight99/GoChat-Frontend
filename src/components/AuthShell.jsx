import { Link } from "react-router-dom";
import Brand from "./Brand";
import Icon from "./Icon";

export default function AuthShell({ children }) {
  return (
    <main className="grid min-h-screen bg-slate-950 text-slate-100 lg:grid-cols-[42%_58%]">
      <section className="relative hidden overflow-hidden bg-emerald-950 px-13 py-10 lg:block">
        <Brand light />
        <div className="absolute top-[30%] z-10 max-w-sm">
          <div className="font-display text-7xl leading-none text-emerald-200">“</div>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight">Every great conversation starts with a hello.</h2>
          <p className="mt-5 leading-6 text-emerald-100/75">Join a calmer, more personal space for the people in your world.</p>
        </div>
        <div className="absolute -bottom-34 -right-43 size-117 rounded-full border border-emerald-200/40 bg-emerald-800" />
        <div className="absolute -bottom-12 -right-12 size-70 rounded-full border-[38px] border-emerald-200/20" />
        <div className="absolute right-22 top-47 z-10 rounded-[15px_15px_4px_15px] bg-amber-50 px-5 py-4 font-display text-slate-800 shadow-xl">Hello there <span>👋</span></div>
      </section>
      <section className="p-7 sm:p-10 lg:px-[12%]">
        <Link className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-300" to="/">
          <Icon name="arrow" size={18} /> Back to home
        </Link>
        {children}
      </section>
    </main>
  );
}
