import { useState, useEffect } from "react";
import {
  fetchMaterials,
  fetchTypes,
  generateSKU, // For Ceramic/Other Glazes
  fetchProductsByType,
  getMaterialSku, // For Marble/Cement
} from "../functions/api.js";
import toast from "react-hot-toast";
import { fetchColorsByMaterial, getBaseColors } from "../functions/colors.js";

const typeToCategoryMap = {
  Accessories: "Accessories",
  "Accessories Set": "accessories_set",
  Bowls: "Bowls",
  "Bowls Set": "bowls_set",
  "Cups / Mugs": "cups",
  "Cups / Mugs Set": "cups_set",
  Plates: "Plates",
  "Plates Set": "plates_set",
  Platter: "platter",
  "Platter Sets": "platter_sets",
  "Table Linens": "tablinen",
  "Table Linens Set": "table_linens_set",
  "Table Settings": "table_settings",
  Vases: "vases",
  "Vases Set": "vases_set",
  "Candle Stand": "candlestand",
  "Candle Stand Set": "candle_stand_set",
  Trinket: "trinket",
  "Trinket Set": "trinket_set",
  "Tissue Box": "tissuebox",
  Cutlery: "cutlery",
};

export default function SKUGenerator() {
  // --- State ---
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);
  const [material, setMaterial] = useState(""); // Selected material name

  const [outerColor, setOuterColor] = useState(""); // For Ceramic Outer Glaze
  const [innerColor, setInnerColor] = useState(""); // For Ceramic Inner Glaze
  const [rimColor, setRimColor] = useState(""); // For Ceramic Rim Glaze

  const [materialColor, setMaterialColor] = useState(""); // For selected Marble/Cement color name
  const [materialColors, setMaterialColors] = useState([]); // Options for Marble/Cement colors { color, code }

  const [baseColors, setBaseColors] = useState([]);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(""); // Selected product name
  const [selectedType, setSelectedType] = useState(""); // Selected type name

  const [sku, setSKU] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For SKU generation button
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    fetchMaterials()
      .then(setMaterials)
      .catch((e) => console.error("Failed to fetch materials", e));
    fetchTypes()
      .then(setTypes)
      .catch((e) => console.error("Failed to fetch types", e));
  }, []);

  useEffect(() => {
    const fetchBaseColors = async () => {
      try {
        const response = await getBaseColors();
        const colors = Array.isArray(response?.name)
          ? response.name
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

  // Fetch products when type changes
  useEffect(() => {
    // Clear dependent state
    setProducts([]);
    setSelectedProduct("");

    // Reset colors relevant to the OTHER material type when type changes,
    // as the material itself might not change but the required colors will.
    setOuterColor("");
    setInnerColor("");
    setRimColor("");
    setMaterialColor(""); // Also clear specific material color selection

    if (selectedType && selectedType !== "Cutlery") {
      // Ignore Cutlery type if present in list
      setIsLoadingProducts(true);
      const dbCategory = typeToCategoryMap[selectedType];

      if (!dbCategory) {
        console.error(`No DB category mapping for type: ${selectedType}`);
        toast.error(`Configuration error for type: ${selectedType}`);
        setIsLoadingProducts(false);
        return; // Stop if type is invalid
      }

      // Fetch products for the selected type category
      fetchProductsByType(dbCategory)
        .then((data) => {
          const productList = data?.products || data || [];
          setProducts(Array.isArray(productList) ? productList : []);
        })
        .catch((e) => {
          console.error("Error fetching products:", e);
          toast.error("Failed to load products");
          setProducts([]); // Ensure empty on error
        })
        .finally(() => setIsLoadingProducts(false));
    } else {
      setIsLoadingProducts(false); // Ensure loading stops if type is cleared or is Cutlery
      setProducts([]); // Explicitly clear products if type is empty or Cutlery
      setSelectedProduct("");
    }
  }, [selectedType]); // Dependency: selectedType

  // Fetch material-specific colors (Marble/Cement) when material changes
  useEffect(() => {
    // Clear dependent state
    setMaterialColors([]);
    setMaterialColor("");

    // Also clear Ceramic colors when material changes, as they become irrelevant
    setOuterColor("");
    setInnerColor("");
    setRimColor("");

    if (material && ["Marble", "Cork", "Cement"].includes(material)) {
      fetchColorsByMaterial(material)
        .then(setMaterialColors) // Expecting array of { color, code }
        .catch((e) => {
          console.error("Error fetching colors by material:", e);
          toast.error(`Failed to load ${material} colors`);
          setMaterialColors([]); // Ensure empty on error
        });
    }
    // No else needed, state is cleared at the start of the effect
  }, [material]); // Dependency: material

  const handleGenerateSKU = async () => {
    setIsLoading(true);
    await Promise.resolve();

    // Validate inputs first (synchronous checks)
    if (!material || !selectedType || !selectedProduct) {
      setIsLoading(false);
      toast.error("Please select Material, Typology, and Product Name.");
      return;
    }

    if (selectedType === "Cutlery") {
      setIsLoading(false);
      toast.error("Cutlery SKU generation is not currently supported.");
      return;
    }

    const isMaterialSpecificColor = ["Marble", "Cork", "Cement"].includes(
      material
    );

    // Validate color selections
    if (isMaterialSpecificColor && !materialColor) {
      setIsLoading(false);
      toast.error(`Please select a ${material} color.`);
      return;
    } else if (
      !isMaterialSpecificColor &&
      (!outerColor || !innerColor || !rimColor)
    ) {
      setIsLoading(false);
      toast.error("Please select Outer, Inner, and Rim colors.");
      return;
    }

    // Now perform the async operation
    try {
      const response = isMaterialSpecificColor
        ? await getMaterialSku(
            material,
            materialColor,
            selectedType,
            selectedProduct
          )
        : await generateSKU(
            material,
            outerColor,
            innerColor,
            rimColor,
            selectedType,
            selectedProduct
          );

      if (!response.success) {
        throw new Error(response.error || "Failed to generate SKU");
      }

      const generatedSkuCode = response.skuCode || response.newSKU?.skuCode;

      setSKU(generatedSkuCode);
      toast.success(`SKU Generated: ${generatedSkuCode}`);
    } catch (error) {
      console.error("Error in handleGenerateSKU:", error);
      if (
        error.response?.data?.message?.includes("Color") ||
        error.message?.includes("Color") ||
        error.response?.status === 400
      ) {
        toast.error(
          "Invalid color combination - please select different colors"
        );
      } else {
        toast.error("Failed to generate SKU");
      }
      setSKU("");
    } finally {
      setIsLoading(false);
    }
  };
  // --- JSX Return ---
  const isMaterialSpecificColor = ["Marble", "Cork", "Cement"].includes(
    material
  );

  // if (isLoadingProducts || isLoading) {
  //   return (
  //     <div className="p-5 flex items-center justify-center mt-10">
  //       <div className="text-center flex items-center justify-center gap-4">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
  //         <p className="text-lg">Loading... </p>

  //         <span className="loading loading-bars loading-xs"></span>
  //         <span className="loading loading-bars loading-sm"></span>
  //         <span className="loading loading-bars loading-md"></span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-5 mt-20 flex flex-col gap-5">
      {/* Material Dropdown */}
      <div className="my-4">
        <label>Material: </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="border rounded-2xl px-2 py-1 w-50"
        >
          <option value="">Select Material</option>
          {materials.map((mat, idx) => (
            <option key={idx} value={mat.name}>
              {mat.name} - {mat.code}
            </option>
          ))}
        </select>
      </div>
      {/* Typology and Product Dropdowns */}
      <div className="flex my-4 gap-5 items-center flex-wrap">
        {" "}
        {/* Added flex-wrap */}
        <div>
          <label>Typology: </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-2xl px-2 py-1 w-64"
          >
            <option value="">Select Type</option>
            {types
              .filter((type) => type.name !== "Cutlery") // Filter out Cutlery from options
              .map((type, idx) => (
                <option key={idx} value={type.name}>
                  {type.name} - {type.code}
                </option>
              ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label>Product Name: </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border rounded-2xl px-2 py-1 w-80"
            disabled={
              !selectedType ||
              isLoadingProducts ||
              products.length === 0 ||
              selectedType === "Cutlery"
            }
          >
            <option value="">Select Product</option>
            {isLoadingProducts ? (
              <div>Loading...</div>
            ) : (
              products.map((product, idx) => (
                <option key={idx} value={product.name}>
                  {product.name} - {product.design_code}
                </option>
              ))
            )}
          </select>
          {/* Optional: Show 'No products' message */}
          {!isLoadingProducts &&
            selectedType &&
            selectedType !== "Cutlery" &&
            products.length === 0 && (
              <p className="text-sm text-red-600 ml-2">
                No products for "{selectedType}"
              </p>
            )}
        </div>
      </div>
      {/* --- Conditional Color Selection --- */}
      {/* Show only if material and type are selected, and type is not Cutlery */}
      {material && selectedType && selectedType !== "Cutlery" && (
        <>
          <h2 className="font-bold italic text-lg">
            {isMaterialSpecificColor ? `${material} Colour` : "Product Colours"}
          </h2>

          {isMaterialSpecificColor ? (
            // --- Marble/Cement Color Picker ---
            <div className="mb-4">
              <label>{material} Color: </label>
              <select
                value={materialColor}
                onChange={(e) => setMaterialColor(e.target.value)}
                className="border rounded-2xl px-2 py-1 w-60"
              >
                <option value="">Select {material} Color</option>
                {materialColors.map((colorObj, idx) => (
                  <option key={idx} value={colorObj.color}>
                    {" "}
                    {/* Value is the color name */}
                    {colorObj.color} - {colorObj.code}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // --- Ceramic/Other Color Pickers ---
            <div className="flex gap-5 items-center flex-wrap">
              {" "}
              {/* Added flex-wrap */}
              <div>
                <label>Inner Glaze: </label>
                <select
                  value={innerColor}
                  onChange={(e) => setInnerColor(e.target.value)}
                  className="border rounded-2xl px-2 py-1"
                >
                  <option value="">Select Inner Color</option>
                  {baseColors.map((col, idx) => (
                    <option key={idx} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Outer Glaze: </label>
                <select
                  value={outerColor}
                  onChange={(e) => setOuterColor(e.target.value)}
                  className="border rounded-2xl px-2 py-1"
                >
                  <option value="">Select Outer Color</option>
                  {baseColors.map((col, idx) => (
                    <option key={idx} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Rim Color: </label>
                <select
                  value={rimColor}
                  onChange={(e) => setRimColor(e.target.value)}
                  className="border rounded-2xl px-2 py-1"
                >
                  <option value="">Select Rim Color</option>
                  {baseColors.map((col, idx) => (
                    <option key={idx} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}{" "}
      {/* End Conditional Color Selection */}
      {/* Generate Button and SKU Display */}
      <div className="my-4 flex gap-2 items-center">
        <button
          onClick={handleGenerateSKU}
          // Disable button if loading OR if required fields for the current path aren't met
          disabled={
            isLoading ||
            !material ||
            !selectedType ||
            !selectedProduct ||
            selectedType === "Cutlery" || // Disable if Cutlery selected
            (isMaterialSpecificColor && !materialColor) || // Disable if Marble/Cement color missing
            (!isMaterialSpecificColor &&
              (!outerColor || !innerColor || !rimColor)) // Disable if Ceramic colors missing
          }
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed" // Added padding/rounding/hover/disabled styles
        >
          {isLoading ? "Generating..." : "Generate SKU"}
        </button>
        {sku && (
          <p>
            Generated SKU: <strong className="text-pink-300">{sku}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
