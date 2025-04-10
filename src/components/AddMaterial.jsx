import toast from "react-hot-toast";
import { useState } from "react";
import { addMaterial } from "../functions/api";

const AddMaterial = () => {
  const [material, setMaterial] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMaterial = async () => {
    setIsLoading(true);
    try {
      if (material.trim() === "" || code.trim() === "") {
        toast.error("Please enter a material name and code.");
        return;
      }
      await addMaterial(material, code);
      toast.success("New Product added successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong - can't add new product.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="flex flex-col my-4 gap-5 justify-center items-center">
        <h3 className="text-2xl font-bold my-5">Add New Material & Code</h3>
        <div className="flex gap-2 items-center">
          <label>Material name: </label>
          <input
            type="text"
            value={material}
            placeholder="Glass"
            onChange={(e) => setMaterial(e.target.value)}
            className="border rounded-lg px-2 py-1"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label>Abbreviation: </label>
          <input
            type="text"
            value={code}
            placeholder="GL"
            onChange={(e) => setCode(e.target.value)}
            className="border rounded-lg px-2 py-1"
          />
        </div>

        <button
          disabled={isLoading}
          onClick={handleAddMaterial}
          className="bg-green-700 text-white px-4 btn btn-sm my-2"
        >
          {isLoading ? "Adding..." : "Add New Material"}
        </button>
      </div>
    </div>
  );
};

export default AddMaterial;
