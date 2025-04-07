import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import SKUGenerator from "./components/SkuGenerator";
import AddProduct from "./pages/AddProduct";
import { Route, Routes } from "react-router-dom";
import AddColor from "./pages/AddColor";

function App() {
  return (
    <div className="mx-10 my-5">
      <Navbar />
      <Routes>
        <Route path="/" element={<SKUGenerator />} />
        <Route path="/products" element={<AddProduct />} />
        <Route path="/color" element={<AddColor />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
