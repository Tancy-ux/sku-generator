import { useEffect, useState } from "react";
import { fetchTypes } from "../functions/api";
import Skeleton from "./common/Skeleton";
import toast from "react-hot-toast";

const ShowTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const data = await fetchTypes();
        setTypes(data);
      } catch {
        setError("Failed to load types");
        toast.error("Failed to load types");
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  if (loading) return <Skeleton />;
  if (error) {
    return <div className="text-center py-10 text-error">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Typology</h3>
        <span className="badge badge-neutral badge-outline">
          {types.length}
        </span>
      </div>
      {types.length === 0 ? (
        <p className="text-sm text-base-content/50">No typologies found.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {types
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((t, index) => (
              <div
                key={t._id || index}
                className="badge badge-secondary badge-outline h-auto py-1.5"
              >
                {t.name}
                <span className="ml-1 font-mono text-xs opacity-70">
                  {t.code}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ShowTypes;
