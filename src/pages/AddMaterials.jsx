import { useState, useEffect } from "react";
import { useMaterials } from "../hooks/useMaterials";
import { addColorByMaterial, fetchColorsByMaterial } from "../functions/colors";
import AddMaterial from "../components/AddMaterial";
import ShowMaterial from "../components/ShowMaterial";

const AddMaterials = () => {
  const { materials, loading, refreshMaterials } = useMaterials();

  // Material color state
  const [colorMaterial, setColorMaterial] = useState("");
  const [colorName, setColorName] = useState("");
  const [materialColors, setMaterialColors] = useState([]);
  const [isSubmittingColor, setIsSubmittingColor] = useState(false);

  useEffect(() => {
    if (!colorMaterial) {
      setMaterialColors([]);
      return;
    }
    fetchColorsByMaterial(colorMaterial)
      .then(setMaterialColors)
      .catch(() => setMaterialColors([]));
  }, [colorMaterial]);

  const handleAddMaterialColor = async (e) => {
    e.preventDefault();
    if (!colorMaterial || !colorName.trim()) return;

    setIsSubmittingColor(true);
    try {
      const result = await addColorByMaterial(colorMaterial, colorName.trim());
      if (result) {
        setColorName("");
        const updated = await fetchColorsByMaterial(colorMaterial);
        setMaterialColors(updated);
      }
    } finally {
      setIsSubmittingColor(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Materials & Colors</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Register materials and the colors available for each one — codes
          are assigned automatically.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Materials */}
        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Materials</h2>
            <span className="badge badge-neutral badge-outline">
              {materials.length}
            </span>
          </div>
          <AddMaterial onAdded={refreshMaterials} />
          <ShowMaterial materials={materials} loading={loading} />
        </div>

        {/* Material Colors */}
        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg">Material Colors</h2>
          <form
            onSubmit={handleAddMaterialColor}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2 items-center">
              <label className="w-32 shrink-0">Material: </label>
              <select
                value={colorMaterial}
                onChange={(e) => setColorMaterial(e.target.value)}
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
              <label className="w-32 shrink-0">Color Name: </label>
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
              className="btn btn-primary btn-outline self-start"
              disabled={isSubmittingColor || !colorMaterial}
            >
              {isSubmittingColor ? "Adding..." : "Add Color"}
            </button>
          </form>

          {colorMaterial && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
                Existing {colorMaterial} colors
              </h4>
              {materialColors.length === 0 ? (
                <p className="text-sm text-base-content/50">
                  No colors added for {colorMaterial} yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[...materialColors]
                    .sort((a, b) => a.color.localeCompare(b.color))
                    .map((c, index) => (
                      <div
                        key={index}
                        className="badge badge-secondary badge-outline h-auto py-1.5"
                      >
                        {c.color}
                        <span className="ml-1 font-mono text-xs opacity-70">
                          {String(c.code).padStart(3, "0")}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMaterials;
