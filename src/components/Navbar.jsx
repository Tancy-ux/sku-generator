const Navbar = () => {
  return (
    <div className="flex justify-around my-10">
      <a href="/" className="text-4xl font-mono font-bold text-green-100">
        SKU Generator
      </a>
      <div className="hidden flex-row gap-8">
        <div>Material Codes</div>
        <div>Products</div>
        <div>Colour Codes</div>
        <div>Etc...</div>
      </div>
    </div>
  );
};

export default Navbar;
