import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { addProduct, fetchTypes } from "../functions/api";
import ShowProducts from "../components/ShowProducts";
import { typeToCategoryMap } from "../functions/constants";

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
      toast.error("Something went wrong - can't add new product.");
    } finally {
      setIsLoading(false);
      setProduct("");
      setSelectedType("");
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold">Add Products</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Register a new product under a typology.
        </p>
        <div className="h-0.5 w-8 bg-primary rounded-full mt-3"></div>
      </div>
      <div className="bg-base-100 border border-base-300 rounded-box p-6">
        <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
          <div className="w-full">
            <label>Typology: </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select Type of Product</option>
              {types
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((type, idx) => (
                  <option key={idx} value={type.name}>
                    {type.name} - {type.code}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-full">
            <label>Product name: </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <button
            disabled={isLoading}
            onClick={confirmModal}
            className="btn btn-primary btn-sm my-2"
          >
            {isLoading ? "Adding..." : "Add Product"}
          </button>

          {showModal && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40">
              <div className="p-6 bg-base-100 border border-base-300 rounded-box shadow-lg w-96">
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
      </div>
      <ShowProducts />
    </div>
  );
};

export default AddProduct;
