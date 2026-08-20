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
      toast.error("Something went wrong - can't add new product.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-base-100 border border-base-300 rounded-box p-6">
      <div className="flex flex-col gap-4 justify-center items-center">
        <div className="flex gap-2 items-center">
          <label>Material name: </label>
          <input
            type="text"
            value={material}
            placeholder="Glass"
            onChange={(e) => setMaterial(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label>Abbreviation: </label>
          <input
            type="text"
            value={code}
            placeholder="GL"
            onChange={(e) => setCode(e.target.value)}
            className="input input-bordered"
          />
        </div>

        <button
          disabled={isLoading}
          onClick={handleAddMaterial}
          className="btn btn-primary btn-sm my-2"
        >
          {isLoading ? "Adding..." : "Add New Material"}
        </button>
      </div>
    </div>
  );
};

export default AddMaterial;
