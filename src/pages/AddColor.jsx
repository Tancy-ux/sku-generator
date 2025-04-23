import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ShowCeramic from "../components/ShowCeramic";
import { addNewColor, addBaseColor, getBaseColors } from "../functions/colors";

const AddColor = () => {
  // States for combination creation
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");

  // State for base color addition
  const [newBaseColor, setNewBaseColor] = useState("");

  const [generatedCode, setGeneratedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseColors, setBaseColors] = useState([]);
  const [activeTab, setActiveTab] = useState("combination"); // 'combination' or 'base'

  // Fetch base colors on mount
  useEffect(() => {
    const fetchBaseColors = async () => {
      try {
        const response = await getBaseColors();
        const colors = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setBaseColors(colors);
      } catch (error) {
        toast.error("Failed to load base colors");
      }
    };
    fetchBaseColors();
  }, []);

  const handleAddBaseColor = async (e) => {
    e.preventDefault();
    if (!newBaseColor) return;

    setIsSubmitting(true);
    try {
      await addBaseColor({ name: newBaseColor });
      toast.success(`Added base color: ${newBaseColor}`);
      setNewBaseColor("");
      // Refresh base colors list
      const response = await getBaseColors();
      const colors = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setBaseColors(colors);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add base color");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Tab Selection */}
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === "combination" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("combination")}
          >
            Create Combination
          </button>
          <button
            className={`tab ${activeTab === "base" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("base")}
          >
            Add Base Color
          </button>
        </div>

        {activeTab === "combination" ? (
          <>
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
          </>
        ) : (
          <>
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
                  <div
                    key={index}
                    className="badge badge-primary badge-outline"
                  >
                    {color.name}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {/* <ShowCeramic /> */}
    </div>
  );
};

export default AddColor;
