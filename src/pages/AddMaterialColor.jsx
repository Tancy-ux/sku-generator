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
    <div className="flex justify-around">
      <div className="my-12 flex flex-col gap-5 items-center w-full max-w-lg">
        <h3 className="text-2xl text-center font-bold mb-7">
          Add Material Color
        </h3>

        <form
          onSubmit={handleAddMaterialColor}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex gap-2 items-center">
            <label className="w-32">Material: </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
              required
            >
              <option value="">Select material</option>
              {materials
                .slice()
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
              className="border rounded-lg px-2 py-1 flex-1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-outline mt-4"
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
                  className="badge badge-primary badge-outline gap-1"
                >
                  {c.color} — {String(c.code).padStart(3, "0")}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMaterialColor;
