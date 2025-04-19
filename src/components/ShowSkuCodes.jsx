import { useEffect, useState } from "react";
import { fetchAllCodes, fetchTypes } from "../functions/api";
import { FiCopy } from "react-icons/fi";
import { fetchOldSkuCodes } from "../functions/colors";

const getBadgeColor = (typeCode) => {
  const hash = Array.from(typeCode).reduce(
    (hash, char) => char.charCodeAt(0) + (hash << 5) - hash,
    0
  );
  const colors = [
    "text-blue-400 border-blue-400",
    "text-yellow-400 border-yellow-400",
    "text-purple-400 border-purple-400",
    "text-pink-400 border-pink-400",
    "text-green-400 border-green-400",
    "text-indigo-400 border-indigo-400",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const ShowSkuCodes = () => {
  const [skus, setSkus] = useState([]);
  const [oldSkus, setOldSkus] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [showLegacy, setShowLegacy] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

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

  const handleLegacyToggle = () => {
    // Reset to first available type when switching to legacy
    if (!showLegacy && selectedType === "all") {
      setSelectedType(types[0]?.code || "AE");
    }
    setShowLegacy(!showLegacy);
  };

  // Modified filter logic
  const filteredSkus = (
    showLegacy
      ? oldSkus.filter((sku) =>
          selectedType === "all" ? true : sku.typeCode === selectedType
        )
      : selectedType === "all"
      ? skus
      : skus.filter((sku) => sku.typeCode === selectedType)
  ).sort((a, b) => {
    const nameA = (a.productName || a.name || "").toLowerCase();
    const nameB = (b.productName || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

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

  return (
    <div className="p-6">
      <div className="flex justify-between gap-8 items-center mb-8">
        <h1 className="text-3xl font-bold">
          {showLegacy ? "Legacy SKU Codes" : "Current SKU Codes"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Show Legacy:</label>
            <input
              type="checkbox"
              checked={showLegacy}
              onChange={handleLegacyToggle}
              className="toggle toggle-primary"
            />
          </div>
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
              {!showLegacy && <option value="all">All Types</option>}
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
            {filteredSkus.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-gray-500">
                  No {showLegacy ? "legacy" : "current"} SKUs found for selected
                  type.
                </td>
              </tr>
            ) : (
              filteredSkus.map((sku, idx) => (
                <tr key={idx}>
                  <td className="text-center">
                    {sku.productName || sku.name}{" "}
                    <span className="text-gray-400">{sku.color}</span>
                  </td>
                  <td className="text-center font-mono">
                    <div className="flex items-center justify-center">
                      {sku.skuCode || sku.code}
                      <button
                        onClick={() => handleCopy(sku, idx)}
                        className="btn btn-ghost btn-xs"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-success">Copied!</span>
                        ) : (
                          <FiCopy size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${getBadgeColor(sku.typeCode)}`}>
                      {types.find((t) => t.code === sku.typeCode)?.name ||
                        sku.typeCode}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowSkuCodes;
