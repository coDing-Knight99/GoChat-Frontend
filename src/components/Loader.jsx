import logo from "../assets/GoChat_logo-removebg-preview.png";

const Loader = ({ contained = false, label = "Getting GoChat ready" }) => (
  <div className={`${contained ? "absolute inset-0 z-20" : "fixed inset-0 z-[150]"} flex items-center justify-center bg-[#061217]/75 p-5 backdrop-blur-md`}>
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-emerald-200/10 bg-slate-900/80 px-8 py-7 shadow-2xl shadow-black/40">
      <div className="relative grid size-18 place-items-center">
        <div className="absolute inset-0 animate-[spin_1.2s_linear_infinite] rounded-full border-2 border-emerald-300/15 border-t-emerald-300" />
        {/* <div className="grid size-13 place-items-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/20"><img className="w-10 object-contain" src={logo} alt="" /></div> */}
      </div>
      <p className="text-xs font-semibold tracking-wide text-emerald-100/80">{label}<span className="inline-block animate-pulse">...</span></p>
    </div>
  </div>
);

export default Loader;
