import { useEffect, useState } from "react";
import { fetchProductsByType, fetchTypes } from "../functions/api";
import { updateProduct } from "../functions/colors";
import toast from "react-hot-toast";

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

const ShowProducts = () => {
  const [types, setTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    fetchTypes().then(setTypes);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!selectedType) {
        setProducts([]);
        return;
      }
      const category = typeToCategoryMap[selectedType];
      const data = await fetchProductsByType(category);
      setProducts(data.products);
    };
    fetch();
  }, [selectedType]);

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditedName(product.name);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditedName("");
  };

  const handleSaveProduct = async () => {
    try {
      const updatedProduct = await updateProduct(
        editingProduct._id,
        editedName
      );
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? { ...p, name: editedName } : p
        )
      );
      toast.success("Product updated successfully!");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error.message || "Something went wrong while updating product."
      );
    }
  };

  return (
    <div>
      <div className="my-10 text-center">
        <label className="mr-4 mb-10 text-2xl font-semibold">
          View All Products by Typology:
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border rounded-lg mt-2 px-2 py-1"
        >
          <option value="" className="text-center">
            -- Select a Type --
          </option>
          {types.map((type, idx) => (
            <option key={idx} value={type.name}>
              {type.name} - {type.code}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((prod, idx) => (
          <div
            key={idx}
            className="border border-gray-500 p-4 rounded shadow flex flex-col justify-between"
          >
            {editingProduct?._id === prod._id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveProduct}
                    className="btn btn-sm btn-success"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-sm btn-neutral"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center gap-2">
                <p>{prod.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-pink-400">{prod.design_code}</p>
                  <button
                    onClick={() => handleEditClick(prod)}
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && selectedType && (
        <p className="text-gray-400 text-center text-lg mt-4">
          No products found for this type.
        </p>
      )}
    </div>
  );
};

export default ShowProducts;
