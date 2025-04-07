import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { addProduct, fetchTypes } from "../functions/api";
import ShowProducts from "../components/ShowProducts";

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

const AddProduct = () => {
  const [types, setTypes] = useState([]);
  const [product, setProduct] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTypes().then(setTypes);
  }, []);

  const confirmModal = () => {
    if (!selectedType || !product.trim()) {
      toast.error("Please select a typology and enter a product name.");
      return;
    }
    setShowModal(true);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    setShowModal(false);
    const category = typeToCategoryMap[selectedType];
    try {
      await addProduct(product, category);
      toast.success("New Product added successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong - can't add new product.");
    } finally {
      setIsLoading(false);
      setProduct("");
      setSelectedType("");
    }
  };
  return (
    <div>
      <h3 className="text-lg font-bold my-6">Add New Products</h3>

      <div className="flex flex-col my-4 gap-5 justify-center items-start">
        <div>
          <label>Typology: </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-lg px-2 py-1"
          >
            <option value="">Select Type of Product</option>
            {types.map((type, idx) => (
              <option key={idx} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label>Product name: </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="border rounded-lg px-2 py-1"
          />
        </div>

        <button
          disabled={isLoading}
          onClick={confirmModal}
          className="bg-green-700 text-white px-4 btn btn-sm my-2"
        >
          {isLoading ? "Adding..." : "Add Product"}
        </button>

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="p-6 bg-gray-700 rounded-lg shadow-lg w-96">
              <h2 className="text-lg  font-semibold mb-4">
                Confirm Product Addition
              </h2>
              <p className="mb-4 text-sm font-light">
                Are you sure you want to add <strong>{product}</strong> under{" "}
                <strong>{selectedType}</strong>?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-success btn-outline"
                  onClick={handleAddProduct}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Yes, Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ShowProducts />
    </div>
  );
};

export default AddProduct;
