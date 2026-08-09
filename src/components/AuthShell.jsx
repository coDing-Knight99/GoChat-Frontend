import { Link } from "react-router-dom";
import Brand from "./Brand";
import Icon from "./Icon";

export default function AuthShell({ children }) {
  return (
    <main className="flex min-h-screen bg-[#07131a] text-slate-100 lg:flex-row">
      <section className="relative hidden min-h-screen w-[43%] overflow-hidden bg-[#08352e] px-12 py-10 lg:block">
        <Brand />
        <div className="absolute top-[28%] z-10 max-w-md"><div className="font-display text-7xl leading-none text-emerald-200">“</div><h2 className="mt-5 font-display text-5xl leading-tight tracking-tight">Every great conversation starts with a hello.</h2><p className="mt-5 leading-6 text-emerald-100/75">Join a calmer, more personal space for the people in your world.</p></div>
        <div className="absolute -bottom-40 -right-44 size-[30rem] rounded-full border border-emerald-200/30 bg-emerald-800/70" />
        <div className="absolute -bottom-12 -right-12 size-72 rounded-full border-[38px] border-emerald-200/20" />
        <div className="absolute right-16 top-[47%] z-10 rounded-[15px_15px_4px_15px] bg-amber-50 px-5 py-4 font-display text-slate-800 shadow-xl">Hello there <span>👋</span></div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col p-6 sm:p-10 lg:px-[10%]"><Link className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-300" to="/"><Icon name="arrow" size={18} /> Back to home</Link>{children}</section>
    </main>
  );
}
