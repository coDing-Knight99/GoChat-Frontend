export default function Avatar({ person, large = false }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full text-[11px] font-bold text-slate-950 ${large ? "size-12" : "size-10"} ${person.color}`}
    >
      {person.initials}
      {person.online && <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" />}
    </div>
  );
}
