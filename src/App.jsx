import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar";
import SKUGenerator from "./components/SkuGenerator";
import AddProduct from "./pages/AddProduct";
import { Route, Routes } from "react-router-dom";
import AddColor from "./pages/AddColor";
import Error from "./pages/Error";
import ViewAll from "./pages/ViewAll";
import ShowSkuCodes from "./components/ShowSkuCodes";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="px-10 py-5">
        <Navbar />
        <Routes>
          <Route path="/" element={<SKUGenerator />} />
          <Route path="/products" element={<AddProduct />} />
          <Route path="/color" element={<AddColor />} />
          <Route path="/viewall" element={<ViewAll />} />
          <Route path="/skus" element={<ShowSkuCodes />} />
          <Route path="/pdetails" element={<ProductDetails />} />
          <Route path="/*" element={<Error />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
