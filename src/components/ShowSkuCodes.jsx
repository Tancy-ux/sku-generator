import { useEffect, useMemo, useState } from "react";
import { fetchAllCodes, fetchTypes } from "../functions/api";
import { FiCopy, FiEdit, FiTrash2 } from "react-icons/fi";
import { deleteSku, editOldSku, fetchOldSkuCodes } from "../functions/colors";
import { SiZincsearch } from "react-icons/si";

const getBadgeColor = (typeCode = "") => {
  if (!typeCode) return "text-gray-500 border-gray-500";
  const hash = Array.from(typeCode).reduce(
    (hash, char) => char.charCodeAt(0) + (hash << 5) - hash,
    0
  );
  const colors = [
    "text-blue-500 border-blue-500",
    "text-yellow-500 border-yellow-500",
    "text-purple-600 border-purple-600",
    "text-pink-700 border-pink-700",
    "text-green-700 border-green-700",
    "text-indigo-500 border-indigo-500",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const ShowSkuCodes = () => {
  const [skus, setSkus] = useState([]);
  const [oldSkus, setOldSkus] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skuToDelete, setSkuToDelete] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const isLoading =
    skus.length === 0 && oldSkus.length === 0 && types.length === 0;

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const [skuData, typeData, oldSkuData] = await Promise.all([
          fetchAllCodes(),
          fetchTypes(),
          fetchOldSkuCodes(),
        ]);

        if (skuData) setSkus(skuData);
        if (typeData) setTypes(typeData);
        if (oldSkuData) setOldSkus(oldSkuData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    getInitialData();
  }, []);

  useEffect(() => {
    setVisibleCount(15);
  }, [searchTerm, activeSearch, selectedType]);

  // Modified filter logic

  const filteredSkus = useMemo(() => {
    const txt = searchTerm.trim().toLowerCase();
    const all = [...skus, ...oldSkus];
    const source =
      activeSearch && txt
        ? all
        : all.filter(
            (s) => selectedType === "all" || s.typeCode === selectedType
          );

    return source
      .filter((sku) => {
        if (!txt) return true;
        const hay = [
          sku.productName || sku.name,
          sku.color,
          sku.skuCode || sku.code,
        ].map((str) => (str || "").toLowerCase());
        return hay.some((part) => part.includes(txt));
      })
      .sort((a, b) => {
        const nameA = (a.productName || a.name || "").toLowerCase();
        const nameB = (b.productName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [searchTerm, activeSearch, selectedType, skus, oldSkus]);

  const visibleSkus = filteredSkus.slice(0, visibleCount);

  const noResults = searchTerm.trim() && filteredSkus.length === 0;

  const handleCopy = (text, index) => {
    const codeToCopy = text.skuCode || text.code || text;
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };
  const handleSaveEdit = async (sku) => {
    try {
      const updated = await editOldSku(sku._id, editValue);
      setOldSkus((prev) =>
        prev.map((item, i) =>
          item._id === sku._id ? { ...item, code: updated.code } : item
        )
      );
      setEditIndex(null);
    } catch (err) {
      console.error("Failed to edit SKU:", err.message);
      alert("Failed to edit SKU. Please try again.");
    }
  };

  const openDeleteModal = (skuCode) => {
    setSkuToDelete(skuCode);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSkuToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (skuToDelete) {
      try {
        await deleteSku(skuToDelete);
        const updatedSkus = skus.filter((sku) => sku.skuCode !== skuToDelete);
        const updatedOldSkus = oldSkus.filter(
          (sku) => sku.code !== skuToDelete
        );
        setSkus(updatedSkus);
        setOldSkus(updatedOldSkus);
        setDeleteError(null);
      } catch (error) {
        console.error("Error deleting SKU:", error);
        setDeleteError("Failed to delete SKU. Please try again.");
      } finally {
        closeDeleteModal(); // Close the modal after the operation
      }
    }
  };

  return (
    <div className="p-6 w-full lg:w-4/5 mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-8 items-center mb-8">
        <h1 className="text-3xl font-semibold">Current SKU Codes</h1>
        <div className="flex items-center">
          {/* Add search bar */}
          <div className="relative w-84">
            <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              <SiZincsearch size={12} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Enter 2 letters to search products..."
              className="input input-bordered pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveSearch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim().length >= 2) {
                  e.preventDefault();
                  setActiveSearch(true);
                }
              }}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={searchTerm.trim().length < 2}
            onClick={() => setActiveSearch(true)}
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm font-medium">
              Filter by Type:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select select-bordered select-sm w-40"
            >
              <option value="all">All Types</option>
              {types.map((type, idx) => (
                <option key={idx} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="text-center">Product Name - Inner Glaze</th>
              <th className="text-center">SKU Code</th>
              <th className="text-center">Type</th>
            </tr>
          </thead>
          <tbody>
            {visibleSkus.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-gray-500">
                  {noResults ? (
                    "No results found"
                  ) : (
                    <p>
                      {isLoading
                        ? "Loading…"
                        : noResults
                        ? "No results found"
                        : `No current SKUs found for selected type.`}
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              visibleSkus.map((sku, idx) => (
                <tr key={idx}>
                  <td className="text-center">
                    {sku.productName || sku.name}{" "}
                    <span className="text-gray-500">{sku.color}</span>
                  </td>
                  <td className="text-center font-mono">
                    <div className="flex items-center justify-center gap-2">
                      {editIndex === idx ? (
                        <>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-32"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit(sku);
                              }
                            }}
                          />
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => handleSaveEdit(sku)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-xs"
                            onClick={() => setEditIndex(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {sku.skuCode || sku.code}
                          <button
                            onClick={() => handleCopy(sku, idx)}
                            className="badge badge-sm ml-1 cursor-pointer"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === idx ? (
                              <span className="text-success">Copied!</span>
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditIndex(idx);
                              setEditValue(sku.code || sku.skuCode); // or sku.skuCode if it's a new SKU
                            }}
                            className="badge badge-sm cursor-pointer text-yellow-500"
                            title="Edit SKU"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() =>
                              openDeleteModal(sku.skuCode || sku.code)
                            }
                            className="badge badge-sm cursor-pointer text-red-700"
                            title="Delete SKU"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="text-center">
                    <span
                      className={`badge badge-sm ${getBadgeColor(
                        sku.typeCode
                      )}`}
                    >
                      {types.find((t) => t.code === sku.typeCode)?.name ||
                        sku.typeCode}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <dialog id="delete_modal" className="modal" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Delete</h3>
              <p className="py-4">
                Are you sure you want to delete SKU:{" "}
                <span className="font-mono">{skuToDelete}</span>?
              </p>
              <div className="modal-action">
                <form method="dialog" className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline btn-error"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                  <button className="btn btn-sm" onClick={closeDeleteModal}>
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        )}
        {deleteError && (
          <div className="text-red-500 text-sm mt-2">{deleteError}</div>
        )}

        {filteredSkus.length > visibleCount && (
          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() =>
                setVisibleCount((c) => Math.min(c + 20, filteredSkus.length))
              }
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowSkuCodes;
