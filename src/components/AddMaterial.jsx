import toast from "react-hot-toast";
import { useState } from "react";
import { addMaterial } from "../functions/api";

const AddMaterial = ({ onAdded }) => {
  const [material, setMaterial] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (material.trim() === "" || code.trim() === "") {
      toast.error("Please enter a material name and code.");
      return;
    }

    setIsLoading(true);
    try {
      await addMaterial(material, code);
      toast.success("New material added successfully.");
      setMaterial("");
      setCode("");
      onAdded?.();
    } catch {
      toast.error("Something went wrong - can't add new material.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddMaterial} className="flex flex-wrap gap-2 items-end">
      <div className="flex flex-col gap-1 flex-1 min-w-40">
        <label className="text-xs font-medium text-base-content/60">
          Material name
        </label>
        <input
          type="text"
          value={material}
          placeholder="Glass"
          onChange={(e) => setMaterial(e.target.value)}
          className="input input-bordered input-sm w-full"
        />
      </div>
      <div className="flex flex-col gap-1 w-24">
        <label className="text-xs font-medium text-base-content/60">
          Code
        </label>
        <input
          type="text"
          value={code}
          placeholder="GL"
          onChange={(e) => setCode(e.target.value)}
          className="input input-bordered input-sm w-full"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary btn-outline btn-sm"
      >
        {isLoading ? "Adding..." : "Add"}
      </button>
    </form>
  );
};

export default AddMaterial;
