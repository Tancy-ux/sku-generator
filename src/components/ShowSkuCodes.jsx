import { useEffect, useMemo, useState } from "react";
import { fetchAllCodes, fetchTypes } from "../functions/api";
import { FiCopy, FiSearch } from "react-icons/fi";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

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
  }, [searchTerm, activeSearch, showLegacy, selectedType]);

  const handleLegacyToggle = () => {
    setActiveSearch(false);
    setSearchTerm("");
    // Reset to first available type when switching to legacy
    if (!showLegacy && selectedType === "all") {
      setSelectedType(types[0]?.code || "AE");
    }
    setShowLegacy(!showLegacy);
  };
  // Modified filter logic

  const filteredSkus = useMemo(() => {
    const txt = searchTerm.trim().toLowerCase();
    const base = showLegacy ? oldSkus : skus;
    const source =
      activeSearch && txt
        ? [...skus, ...oldSkus]
        : base.filter(
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
  }, [searchTerm, activeSearch, showLegacy, selectedType, skus, oldSkus]);

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

  return (
    <div className="p-6">
      <div className="flex justify-between gap-8 items-center mb-8">
        <h1 className="text-3xl font-bold">
          {showLegacy ? "Legacy SKU Codes" : "Current SKU Codes"}
        </h1>
        <div className="flex items-center">
          {/* Add search bar */}
          <div className="relative w-84">
            <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter 2 letters to search products..."
              className="input input-bordered pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveSearch(false);
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
                        : `No ${
                            showLegacy ? "legacy" : "current"
                          } SKUs found for selected type.`}
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              visibleSkus.map((sku, idx) => (
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

        {filteredSkus.length > visibleCount && (
          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() => setVisibleCount((c) => c + 12)}
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
