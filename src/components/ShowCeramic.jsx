import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { fetchAllColorEntries } from "../functions/api";
import Skeleton from "./common/Skeleton";

const ShowCeramic = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const response = await fetchAllColorEntries();
        // Handle different API response structures
        const data = response.data || response.data.data || response;
        if (Array.isArray(data)) {
          setColors(data);
        } else {
          throw new Error("Unexpected data format from API");
        }
      } catch (error) {
        console.error("Error loading colors:", error);
        setError(error.message);
        toast.error("Failed to load colors");
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, []);

  if (loading) return <Skeleton />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (colors.length === 0)
    return <div className="text-center py-10">No color entries found</div>;

  return (
    <div>
      <h3 className="text-2xl text-center font-bold mt-10 mb-5">
        All Ceramic Colours
      </h3>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full  border border-gray-600">
            {/* Table headers remain the same */}
            <thead className="text-center">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Outer Glaze
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Inner Glaze
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rim Colour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Code
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 text-base-content text-center text-sm">
              {colors.map((color, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-base-200" : ""}
                >
                  {/* Table cells remain the same */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-center">
                      {color.outerColor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-center">
                      {color.innerColor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-center">
                      {color.rimColor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-pink-400 font-mono font-bold">
                    {color.code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowCeramic;
