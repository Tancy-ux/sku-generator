import { useState } from "react";
import toast from "react-hot-toast";
import { addNewColor, addBaseColor } from "../functions/colors";
import { useBaseColors } from "../hooks/useBaseColors";
import ShowCeramic from "../components/ShowCeramic";

const AddCeramicColors = () => {
  const { baseColors, refreshBaseColors } = useBaseColors();

  // Base color state
  const [newBaseColor, setNewBaseColor] = useState("");
  const [isAddingBase, setIsAddingBase] = useState(false);

  // Combination state
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isAddingCombo, setIsAddingCombo] = useState(false);

  const handleAddBaseColor = async (e) => {
    e.preventDefault();
    if (!newBaseColor) return;

    setIsAddingBase(true);
    try {
      await addBaseColor({ name: newBaseColor });
      toast.success(`Added base color: ${newBaseColor}`);
      setNewBaseColor("");
      await refreshBaseColors();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add base color");
    } finally {
      setIsAddingBase(false);
    }
  };

  const handleAddCombination = async (e) => {
    e.preventDefault();
    setIsAddingCombo(true);
    try {
      const response = await addNewColor(outerColor, innerColor, rimColor);

      if (response.message === "Color code already exists!") {
        toast.success(
          `This combination already exists with code: ${response.data}`,
        );
        setGeneratedCode(response.data);
      } else {
        toast.success(`New color code generated: ${response.colorCode}`);
        setGeneratedCode(response.colorCode);
      }

      setOuterColor("");
      setInnerColor("");
      setRimColor("");
    } catch (error) {
      toast.error("Failed to add color combination: " + error.message);
    } finally {
      setIsAddingCombo(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Add Ceramic Colors</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Base colors feed the glaze combos on the right — add one and it's
          available immediately.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Base Colors */}
        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg">Base Colors</h2>
          <form onSubmit={handleAddBaseColor} className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <label className="w-32 shrink-0">Color Name: </label>
              <input
                type="text"
                value={newBaseColor}
                onChange={(e) => setNewBaseColor(e.target.value)}
                className="input input-bordered flex-1"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-outline self-start"
              disabled={isAddingBase}
            >
              {isAddingBase ? "Adding..." : "Add Base Color"}
            </button>
          </form>

          <div>
            <h4 className="font-bold mb-2 text-sm text-base-content/60">
              Existing Base Colors ({baseColors.length}):
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {baseColors.map((color, index) => (
                <div
                  key={index}
                  className="badge badge-secondary badge-outline h-auto py-1.5 whitespace-normal text-center"
                >
                  {color.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colour Combos */}
        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg">Colour Combos</h2>
          <form onSubmit={handleAddCombination} className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <label className="w-32 shrink-0">Outer Glaze: </label>
              <select
                value={outerColor}
                onChange={(e) => setOuterColor(e.target.value)}
                className="select select-bordered flex-1"
                required
              >
                <option value="">Select color</option>
                {baseColors.map((color, index) => (
                  <option key={index} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className="w-32 shrink-0">Inner Glaze: </label>
              <select
                value={innerColor}
                onChange={(e) => setInnerColor(e.target.value)}
                className="select select-bordered flex-1"
                required
              >
                <option value="">Select color</option>
                {baseColors.map((color, index) => (
                  <option key={index} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className="w-32 shrink-0">Rim Colour: </label>
              <select
                value={rimColor}
                onChange={(e) => setRimColor(e.target.value)}
                className="select select-bordered flex-1"
                required
              >
                <option value="">Select color</option>
                {baseColors.map((color, index) => (
                  <option key={index} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-outline self-start"
              disabled={isAddingCombo}
            >
              {isAddingCombo ? "Adding..." : "Add New Combination"}
            </button>
          </form>

          {generatedCode && (
            <div className="p-3 bg-base-200 border border-base-300 rounded-box">
              <p className="font-bold">Generated Code: {generatedCode}</p>
            </div>
          )}
        </div>
      </div>

      <ShowCeramic />
    </div>
  );
};

export default AddCeramicColors;
