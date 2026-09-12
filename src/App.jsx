import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import SKUGenerator from "./components/SkuGenerator";
import { Navigate, Route, Routes } from "react-router-dom";
import Error from "./pages/Error";
import ShowSkuCodes from "./components/ShowSkuCodes";
import Manage from "./pages/Manage";

function App() {
  return (
    <div className="h-screen flex flex-col transition-colors duration-200">
      <div className="px-10 py-5 shrink-0">
        <Navbar />
      </div>
      <div className="flex gap-8 px-10 pb-10 flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <Routes>
            <Route path="/" element={<SKUGenerator />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/skus" element={<ShowSkuCodes />} />
            {/* Old per-page links now live as tabs under /manage. */}
            <Route path="/products" element={<Navigate to="/manage" replace />} />
            <Route path="/materials" element={<Navigate to="/manage" replace />} />
            <Route path="/color" element={<Navigate to="/manage" replace />} />
            <Route path="/pdetails" element={<Navigate to="/manage" replace />} />
            <Route path="/viewall" element={<Navigate to="/manage" replace />} />
            <Route path="/*" element={<Error />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
