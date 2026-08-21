import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import SKUGenerator from "./components/SkuGenerator";
import AddProduct from "./pages/AddProduct";
import { Route, Routes } from "react-router-dom";
import AddCeramicColors from "./pages/AddCeramicColors";
import AddMaterials from "./pages/AddMaterials";
import Error from "./pages/Error";
import ViewAll from "./pages/ViewAll";
import ShowSkuCodes from "./components/ShowSkuCodes";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="px-10 py-5">
        <Navbar />
      </div>
      <div className="flex gap-8 px-10 pb-10">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<SKUGenerator />} />
            <Route path="/products" element={<AddProduct />} />
            <Route path="/materials" element={<AddMaterials />} />
            <Route path="/color" element={<AddCeramicColors />} />
            <Route path="/viewall" element={<ViewAll />} />
            <Route path="/skus" element={<ShowSkuCodes />} />
            <Route path="/pdetails" element={<ProductDetails />} />
            <Route path="/*" element={<Error />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
