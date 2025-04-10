import { useEffect, useState } from "react";
import { fetchAllCodes } from "../functions/api"; // Adjust path if needed

const ShowSkuCodes = () => {
  const [skus, setSkus] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAllCodes();
      if (data) setSkus(data);
    };
    getData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SKU Code List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200 shadow-md rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Product Name</th>
              <th className="px-6 py-3 text-left">Color</th>
              <th className="px-6 py-3 text-left">SKU Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {skus.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              skus.map((sku) => (
                <tr key={sku._id}>
                  <td className="px-6 py-4">{sku.productName}</td>
                  <td className="px-6 py-4">{sku.color}</td>
                  <td className="px-6 py-4 font-mono">{sku.skuCode}</td>
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
