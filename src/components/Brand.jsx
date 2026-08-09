import { Link } from "react-router-dom";
import logo from "../assets/GoChat_logo-removebg-preview.png";

export default function Brand({ compact = false }) {
  return (
    <Link aria-label="GoChat home" className="inline-flex shrink-0 items-center" to="/">
      <img className={`h-auto object-contain ${compact ? "w-25 sm:w-30" : "w-30 sm:w-30"}`} src={logo} alt="GoChat" />
    </Link>
  );
}
