import { useMemo, useState } from "react";
import { SiZincsearch } from "react-icons/si";
import { useCeramicCombos } from "../hooks/useCeramicCombos";
import Skeleton from "./common/Skeleton";

/**
 * @param {{
 *   combos?: Array<{outerColor: string, innerColor: string, rimColor: string, code: string, _id?: string}>,
 *   loading?: boolean,
 *   error?: string | null,
 * }} props
 */
const ShowCeramic = ({
  combos: combosProp,
  loading: loadingProp,
  error: errorProp,
}) => {
  const isControlled = combosProp !== undefined;
  const internal = useCeramicCombos(!isControlled);

  const combos = isControlled ? combosProp : internal.combos;
  const loading = isControlled ? loadingProp : internal.loading;
  const error = isControlled ? errorProp : internal.error;

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCombos = useMemo(() => {
    const txt = searchTerm.trim().toLowerCase();
    if (!txt) return combos;
    return combos.filter((combo) =>
      [combo.outerColor, combo.innerColor, combo.rimColor, combo.code]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(txt)),
    );
  }, [combos, searchTerm]);

  if (loading) return <Skeleton />;
  if (error) {
    return <div className="text-center py-10 text-error">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-base-300">
        <div>
          <h3 className="text-xl font-semibold">All Ceramic Colours</h3>
          <p className="text-sm text-base-content/60 mt-0.5">
            {combos.length} combination{combos.length !== 1 ? "s" : ""} on
            record — search before adding a new one
          </p>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3">
            <SiZincsearch size={12} className="text-base-content/60" />
          </div>
          <input
            type="text"
            placeholder="Search by colour or code..."
            className="input input-bordered input-sm w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {combos.length === 0 ? (
        <div className="text-center py-10 text-base-content/60">
          No color entries found
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="text-center py-10 text-base-content/60">
          No combinations match &quot;{searchTerm}&quot;
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="text-center">Outer Glaze</th>
                <th className="text-center">Inner Glaze</th>
                <th className="text-center">Rim Colour</th>
                <th className="text-center">Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredCombos.map((combo, index) => (
                <tr key={combo._id || index}>
                  <td className="text-center">{combo.outerColor}</td>
                  <td className="text-center">{combo.innerColor}</td>
                  <td className="text-center">{combo.rimColor}</td>
                  <td className="text-center font-mono font-bold text-secondary">
                    {combo.code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowCeramic;
