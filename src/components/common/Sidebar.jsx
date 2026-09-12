import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-xs md:text-sm border-l-2 transition-colors ${
    isActive
      ? "border-primary text-primary bg-primary/10 font-semibold"
      : "border-transparent hover:bg-primary/5"
  }`;

const groupTitleClass =
  "px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-base-content/50";

const Sidebar = () => {
  return (
    <nav className="w-56 shrink-0 font-mono text-primary">
      <ul className="menu p-0 gap-0.5">
        <li>
          <span className={groupTitleClass}>Generate</span>
        </li>
        <li>
          <NavLink to="/" end className={linkClass}>
            SKU Generator
          </NavLink>
        </li>
        <li>
          <span className={groupTitleClass}>Reference</span>
        </li>
        <li>
          <NavLink to="/skus" className={linkClass}>
            View All SKUs
          </NavLink>
        </li>
        <li>
          <span className={groupTitleClass}>Manage</span>
        </li>
        <li>
          <NavLink to="/manage" className={linkClass}>
            Manage
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
