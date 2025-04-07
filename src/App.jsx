import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import SKUGenerator from "./components/SkuGenerator";
import AddFunctions from "./components/AddFunctions";

function App() {
  return (
    <div className="mx-10 my-5">
      <Navbar />
      <AddFunctions />
      <SKUGenerator />
      <Toaster />
    </div>
  );
}

export default App;
