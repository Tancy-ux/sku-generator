import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCopy } from "react-icons/fi";
import { addNewColor, addBaseColor } from "../functions/colors";
import { useBaseColors } from "../hooks/useBaseColors";
import { useCeramicCombos } from "../hooks/useCeramicCombos";
import ShowCeramic from "../components/ShowCeramic";

const AddCeramicColors = () => {
  const { baseColors, refreshBaseColors } = useBaseColors();
  const {
    combos,
    loading: combosLoading,
    error: combosError,
    refreshCombos,
  } = useCeramicCombos();

  // Base color state
  const [newBaseColor, setNewBaseColor] = useState("");
  const [isAddingBase, setIsAddingBase] = useState(false);

  // Combination state
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isAddingCombo, setIsAddingCombo] = useState(false);

  const existingMatch = useMemo(() => {
    if (!outerColor || !innerColor || !rimColor) return null;
    return combos.find(
      (c) =>
        c.outerColor === outerColor &&
        c.innerColor === innerColor &&
        c.rimColor === rimColor,
    );
  }, [combos, outerColor, innerColor, rimColor]);

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
      await refreshCombos();
    } catch (error) {
      toast.error("Failed to add color combination: " + error.message);
    } finally {
      setIsAddingCombo(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied!");
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
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Base Colors</h2>
            <span className="badge badge-neutral badge-outline">
              {baseColors.length}
            </span>
          </div>
          <form
            onSubmit={handleAddBaseColor}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={newBaseColor}
              onChange={(e) => setNewBaseColor(e.target.value)}
              placeholder="e.g. Matte Black"
              className="input input-bordered flex-1"
              required
            />
            <button
              type="submit"
              className="btn btn-primary btn-outline"
              disabled={isAddingBase}
            >
              {isAddingBase ? "Adding..." : "Add"}
            </button>
          </form>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
              Existing base colors
            </h4>
            {baseColors.length === 0 ? (
              <p className="text-sm text-base-content/50">
                No base colors yet — add one above.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...baseColors]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((color, index) => (
                    <div
                      key={index}
                      className="badge badge-secondary badge-outline h-auto py-1.5"
                    >
                      {color.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Colour Combos */}
        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Colour Combos</h2>
            <span className="badge badge-neutral badge-outline">
              {combos.length}
            </span>
          </div>
          <form
            onSubmit={handleAddCombination}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-base-content/60">
                  Outer Glaze
                </label>
                <select
                  value={outerColor}
                  onChange={(e) => setOuterColor(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select</option>
                  {baseColors.map((color, index) => (
                    <option key={index} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-base-content/60">
                  Inner Glaze
                </label>
                <select
                  value={innerColor}
                  onChange={(e) => setInnerColor(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select</option>
                  {baseColors.map((color, index) => (
                    <option key={index} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-base-content/60">
                  Rim Colour
                </label>
                <select
                  value={rimColor}
                  onChange={(e) => setRimColor(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select</option>
                  {baseColors.map((color, index) => (
                    <option key={index} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {existingMatch && (
              <div className="alert alert-warning py-2 text-sm">
                <FiAlertTriangle size={16} />
                <span>
                  This combo already exists — code{" "}
                  <span className="font-mono font-bold">
                    {existingMatch.code}
                  </span>
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-outline self-start"
              disabled={isAddingCombo}
            >
              {isAddingCombo ? "Adding..." : "Add New Combination"}
            </button>
          </form>

          {generatedCode && (
            <div className="alert alert-success py-3 text-sm">
              <span>
                Code: <span className="font-mono font-bold">{generatedCode}</span>
              </span>
              <button
                onClick={handleCopyCode}
                className="btn btn-xs btn-ghost ml-auto"
                title="Copy code"
                type="button"
              >
                <FiCopy size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-box p-6">
        <ShowCeramic
          combos={combos}
          loading={combosLoading}
          error={combosError}
        />
      </div>
    </div>
  );
};

export default AddCeramicColors;
