import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import SKUGenerator from "./components/SkuGenerator";
import AddProduct from "./pages/AddProduct";
import { Route, Routes } from "react-router-dom";
import AddColor from "./pages/AddColor";
import Error from "./pages/Error";
import ViewAll from "./pages/ViewAll";

function App() {
  return (
    <div className="mx-10 my-5">
      <Navbar />
      <Routes>
        <Route path="/" element={<SKUGenerator />} />
        <Route path="/products" element={<AddProduct />} />
        <Route path="/color" element={<AddColor />} />
        <Route path="/viewall" element={<ViewAll />} />
        <Route path="/*" element={<Error />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
