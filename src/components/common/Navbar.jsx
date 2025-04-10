import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center my-10 md:mx-6 text-pink-300">
      <a href="/" className="text-4xl font-mono font-bold">
        SKU Generator
      </a>
      <div className="flex flex-row gap-5 md:gap-12">
        <Link to="/viewall">View All</Link>
        <Link to="/products">Add Products</Link>
        <Link to="/color">Add Colour Combos</Link>
      </div>
    </div>
  );
};

export default Navbar;
