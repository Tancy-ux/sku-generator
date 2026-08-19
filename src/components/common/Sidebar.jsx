import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-xs md:text-sm border-l-2 transition-colors ${
    isActive
      ? "border-[#009191] dark:border-teal-400 text-[#009191] dark:text-teal-400 bg-teal-700/5 dark:bg-teal-400/10 font-semibold"
      : "border-transparent hover:bg-teal-700/5 dark:hover:bg-teal-400/10"
  }`;

const groupTitleClass =
  "px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500";

const Sidebar = () => {
  return (
    <nav className="w-56 shrink-0 font-mono text-[#009191] dark:text-teal-400">
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
          <span className={groupTitleClass}>Manage</span>
        </li>
        <li>
          <NavLink to="/products" className={linkClass}>
            Add Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/materials" className={linkClass}>
            Add Materials
          </NavLink>
        </li>
        <li>
          <NavLink to="/color" className={linkClass}>
            Add Colour Combos
          </NavLink>
        </li>
        <li>
          <NavLink to="/base-colors" className={linkClass}>
            Add Base Colors
          </NavLink>
        </li>
        <li>
          <NavLink to="/pdetails" className={linkClass}>
            Pricing
          </NavLink>
        </li>

        <li>
          <span className={groupTitleClass}>Reference</span>
        </li>
        <li>
          <NavLink to="/viewall" className={linkClass}>
            Browse All
          </NavLink>
        </li>
        <li>
          <NavLink to="/skus" className={linkClass}>
            View All SKUs
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
