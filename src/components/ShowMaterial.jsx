/**
 * @param {{ materials: Array<{name: string, code: string, _id?: string}>, loading: boolean }} props
 */
const ShowMaterial = ({ materials, loading }) => {
  if (loading) {
    return (
      <p className="text-sm text-base-content/50">Loading materials...</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
        Existing materials
      </h4>
      {materials.length === 0 ? (
        <p className="text-sm text-base-content/50">
          No materials yet — add one above.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {[...materials]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((m, index) => (
              <div
                key={m._id || index}
                className="badge badge-secondary badge-outline h-auto py-1.5"
              >
                {m.name}
                <span className="ml-1 font-mono text-xs opacity-70">
                  {m.code}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ShowMaterial;
