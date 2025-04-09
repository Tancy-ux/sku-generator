import { useState, useEffect } from "react";
import {
  fetchMaterials,
  fetchTypes,
  getColorCode,
  generateSKU,
  fetchColors,
  fetchProductsByType,
  getDesignCode,
} from "../functions/api.js";
import toast from "react-hot-toast";
import { fetchCutleryColors } from "../functions/colors.js";

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

  // "Box": "boxes",
  // "Bags": "bags",
  // "Stainless Steel": "stainless_steel",
  // "Foam": "foamcuts",
  // "Envelopes": "envelopes",
  // "Ribbons": "ribbons"
};

export default function SKUGenerator() {
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);
  const [outerColor, setOuterColor] = useState("");
  const [innerColor, setInnerColor] = useState("");
  const [rimColor, setRimColor] = useState("");
  const [material, setMaterial] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [sku, setSKU] = useState("");

  const [outerColors, setOuterColors] = useState([]);
  const [innerColors, setInnerColors] = useState([]);
  const [rimColors, setRimColors] = useState([]);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [designCode, setDesignCode] = useState("");

  const [cutleryColors, setCutleryColors] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMaterials().then((data) => {
      setMaterials(data);
    });
    fetchTypes().then(setTypes);
    fetchColors().then(({ outerColors, innerColors, rimColors }) => {
      setOuterColors(outerColors);
      setInnerColors(innerColors);
      setRimColors(rimColors);
    });
  }, []);

  useEffect(() => {
    console.log("Design code changed:", designCode);
  }, [designCode]);

  useEffect(() => {
    if (selectedType) {
      setIsLoadingProducts(true);
      const dbCategory = typeToCategoryMap[selectedType];

      if (selectedType === "Cutlery") {
        fetchCutleryColors().then((colors) => {
          setCutleryColors(colors);
          setOuterColors([]);
          setInnerColors([]);
          setRimColors([]);
        });
      }
      fetchProductsByType(dbCategory)
        .then((data) => {
          const products = data.products || data || [];
          setProducts(products);
          setSelectedProduct("");
        })
        .catch((e) => {
          console.error("Error fetching products:", e);
          toast.error("Failed to load products");
          setProducts([]);
        })
        .finally(() => setIsLoadingProducts(false));
    } else {
      setProducts([]);
      setSelectedProduct("");
    }
  }, [selectedType]);

  // const handleGetColorCode = async () => {
  //   if (!outerColor || !innerColor || !rimColor) {
  //     toast.error("Please select all colors for the code.");
  //     return;
  //   }
  //   const code = await getColorCode(outerColor, innerColor, rimColor);
  //   if (code !== null && code !== undefined) {
  //     setColorCode(code);
  //   } else {
  //     console.error("No valid color code received.");
  //     toast.error("No valid color code received.");
  //   }
  // };

  // const handleDesignCode = async () => {
  //   if (!selectedProduct) {
  //     toast.error("Please select a product to get the design code.");
  //     return;
  //   }
  //   try {
  //     const code = await getDesignCode(selectedProduct);
  //     if (code) {
  //       setDesignCode(code);
  //       console.log("Design code:", code);
  //       toast.success("Design code fetched successfully!");
  //     } else {
  //       toast.error("No design code found for the selected product.");
  //       setDesignCode("");
  //     }
  //   } catch (error) {
  //     toast.error("Error fetching design code");
  //     console.error("Error fetching design code:", error);
  //   }
  // };

  const handleGenerateSKU = async () => {
    if (!isLoading) {
      setIsLoading(true);
    }
    try {
      if (!material || !selectedType) {
        toast.error(
          "Please select a material and typology before generating SKU."
        );
        return;
      }

      // for ceramic
      if (!selectedProduct || !outerColor || !innerColor || !rimColor) {
        toast.error("Please select all options before generating SKU.");
        return;
      }

      const skuCode = await generateSKU(
        material,
        outerColor,
        innerColor,
        rimColor,
        selectedType,
        selectedProduct
      );
      setSKU(skuCode);
      console.log("Generated SKU:", skuCode);
    } catch (error) {
      toast.error("Error generating SKU");
      console.error("Error generating SKU:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 flex justify-center flex-col gap-5">
      <div className="my-4">
        <label>Material: </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="border rounded-2xl px-2 py-1"
        >
          <option value="">Select Material</option>
          {materials.map((material, idx) => (
            <option key={idx} value={material.name}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex my-4 gap-5 items-center">
        <div>
          <label>Typology: </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-2xl px-2 py-1"
          >
            <option value="">Select Type</option>
            {types.map((type, idx) => (
              <option key={idx} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label>Product Name: </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="border rounded-2xl px-2 py-1"
            disabled={
              !selectedType || isLoadingProducts || products.length === 0
            }
          >
            <option value="">Select Product</option>
            {isLoadingProducts ? (
              <option className="border-gray-400" disabled>
                Loading...
              </option>
            ) : (
              products.map((product, idx) => (
                <option key={idx} value={product.name}>
                  {product.name}
                </option>
              ))
            )}
          </select>
          {!isLoadingProducts && selectedType && products.length === 0 && (
            <p className="text-sm text-gray-400 mt-1">
              No products available for "{selectedType}"
            </p>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-1">
          Design Code:{" "}
          <span className="text-pink-300">
            <strong>{designCode || "Select a product"}</strong>
          </span>
        </p>
      </div>

      <h2 className="font-bold italic text-lg">
        {selectedType === "Cutlery"
          ? "Cutlery Colours"
          : "Ceramic product Colours"}
      </h2>

      {selectedType === "Cutlery" ? (
        <div className="flex gap-5 items-center">
          <div className="mb-4">
            <label>Handle Color: </label>
            <select
              value={outerColor}
              onChange={(e) => setOuterColor(e.target.value)}
              className="border rounded-2xl px-2 py-1"
            >
              <option value="">Select Handle Color</option>
              {cutleryColors.map((color, idx) => (
                <option key={idx} value={color.handleColor}>
                  {color.handleColor} (Code: {color.code})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Finish Color: </label>
            <select
              value={innerColor}
              onChange={(e) => setInnerColor(e.target.value)}
              className="border rounded-2xl px-2 py-1"
            >
              <option value="">Select Finish Color</option>
              {cutleryColors.map((color, idx) => (
                <option key={idx} value={color.finishColor}>
                  {color.finishColor} (Code: {color.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="flex gap-5 items-center">
          <div className="mb-4">
            <label>Outer Glaze: </label>
            <select
              value={outerColor}
              onChange={(e) => setOuterColor(e.target.value)}
              className="border rounded-2xl px-2 py-1"
            >
              <option value="">Select Outer Color</option>
              {outerColors.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Inner Glaze: </label>
            <select
              value={innerColor}
              onChange={(e) => setInnerColor(e.target.value)}
              className="border rounded-2xl px-2 py-1"
            >
              <option value="">Select Inner Color</option>
              {innerColors.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Rim Color: </label>
            <select
              value={rimColor}
              onChange={(e) => setRimColor(e.target.value)}
              className="border rounded-2xl px-2 py-1"
            >
              <option value="">Select Rim Color</option>
              {rimColors.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex gap-3 items-center">
            {/* <button
            onClick={handleGetColorCode}
            className="bg-green-700 text-white px-4 btn btn-sm my-2"
          >
            Get Color Code
          </button> */}

            {colorCode && (
              <p className="text-sm text-gray-400 mt-1">
                Color Code:{" "}
                <span className="text-pink-300">
                  <strong>{colorCode}</strong>
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="my-4 flex gap-2 items-center">
        <button
          onClick={handleGenerateSKU}
          disabled={isLoading}
          className="bg-green-700 text-white px-4 btn my-2"
        >
          {isLoading ? "Generating..." : "Generate SKU"}
        </button>

        {sku && (
          <p>
            Generated SKU:{" "}
            <span className="text-pink-300">
              <strong>{sku}</strong>
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
