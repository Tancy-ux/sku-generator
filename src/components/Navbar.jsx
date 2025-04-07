const Navbar = () => {
  return (
    <div className="flex justify-between items-center my-10 md:mx-6 text-pink-300">
      <a href="/" className="text-4xl font-mono font-bold">
        SKU Generator
      </a>
      <div className="flex flex-row gap-5 md:gap-12">
        <a href="/products">Add Products</a>
        <a href="/color">Add Colour Combinations</a>
      </div>
    </div>
  );
};

export default Navbar;
