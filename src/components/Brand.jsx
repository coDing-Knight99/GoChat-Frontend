import { Link } from "react-router-dom";
import Icon from "./Icon";
export default function Brand({ light = false }) {
  return (
    <Link className={`flex items-center gap-2.5 text-xl font-bold tracking-tight ${light ? "text-white" : "text-slate-100"}`} to="/">
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/15">
        <Icon name="message" size={21} />
      </span>
      goChat
    </Link>
  );
}
