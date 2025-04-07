const Navbar = () => {
  return (
    <div className="flex justify-between items-center my-10 mx-6 text-pink-300">
      <a href="/" className="text-4xl font-mono font-bold">
        SKU Generator
      </a>
      <div className="flex flex-row gap-16">
        <a href="/products">Add Products</a>
        <a href="/color">Add Colour Combinations</a>
      </div>
    </div>
  );
};

export default Navbar;
