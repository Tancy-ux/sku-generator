import { useEffect, useState } from "react";
import { fetchAllCodes, fetchTypes } from "../functions/api";

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
    " text-green-400 border-green-400",
    " text-indigo-400 border-indigo-400",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const ShowSkuCodes = () => {
  const [skus, setSkus] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const [skuData, typeData] = await Promise.all([
          fetchAllCodes(),
          fetchTypes(),
        ]);

        if (skuData) setSkus(skuData);
        if (typeData) setTypes(typeData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    getInitialData();
  }, []);

  // Filter SKUs based on selected type
  const filteredSkus =
    selectedType === "all"
      ? skus
      : skus.filter((sku) => sku.typeCode === selectedType);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SKU Code List</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="type-filter" className="text-sm font-medium">
            Filter by Type:
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="py-1 px-2 w-40 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type.code} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-600 shadow-md rounded-xl">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-center">
                Product Name - Inner Glaze
              </th>
              <th className="px-6 py-3 text-center">SKU Code</th>
              <th className="px-6 py-3 text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredSkus.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              filteredSkus.map((sku, idx) => (
                <tr key={idx} className="text-center">
                  <td className="px-6 text-sm text-center py-3">
                    {sku.productName}{" "}
                    <span className="text-gray-300 text-md">{sku.color}</span>
                  </td>
                  <td className="px-6 py-3 text-center font-mono">
                    {sku.skuCode}
                  </td>
                  <td
                    className={`px-4 py-2.5 mx-2 text-center mt-3 badge-sm badge ${getBadgeColor(
                      sku.typeCode
                    )}`}
                  >
                    {types.find((t) => t.code === sku.typeCode)?.name ||
                      sku.typeCode}{" "}
                    - {sku.typeCode}
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
