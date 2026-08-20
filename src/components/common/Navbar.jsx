import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    return storedDarkMode === "true";
  });

  useEffect(() => {
    // Apply dark mode class to document element
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex justify-between font-mono items-center text-primary">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-4xl font-semibold">
          SKU Generator
        </Link>
        <div className="flex items-center gap-1 ml-2 pl-3 border-l border-base-300 text-xs md:text-sm">
          <a
            href="https://ware-sku-studio.onrender.com"
            className="px-3 py-1 rounded-full hover:bg-primary/10 transition-colors"
          >
            Atelier
          </a>
          <span className="px-3 py-1 rounded-full bg-primary text-primary-content font-semibold">
            ware
          </span>
        </div>
      </div>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full text-warning hover:bg-base-300 transition-colors"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    </div>
  );
};

export default Navbar;
