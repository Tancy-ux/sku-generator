import { useState } from "react";
import toast from "react-hot-toast";

import ShowCeramic from "../components/ShowCeramic";
import { addNewColor } from "../functions/colors";

const AddColor = () => {
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await addNewColor({
        outerColor,
        innerColor,
        rimColor,
      });

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
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-around">
      <div className="my-12 flex flex-col gap-5 items-center">
        <h3 className="text-2xl text-center font-bold mb-7">
          Add new Colour combinations
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <div className="flex gap-2 items-center">
            <label className="w-32">Outer Glaze: </label>
            <input
              type="text"
              value={outerColor}
              onChange={(e) => setOuterColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
              required
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="w-32">Inner Glaze: </label>
            <input
              type="text"
              value={innerColor}
              onChange={(e) => setInnerColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
              required
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="w-32">Rim Colour: </label>
            <input
              type="text"
              value={rimColor}
              onChange={(e) => setRimColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-outline mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add New Colour Combination"}
          </button>
        </form>

        {generatedCode && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-bold text-lg mb-2">Generated Color Code:</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: outerColor }}
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: innerColor }}
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: rimColor }}
                />
              </div>
              <span className="font-mono font-bold text-xl">
                #{generatedCode}
              </span>
            </div>
          </div>
        )}
      </div>
      <ShowCeramic />
    </div>
  );
};

export default AddColor;
