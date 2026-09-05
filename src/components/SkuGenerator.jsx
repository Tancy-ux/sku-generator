import { useState, useEffect, useMemo } from "react";
import {
  fetchMaterials,
  fetchTypes,
  generateSKU, // For Ceramic/Other Glazes
  fetchProductsByType,
  getMaterialSku, // For Marble/Cement
  addMaterial,
  addProduct,
  checkColorCombo,
  fetchAllCodes,
} from "../functions/api.js";
import toast from "react-hot-toast";
import {
  fetchColorsByMaterial,
  getBaseColors,
  addNewColor,
  addBaseColor,
  addColorByMaterial,
} from "../functions/colors.js";
import { typeToCategoryMap } from "../functions/constants.js";
import { FiPlus, FiCopy } from "react-icons/fi";

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
  const [allSkus, setAllSkus] = useState([]);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(""); // Selected product name
  const [selectedType, setSelectedType] = useState(""); // Selected type name

  const [sku, setSKU] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For SKU generation button
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [isRegisteringCombo, setIsRegisteringCombo] = useState(false);
  const [comboLookup, setComboLookup] = useState({ status: "idle", code: null });

  // Inline "+ New" quick-add — collapsed by default, expanded via the "+" buttons
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterialCode, setNewMaterialCode] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [showAddBaseColor, setShowAddBaseColor] = useState(false);
  const [newBaseColorName, setNewBaseColorName] = useState("");
  const [isAddingBaseColor, setIsAddingBaseColor] = useState(false);

  const [showAddMaterialColor, setShowAddMaterialColor] = useState(false);
  const [newMaterialColorName, setNewMaterialColorName] = useState("");
  const [isAddingMaterialColor, setIsAddingMaterialColor] = useState(false);

  const noColorTypes = ["Box", "Foam", "Wax", "Candle Kit", "Etchings"];
  const showColorDropdowns = !noColorTypes.includes(selectedType);

  useEffect(() => {
    fetchMaterials()
      .then(setMaterials)
      .catch((e) => toast.error("Failed to fetch materials", e));
    fetchTypes()
      .then(setTypes)
      .catch((e) => toast.error("Failed to fetch types", e));
    fetchAllCodes()
      .then((data) => setAllSkus(Array.isArray(data) ? data : []))
      .catch(() => setAllSkus([]));
  }, []);

  const refreshBaseColors = async () => {
    try {
      const response = await getBaseColors();
      const colors = Array.isArray(response?.name)
        ? response.name
        : Array.isArray(response)
          ? response
          : [];
      const sortedColors = colors.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setBaseColors(sortedColors);
    } catch (error) {
      toast.error("Failed to load base colors");
    }
  };

  useEffect(() => {
    refreshBaseColors();
  }, []);

  // Fetch products when type changes
  useEffect(() => {
    // Clear dependent state
    setProducts([]);
    setSelectedProduct("");
    setOuterColor("");
    setInnerColor("");
    setRimColor("");
    setMaterialColor("");

    if (selectedType && selectedType !== "Cutlery") {
      // Ignore Cutlery type if present in list
      setIsLoadingProducts(true);
      const dbCategory = typeToCategoryMap[selectedType];

      if (!dbCategory) {
        toast.error(`No DB category mapping for type: ${selectedType}`);
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
          toast.error("Error fetching products:", e);
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
          toast.error("Error fetching colors by material:", e);
          toast.error(`Failed to load ${material} colors`);
          setMaterialColors([]); // Ensure empty on error
        });
    }
    // No else needed, state is cleared at the start of the effect
  }, [material]); // Dependency: material

  // Live "does this exact combo exist yet" check — display only, doesn't
  // affect what Generate SKU actually does.
  useEffect(() => {
    if (!outerColor || !innerColor || !rimColor) {
      setComboLookup({ status: "idle", code: null });
      return;
    }
    let cancelled = false;
    setComboLookup({ status: "checking", code: null });
    checkColorCombo(outerColor, innerColor, rimColor).then((result) => {
      if (cancelled) return;
      setComboLookup({ status: result.exists ? "exists" : "new", code: result.code });
    });
    return () => {
      cancelled = true;
    };
  }, [outerColor, innerColor, rimColor]);

  const handleGenerateSKU = async () => {
    setIsLoading(true);
    await Promise.resolve();

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
      material,
    );

    if (!noColorTypes.includes(selectedType)) {
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
    }

    try {
      let response;
      if (noColorTypes.includes(selectedType)) {
        response = await getMaterialSku(
          material,
          "", // color
          selectedType,
          selectedProduct,
        );
      } else if (isMaterialSpecificColor) {
        response = await getMaterialSku(
          material,
          materialColor,
          selectedType,
          selectedProduct,
        );
      } else {
        response = await generateSKU(
          material,
          outerColor,
          innerColor,
          rimColor,
          selectedType,
          selectedProduct,
        );
      }

      if (!response.success) {
        throw new Error(response.error || "Failed to generate SKU");
      }
      const generatedSkuCode = response.skuCode || response.newSKU?.skuCode;
      setSKU(generatedSkuCode);
      toast.success(`SKU Generated: ${generatedSkuCode}`);
    } catch (error) {
      toast.error("Error in handleGenerateSKU:", error);
      if (
        error.response?.data?.message?.includes("Color") ||
        error.message?.includes("Color") ||
        error.response?.status === 400
      ) {
        toast.error(
          "Invalid color combination - please select different colors",
        );
      } else {
        toast.error("Failed to generate SKU");
      }
      setSKU("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCombo = async () => {
    if (!outerColor || !innerColor || !rimColor) return;
    setIsRegisteringCombo(true);
    try {
      const response = await addNewColor(outerColor, innerColor, rimColor);
      if (response.message === "Color code already exists!") {
        toast.success(
          `This combination already exists with code: ${response.data}`,
        );
        setComboLookup({ status: "exists", code: response.data });
      } else {
        toast.success(`New color code generated: ${response.colorCode}`);
        setComboLookup({ status: "exists", code: response.colorCode });
      }
    } catch (error) {
      toast.error("Failed to register color combination: " + error.message);
    } finally {
      setIsRegisteringCombo(false);
    }
  };

  const handleAddMaterialInline = async (e) => {
    e.preventDefault();
    if (!newMaterialName || !newMaterialCode) return;
    setIsAddingMaterial(true);
    try {
      await addMaterial(newMaterialName, newMaterialCode);
      toast.success(`Added material: ${newMaterialName}`);
      const updated = await fetchMaterials();
      setMaterials(updated);
      setMaterial(newMaterialName);
      setNewMaterialName("");
      setNewMaterialCode("");
      setShowAddMaterial(false);
    } catch {
      toast.error("Failed to add material");
    } finally {
      setIsAddingMaterial(false);
    }
  };

  const handleAddProductInline = async (e) => {
    e.preventDefault();
    if (!newProductName || !selectedType) return;
    setIsAddingProduct(true);
    try {
      const dbCategory = typeToCategoryMap[selectedType];
      await addProduct(newProductName, dbCategory);
      toast.success(`Added product: ${newProductName}`);
      const data = await fetchProductsByType(dbCategory);
      const productList = data?.products || data || [];
      setProducts(Array.isArray(productList) ? productList : []);
      setSelectedProduct(newProductName);
      setNewProductName("");
      setShowAddProduct(false);
    } catch {
      toast.error("Failed to add product");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleAddBaseColorInline = async (e) => {
    e.preventDefault();
    if (!newBaseColorName) return;
    setIsAddingBaseColor(true);
    try {
      await addBaseColor({ name: newBaseColorName });
      toast.success(`Added base color: ${newBaseColorName}`);
      await refreshBaseColors();
      setNewBaseColorName("");
      setShowAddBaseColor(false);
    } catch {
      toast.error("Failed to add base color");
    } finally {
      setIsAddingBaseColor(false);
    }
  };

  const handleAddMaterialColorInline = async (e) => {
    e.preventDefault();
    if (!newMaterialColorName || !material) return;
    setIsAddingMaterialColor(true);
    try {
      await addColorByMaterial(material, newMaterialColorName);
      const updated = await fetchColorsByMaterial(material);
      setMaterialColors(updated);
      setMaterialColor(newMaterialColorName);
      setNewMaterialColorName("");
      setShowAddMaterialColor(false);
    } catch {
      toast.error(`Failed to add ${material} color`);
    } finally {
      setIsAddingMaterialColor(false);
    }
  };

  const handleCopyCode = () => {
    if (!sku) return;
    navigator.clipboard.writeText(sku);
    toast.success("Code copied!");
  };

  // --- Derived display values ---
  const isMaterialSpecificColor = ["Marble", "Cork", "Cement"].includes(
    material,
  );
  const glazeFieldsSet = [innerColor, outerColor, rimColor].filter(
    Boolean,
  ).length;

  const selectedMaterialObj = materials.find((m) => m.name === material);
  const selectedTypeObj = types.find((t) => t.name === selectedType);
  const selectedProductObj = products.find((p) => p.name === selectedProduct);

  const comboCodeStr = isMaterialSpecificColor
    ? (() => {
        const colorObj = materialColors.find((c) => c.color === materialColor);
        return colorObj ? String(colorObj.code).padStart(3, "0") : null;
      })()
    : comboLookup.code != null
      ? String(comboLookup.code).padStart(3, "0")
      : null;

  const previewCode =
    sku ||
    [
      selectedMaterialObj?.code,
      showColorDropdowns ? comboCodeStr : null,
      selectedTypeObj?.code,
      selectedProductObj?.design_code,
    ]
      .map((p) => p ?? "···")
      .join("");

  const comboUsage = useMemo(() => {
    if (isMaterialSpecificColor || !outerColor || !innerColor || !rimColor) {
      return null;
    }
    const count = allSkus.filter(
      (s) =>
        s.color_i === innerColor &&
        s.color_o === outerColor &&
        s.color_r === rimColor,
    ).length;
    const allSame = outerColor === innerColor && innerColor === rimColor;
    return { count, allSame };
  }, [allSkus, isMaterialSpecificColor, outerColor, innerColor, rimColor]);

  const showPreviewPanel =
    material && selectedType && selectedType !== "Cutlery" && selectedProduct;

  const generateDisabled =
    isLoading ||
    !material ||
    !selectedType ||
    !selectedProduct ||
    selectedType === "Cutlery" ||
    (showColorDropdowns &&
      ((isMaterialSpecificColor && !materialColor) ||
        (!isMaterialSpecificColor &&
          (!outerColor || !innerColor || !rimColor))));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Generate SKU</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Pick a material, typology, product, and glaze trio.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-5">
        {/* Material / Typology */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-base-content/60">
              Material
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="select select-bordered flex-1"
              >
                <option value="">Select Material</option>
                {[...materials]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((mat, idx) => (
                    <option key={idx} value={mat.name}>
                      {mat.name} - {mat.code}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddMaterial((v) => !v)}
                className="btn btn-square btn-sm btn-outline"
                title="Add a new material"
              >
                <FiPlus size={14} />
              </button>
            </div>
            {showAddMaterial && (
              <form
                onSubmit={handleAddMaterialInline}
                className="flex gap-2 items-center mt-1"
              >
                <input
                  type="text"
                  value={newMaterialCode}
                  onChange={(e) => setNewMaterialCode(e.target.value)}
                  placeholder="Code"
                  maxLength={4}
                  className="input input-xs input-bordered w-16"
                  required
                />
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="Material name"
                  className="input input-xs input-bordered flex-1"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-xs btn-primary btn-outline"
                  disabled={isAddingMaterial}
                >
                  {isAddingMaterial ? "Adding..." : "Add"}
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-base-content/60">
              Typology
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select Type</option>
              {[...types]
                .filter((type) => type.name !== "Cutlery")
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((type, idx) => (
                  <option key={idx} value={type.name}>
                    {type.name} - {type.code}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-base-content/60">
            Product name
          </label>
          <div className="flex gap-2 items-center">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="select select-bordered flex-1"
              disabled={
                !selectedType ||
                isLoadingProducts ||
                products.length === 0 ||
                selectedType === "Cutlery"
              }
            >
              <option value="">Select Product</option>
              {isLoadingProducts ? (
                <option disabled>Loading...</option>
              ) : (
                products.map((product, idx) => (
                  <option key={idx} value={product.name}>
                    {product.name} - {product.design_code}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={() => setShowAddProduct((v) => !v)}
              className="btn btn-square btn-sm btn-outline"
              disabled={!selectedType || selectedType === "Cutlery"}
              title="Add a new product"
            >
              <FiPlus size={14} />
            </button>
          </div>
          {!isLoadingProducts &&
            selectedType &&
            selectedType !== "Cutlery" &&
            products.length === 0 && (
              <p className="text-sm text-error">
                No products for "{selectedType}"
              </p>
            )}
          {showAddProduct && (
            <form
              onSubmit={handleAddProductInline}
              className="flex gap-2 items-center mt-1"
            >
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Product name"
                className="input input-xs input-bordered flex-1"
                required
              />
              <button
                type="submit"
                className="btn btn-xs btn-primary btn-outline"
                disabled={isAddingProduct}
              >
                {isAddingProduct ? "Adding..." : "Add"}
              </button>
            </form>
          )}
        </div>

        {/* --- Conditional Color Selection --- */}
        {material && selectedType && selectedType !== "Cutlery" && showColorDropdowns && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-base-content/70">
                {isMaterialSpecificColor
                  ? `${material} Colour`
                  : "Glaze combination"}
              </h2>
              {!isMaterialSpecificColor && (
                <span className="text-xs text-base-content/50">
                  {glazeFieldsSet} of 3 set
                </span>
              )}
            </div>

            {isMaterialSpecificColor ? (
              <div className="flex flex-col gap-1">
                <select
                  value={materialColor}
                  onChange={(e) => setMaterialColor(e.target.value)}
                  className="select select-bordered w-60"
                >
                  <option value="">Select {material} Color</option>
                  {materialColors.map((colorObj, idx) => (
                    <option key={idx} value={colorObj.color}>
                      {colorObj.color} - {colorObj.code}
                    </option>
                  ))}
                </select>
                {showAddMaterialColor ? (
                  <form
                    onSubmit={handleAddMaterialColorInline}
                    className="flex gap-2 items-center mt-1"
                  >
                    <input
                      type="text"
                      value={newMaterialColorName}
                      onChange={(e) => setNewMaterialColorName(e.target.value)}
                      placeholder="Color name"
                      className="input input-xs input-bordered flex-1 max-w-48"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-xs btn-primary btn-outline"
                      disabled={isAddingMaterialColor}
                    >
                      {isAddingMaterialColor ? "Adding..." : "Add"}
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddMaterialColor(true)}
                    className="link link-hover text-xs text-primary self-start mt-1"
                  >
                    + New {material.toLowerCase()} color
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Inner Glaze
                    </label>
                    <select
                      value={innerColor}
                      onChange={(e) => setInnerColor(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select</option>
                      {baseColors.map((col, idx) => (
                        <option key={idx} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Outer Glaze
                    </label>
                    <select
                      value={outerColor}
                      onChange={(e) => setOuterColor(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select</option>
                      {baseColors.map((col, idx) => (
                        <option key={idx} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Rim Color
                    </label>
                    <select
                      value={rimColor}
                      onChange={(e) => setRimColor(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select</option>
                      {baseColors.map((col, idx) => (
                        <option key={idx} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {showAddBaseColor ? (
                    <form
                      onSubmit={handleAddBaseColorInline}
                      className="flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={newBaseColorName}
                        onChange={(e) => setNewBaseColorName(e.target.value)}
                        placeholder="Color name"
                        className="input input-xs input-bordered w-32"
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn btn-xs btn-primary btn-outline"
                        disabled={isAddingBaseColor}
                      >
                        {isAddingBaseColor ? "Adding..." : "Add"}
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddBaseColor(true)}
                      className="link link-hover text-xs text-primary"
                    >
                      + New base color
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* SKU Preview */}
        {showPreviewPanel && (
          <div className="bg-base-200 border border-base-300 rounded-box p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                SKU Preview
              </span>
              {showColorDropdowns && !isMaterialSpecificColor && comboLookup.status === "exists" && (
                <span className="badge badge-success badge-outline">Existing combo</span>
              )}
              {showColorDropdowns && !isMaterialSpecificColor && comboLookup.status === "new" && (
                <span className="badge badge-warning badge-outline">New combination</span>
              )}
            </div>

            <div className="font-mono text-2xl font-bold tracking-wide">
              {previewCode}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-base-content/60">
              <div>
                <div className="uppercase tracking-wide text-[10px]">Material</div>
                <div className="text-base-content">{material || "—"}</div>
              </div>
              <div>
                <div className="uppercase tracking-wide text-[10px]">Glaze combo</div>
                <div className="text-base-content">{comboCodeStr || "—"}</div>
              </div>
              <div>
                <div className="uppercase tracking-wide text-[10px]">Type</div>
                <div className="text-base-content">{selectedType || "—"}</div>
              </div>
              <div>
                <div className="uppercase tracking-wide text-[10px]">Product</div>
                <div className="text-base-content">{selectedProduct || "—"}</div>
              </div>
            </div>

            {showColorDropdowns && !isMaterialSpecificColor && comboLookup.status === "exists" && comboUsage && (
              <p className="text-xs text-success flex items-center gap-1">
                ✓ Combo {comboCodeStr}
                {comboUsage.allSame ? ` matches ${outerColor} ×3` : ""} · used on{" "}
                {comboUsage.count} other SKU{comboUsage.count === 1 ? "" : "s"}
              </p>
            )}

            {showColorDropdowns && !isMaterialSpecificColor && comboLookup.status === "new" && (
              <div className="flex items-center gap-3">
                <p className="text-xs text-warning">
                  This exact combo isn't registered yet — register it to enable Generate.
                </p>
                <button
                  type="button"
                  onClick={handleRegisterCombo}
                  className="btn btn-xs btn-outline btn-secondary"
                  disabled={isRegisteringCombo}
                >
                  {isRegisteringCombo ? "Registering..." : "Register Combination"}
                </button>
              </div>
            )}

            <div className="flex gap-2 items-center pt-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn btn-sm btn-outline"
                disabled={!sku}
                title={sku ? "Copy code" : "Generate the SKU first"}
              >
                <FiCopy size={14} /> Copy code
              </button>
              <button
                onClick={handleGenerateSKU}
                disabled={generateDisabled}
                className="btn btn-sm btn-primary"
              >
                {isLoading ? "Generating..." : "Generate SKU"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
