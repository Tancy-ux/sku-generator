import { useEffect, useState } from "react";
import { fetchProductsByType, fetchTypes } from "../functions/api";
import { updateProduct } from "../functions/colors";

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
  };

  const handleSaveProduct = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
    } catch (error) {}
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
          className="border rounded-lg px-2 py-1"
        >
          <option value="">-- Select a Type --</option>
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
            <div className="flex justify-between gap-3">
              <p>{prod.name}</p>
              <p className="text-pink-400">{prod.design_code}</p>
            </div>
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
