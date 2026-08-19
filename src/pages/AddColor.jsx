import { useState } from "react";
import toast from "react-hot-toast";
import { addNewColor } from "../functions/colors";
import { useBaseColors } from "../hooks/useBaseColors";

const AddColor = () => {
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { baseColors } = useBaseColors();

  const handleAddCombination = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await addNewColor(outerColor, innerColor, rimColor);

      if (response.message === "Color code already exists!") {
        toast.success(
          `This combination already exists with code: ${response.data}`
        );
        setGeneratedCode(response.data);
      } else {
        toast.success(`New color code generated: ${response.colorCode}`);
        setGeneratedCode(response.colorCode);
      }

      // Clear form
      setOuterColor("");
      setInnerColor("");
      setRimColor("");
    } catch (error) {
      toast.error("Failed to add color combination: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-around">
      <div className="my-12 flex flex-col gap-5 items-center w-full max-w-lg">
        <h3 className="text-2xl text-center font-bold mb-7">
          Add new Colour combinations
        </h3>

        <form
          onSubmit={handleAddCombination}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex gap-2 items-center">
            <label className="w-32">Outer Glaze: </label>
            <select
              value={outerColor}
              onChange={(e) => setOuterColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
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
            <label className="w-32">Inner Glaze: </label>
            <select
              value={innerColor}
              onChange={(e) => setInnerColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
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
            <label className="w-32">Rim Colour: </label>
            <select
              value={rimColor}
              onChange={(e) => setRimColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
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
            className="btn btn-success btn-outline mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add New Combination"}
          </button>
        </form>

        {generatedCode && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="font-bold">Generated Code: {generatedCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddColor;
