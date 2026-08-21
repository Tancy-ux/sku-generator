import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";

import { fetchProductsByType, fetchTypes } from "../functions/api";
import { deleteProduct, updateProduct } from "../functions/colors";
import Skeleton from "./common/Skeleton";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { typeToCategoryMap } from "../functions/constants";

const ShowProducts = () => {
  const [types, setTypes] = useState([]);
  const [productsByType, setProductsByType] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const typeData = await fetchTypes();
        setTypes(typeData);

        const entries = await Promise.all(
          typeData.map(async (type) => {
            const category = typeToCategoryMap[type.name];
            const data = await fetchProductsByType(category);
            return [type.name, data.products || []];
          }),
        );
        setProductsByType(Object.fromEntries(entries));
      } catch (error) {
        toast.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const typesWithProducts = useMemo(
    () =>
      types
        .filter((type) => (productsByType[type.name] || []).length > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [types, productsByType],
  );

  const products = selectedType ? productsByType[selectedType] || [] : [];

  if (isLoading) {
    return <Skeleton />;
  }

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
      await updateProduct(editingProduct._id, editedName);
      setProductsByType((prev) => ({
        ...prev,
        [selectedType]: prev[selectedType].map((p) =>
          p._id === editingProduct._id ? { ...p, name: editedName } : p,
        ),
      }));
      toast.success("Product updated successfully!");
      setEditingProduct(null);
    } catch (error) {
      toast.error(
        error.message || "Something went wrong while updating product.",
      );
    }
  };

  const handleDeleteProduct = (productId) => {
    setProductToDeleteId(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(productToDeleteId);
      setProductsByType((prev) => ({
        ...prev,
        [selectedType]: prev[selectedType].filter(
          (p) => p._id !== productToDeleteId,
        ),
      }));
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error(
        error.message || "Something went wrong while deleting product.",
      );
    } finally {
      setShowDeleteModal(false);
      setProductToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDeleteId(null);
  };

  return (
    <div>
      <div className="my-10">
        <h2 className="text-2xl font-semibold text-center mb-4">
          View All Products by Typology
        </h2>
        {typesWithProducts.length === 0 ? (
          <p className="text-center text-base-content/60">
            No products found yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {typesWithProducts.map((type, idx) => (
              <button
                key={type._id || idx}
                type="button"
                onClick={() =>
                  setSelectedType(selectedType === type.name ? "" : type.name)
                }
                className={`badge badge-lg cursor-pointer transition-colors ${
                  selectedType === type.name
                    ? "badge-primary"
                    : "badge-outline hover:border-primary hover:text-primary"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((prod, idx) => (
          <div
            key={idx}
            className="border border-base-300 bg-base-100 p-4 rounded-box shadow-sm flex flex-col justify-between"
          >
            {editingProduct?._id === prod._id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="input input-bordered input-sm"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveProduct}
                    className="btn btn-sm btn-primary"
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
                  <p className="text-primary font-mono text-sm">{prod.design_code}</p>
                  <button
                    onClick={() => handleEditClick(prod)}
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod._id)}
                    className="btn btn-sm btn-soft btn-error btn-outline"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && selectedType && (
        <p className="text-base-content/60 text-center text-lg mt-4">
          No products found for this type.
        </p>
      )}

      {showDeleteModal && (
        <dialog className="modal" open>
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete this product?
            </p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="btn btn-sm btn-error btn-outline"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="btn btn-sm btn-neutral"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ShowProducts;
