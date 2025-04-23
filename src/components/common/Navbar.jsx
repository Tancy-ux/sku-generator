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
    <div className="flex justify-between font-mono items-center my-10 md:mx-6 text-[#009191] dark:text-teal-400">
      <a href="/" className="text-4xl font-semibold">
        SKU Generator
      </a>
      <div className="flex flex-row gap-5 md:gap-10 items-center">
        <Link
          to="/viewall"
          className="hover:text-teal-700  dark:hover:text-teal-500"
        >
          Abbreviations
        </Link>
        <Link
          to="/skus"
          className="hover:text-teal-700 dark:hover:text-teal-500"
        >
          View All SKUs
        </Link>
        <Link
          to="/products"
          className="hover:text-teal-700 dark:hover:text-teal-500"
        >
          Add Products | Add Materials
        </Link>
        <Link
          to="/color"
          className="hover:text-teal-700 dark:hover:text-teal-500"
        >
          Add Colour Combos
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-yellow-500 hover:bg-base-300 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
