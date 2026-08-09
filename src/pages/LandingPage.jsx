import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { contacts } from "../data/contacts";

const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/15 transition hover:-translate-y-0.5 hover:bg-emerald-300";

export default function LandingPage() {
  return <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <nav className="mx-auto flex h-35 max-w-6xl items-center justify-between px-2 sm:px-5">
      <Brand />
      <div className="flex items-center gap-3 sm:gap-7 text-sm font-semibold">
        <a className="hidden text-slate-400 transition hover:text-white sm:block" href="#features">Features</a>
        <a className="hidden text-slate-400 transition hover:text-white sm:block" href="#about">About</a>
        <Link className="text-slate-200 hover:text-emerald-300" to="/login">Log in</Link>
        <Link className={`${primary} px-3 py-2.5 text-sm sm:px-4`} to="/signup">Get started <span className="hidden text-lg sm:inline">→</span></Link>
      </div>
    </nav>
    <section className="relative min-h-150 px-5 pt-8 text-center sm:pt-8 [background:radial-gradient(circle_at_50%_58%,#14532d55_0,transparent_42%)]">
      <div className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.14em] text-emerald-300"><span className="size-1.5 rounded-full bg-amber-300" /> A MORE THOUGHTFUL WAY TO CHAT</div>
      <h1 className="mt-5 text-5xl font-semibold leading-[.98] tracking-[-0.06em] sm:text-7xl">Conversations that<br /><em className="font-display font-semibold text-emerald-300">feel closer.</em></h1>
      <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-400">goChat makes it simple to connect with the people who matter — wherever life takes you.</p>
      <div className="mt-7 flex items-center justify-center gap-4 sm:gap-6">
        <Link className={primary} to="/signup">Start chatting free <span className="text-xl">→</span></Link>
        <Link className="font-semibold text-slate-300 transition hover:text-emerald-300" to="/chat">See how it works <span className="ml-1 text-emerald-300">↗</span></Link>
      </div>
      <div className="mx-auto mt-12 hidden h-69 w-[800px] max-w-[110%] overflow-hidden rounded-t-2xl border-7 border-slate-700 border-b-0 bg-slate-900 text-left shadow-2xl shadow-black/35 sm:flex">
        <div className="flex w-13 flex-col items-center gap-4 bg-slate-900 py-3"><span className="grid size-7 place-items-center rounded-lg bg-emerald-400 text-slate-950"><Icon name="message" size={17} /></span>{[1,2,3,4].map(i => <i key={i} className="size-4 rounded bg-emerald-100/10" />)}</div>
        <div className="w-60 border-r border-slate-800 p-4"><div className="flex justify-between text-sm font-bold">Messages <span className="text-emerald-300">＋</span></div><div className="my-3 rounded-md bg-slate-800 px-2 py-2 text-[9px] text-slate-500">⌕&nbsp; Search</div>{contacts.slice(0,4).map((person,index) => <div className={`flex gap-2 rounded-md p-1.5 ${index === 0 ? "bg-emerald-400/10" : ""}`} key={person.name}><Avatar person={person}/><div className="min-w-0"><b className="block text-[9px]">{person.name}</b><small className="block w-35 truncate text-[7px] text-slate-500">{person.text}</small></div></div>)}</div>
        <div className="relative flex-1 bg-slate-900/50 p-4"><div className="flex items-start gap-2 border-b border-slate-800 pb-2 text-[9px]"><Avatar person={contacts[0]}/><b>Ananya Sharma</b><span className="ml-auto text-slate-500">⌕ •••</span></div><div className="absolute left-12 top-20 rounded-lg bg-slate-800 px-2.5 py-2 text-[8px] shadow">Hey! How’s the design coming along?</div><div className="absolute right-12 top-31 rounded-lg bg-emerald-400/20 px-2.5 py-2 text-[8px]">It’s coming together really nicely ✨</div><div className="absolute left-20 top-42 rounded-lg bg-slate-800 px-2.5 py-2 text-[8px] shadow">I can’t wait to see it!</div><div className="absolute bottom-3 left-4 right-4 rounded-md border border-slate-700 bg-slate-800 p-2 text-[8px] text-slate-500">Write a message <span className="float-right text-emerald-300">➤</span></div></div>
      </div>
    </section>
    <section id="features" className="mx-auto grid max-w-5xl grid-cols-2 border-t border-slate-800 px-5 py-7 text-sm sm:grid-cols-[2fr_1fr_1fr_1fr] sm:px-0"><p className="col-span-2 mb-5 text-slate-400 sm:col-span-1 sm:mb-0">Designed for your everyday conversations.</p>{[["01","Beautifully simple"],["02","Always in sync"],["03","Private by design"]].map(([number,label]) => <div className="border-l border-slate-800 pl-4" key={number}><span className="font-mono text-[11px] text-slate-500">{number}</span><b className="mt-2 block font-semibold">{label}</b></div>)}</section>
  </main>;
}
