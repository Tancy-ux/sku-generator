import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchMaterials } from "../functions/api";
import { addColorByMaterial, fetchColorsByMaterial } from "../functions/colors";

const AddMaterialColor = () => {
  const [materials, setMaterials] = useState([]);
  const [material, setMaterial] = useState("");
  const [colorName, setColorName] = useState("");
  const [materialColors, setMaterialColors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials().then(setMaterials);
  }, []);

  useEffect(() => {
    if (!material) {
      setMaterialColors([]);
      return;
    }
    fetchColorsByMaterial(material)
      .then(setMaterialColors)
      .catch(() => setMaterialColors([]));
  }, [material]);

  const handleAddMaterialColor = async (e) => {
    e.preventDefault();
    if (!material || !colorName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addColorByMaterial(material, colorName.trim());
      if (result) {
        setColorName("");
        // Refresh the list so the newly auto-assigned code shows up immediately
        const updated = await fetchColorsByMaterial(material);
        setMaterialColors(updated);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Add Material Colors</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Register a color for a material — the sequence code is assigned
          automatically.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>
      <div className="bg-base-100 border border-base-300 rounded-box p-6 flex justify-around">
      <div className="flex flex-col gap-5 items-center w-full max-w-lg">
        <form
          onSubmit={handleAddMaterialColor}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex gap-2 items-center">
            <label className="w-32">Material: </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="select select-bordered flex-1"
              required
            >
              <option value="">Select material</option>
              {materials
                .filter((m) => m.name !== "Ceramic")
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((m, idx) => (
                  <option key={idx} value={m.name}>
                    {m.name} - {m.code}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="w-32">Color Name: </label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g. Rose Pink"
              className="input input-bordered flex-1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-outline mt-4"
            disabled={isSubmitting || !material}
          >
            {isSubmitting ? "Adding..." : "Add Color"}
          </button>
        </form>

        {material && (
          <div className="mt-4 w-full">
            <h4 className="font-bold mb-2">
              Existing {material} Colors (sequence auto-assigned):
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {materialColors.length === 0 && (
                <p className="text-sm opacity-60 col-span-2">
                  No colors added for {material} yet.
                </p>
              )}
              {materialColors.map((c, index) => (
                <div
                  key={index}
                  className="badge badge-secondary badge-outline gap-1"
                >
                  {c.color} — {String(c.code).padStart(3, "0")}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AddMaterialColor;
