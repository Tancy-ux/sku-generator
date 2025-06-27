import { useEffect, useState, useRef } from "react";
import { savePricing } from "../functions/colors";
import AllPricing from "../components/AllPricing";
import { fetchAllSkus } from "../functions/sku";

const ProductDetails = () => {
  const allPricingRef = useRef(null);
  const [productName, setProductName] = useState(""); // to be filled later

  const [skuCode, setSkuCode] = useState("");
  const [cp, setCp] = useState(""); // Cost Price excl GST
  const [sp, setSp] = useState(""); // Selling Price excl GST
  const [dc, setDeliveryCharges] = useState(0);
  const [gstRate, setGstRate] = useState(1.18); // default to 18%

  const parsedCp = parseFloat(cp) || 0;
  const parsedSp = parseFloat(sp) || 0;

  const [skuMap, setSkuMap] = useState({});

  useEffect(() => {
    const loadSkus = async () => {
      const data = await fetchAllSkus();
      setSkuMap(data); // expected format: { SKU123: { productName, ... } }
    };
    loadSkus();
  }, []);

  // These calculations correctly use gstRate for makingInclGst
  const makingInclGst = cp ? (parsedCp * gstRate).toFixed(2) : "";
  const sellingInclGst = sp ? (parsedSp * 1.18).toFixed(2) : ""; // This is hardcoded to 1.18

  const totalCost = cp && dc ? (parsedCp + dc).toFixed(2) : "";
  const cogs = cp && sp ? ((parsedCp / parsedSp) * 100).toFixed(2) : "";

  const handleSave = async () => {
    // These calculations also correctly use gstRate for computedMakingInclGst
    const computedMakingInclGst = cp ? (parsedCp * gstRate).toFixed(2) : "";
    const computedSellingInclGst = sp ? (parsedSp * 1.18).toFixed(2) : ""; // This is hardcoded to 1.18
    const computedTotalCost = cp && dc ? (parsedCp + dc).toFixed(2) : "";
    const computedCogs =
      cp && sp ? ((parsedCp / parsedSp) * 100).toFixed(2) : "";

    await savePricing({
      skuCode,
      cp,
      dc,
      sp,
      makingInclGst: computedMakingInclGst,
      sellingInclGst: computedSellingInclGst,
      totalCost: computedTotalCost,
      cogs: computedCogs,
    });
    allPricingRef.current?.refresh();

    setSkuCode("");
    setCp("");
    setDeliveryCharges(0);
    setSp("");
    setProductName("");
  };

  return (
    <div className="overflow-x-auto border border-base-content/5 bg-base-100">
      <h2 className="text-xl font-bold m-3">Add Pricing</h2>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th className="text-center">SKU Code</th>
            <th className="text-center">Product Name</th>
            <th className="text-center">GST Rate</th>
            <th className="text-center">Making Price (excl gst)</th>
            <th className="text-center">Making Price (incl gst)</th>
            <th className="text-center">Delivery Charges</th>
            <th className="text-center">Total Cost</th>
            <th className="text-center">Selling Price (excl gst)</th>
            <th className="text-center">Selling Price (incl gst)</th>
            <th className="text-center">COGS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                value={skuCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setSkuCode(code);
                  const match = skuMap[code];
                  setProductName(match ? match.productName : "");
                }}
                className="input input-bordered"
                placeholder="SKU"
              />
            </td>
            <td>
              <p>{productName}</p>
            </td>
            <td className="flex items-center gap-2 m-2">
              <select
                className="select select-sm w-20"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value))} // This updates gstRate state
              >
                <option value={1.12}>12%</option>
                <option value={1.18}>18%</option>
              </select>
            </td>
            <td>
              <input
                type="number"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
                placeholder="CP excl. GST"
                className="input input-bordered"
              />
            </td>
            <td>
              <p>{makingInclGst}</p>{" "}
              {/* This displays based on gstRate state */}
            </td>
            <td>
              <input
                type="number"
                value={dc}
                onChange={(e) =>
                  setDeliveryCharges(parseFloat(e.target.value) || 0)
                }
                placeholder="Delivery charges"
                className="input input-bordered"
              />
            </td>
            <td>
              <p>{totalCost}</p>
            </td>
            <td>
              <input
                type="number"
                value={sp}
                onChange={(e) => setSp(e.target.value)}
                placeholder="SP excl. GST"
                className="input input-bordered"
              />
            </td>
            <td>
              <p>{sellingInclGst}</p> {/* This displays based on 1.18 */}
            </td>
            <td>
              <p>{cogs}%</p>
            </td>
            <td>
              <button
                className="btn btn-xs btn-primary mt-4"
                onClick={handleSave}
              >
                Save
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <AllPricing ref={allPricingRef} />
    </div>
  );
};

export default ProductDetails;
