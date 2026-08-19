import { useState } from "react";
import toast from "react-hot-toast";
import { addBaseColor } from "../functions/colors";
import { useBaseColors } from "../hooks/useBaseColors";

const AddBaseColor = () => {
  const [newBaseColor, setNewBaseColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { baseColors, refreshBaseColors } = useBaseColors();

  const handleAddBaseColor = async (e) => {
    e.preventDefault();
    if (!newBaseColor) return;

    setIsSubmitting(true);
    try {
      await addBaseColor({ name: newBaseColor });
      toast.success(`Added base color: ${newBaseColor}`);
      setNewBaseColor("");
      await refreshBaseColors();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add base color");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-around">
      <div className="my-12 flex flex-col gap-5 items-center w-full max-w-lg">
        <h3 className="text-2xl text-center font-bold mb-7">
          Add Base Color
        </h3>

        <form
          onSubmit={handleAddBaseColor}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex gap-2 items-center">
            <label className="w-32">Color Name: </label>
            <input
              type="text"
              value={newBaseColor}
              onChange={(e) => setNewBaseColor(e.target.value)}
              className="border rounded-lg px-2 py-1 flex-1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-outline mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Base Color"}
          </button>
        </form>

        <div className="mt-4 w-full">
          <h4 className="font-bold mb-2">Existing Base Colors:</h4>
          <div className="grid grid-cols-3 gap-2">
            {baseColors.map((color, index) => (
              <div key={index} className="badge badge-primary badge-outline">
                {color.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBaseColor;
