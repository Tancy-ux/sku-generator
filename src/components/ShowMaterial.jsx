import { useEffect, useState } from "react";
import { fetchMaterials } from "../functions/api";
import Skeleton from "./common/Skeleton";
import toast from "react-hot-toast";

const ShowMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await fetchMaterials();
        setMaterials(data);
      } catch (err) {
        setError("Failed to load materials");
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const toggleTable = () => {
    setShowTable(!showTable);
  };

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="materials-container">
      <div className="flex flex-col items-center mt-10 mb-5">
        <h3 className="text-2xl font-bold mb-4">Materials</h3>
        <button
          onClick={toggleTable}
          className="px-6 text-sm py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
        >
          {showTable ? "Hide Materials" : "Show Materials"}
        </button>
      </div>

      {showTable && (
        <div className="p-6 mx-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-600">
              <thead className="text-center">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 text-base-content text-center">
                {materials.map((m, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-base-200" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-center">
                        {m.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-pink-400">
                        {m.code}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowMaterial;
