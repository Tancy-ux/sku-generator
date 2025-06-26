import { useState } from "react";
import { savePricing } from "../functions/colors";
import AllPricing from "../components/AllPricing";

const ProductDetails = () => {
  const [productName, setProductName] = useState(""); // do it afterwards

  const [skuCode, setSkuCode] = useState("");
  const [cp, setCp] = useState(""); // makingPriceExclGst
  const [sp, setSp] = useState(""); // sellingPriceExclGst
  const [dc, setDeliveryCharges] = useState("");

  const makingInclGst = cp ? (parseFloat(cp) * 1.18).toFixed(2) : "";
  const sellingInclGst = sp ? (parseFloat(sp) * 1.18).toFixed(2) : "";
  const totalCost =
    cp && dc ? (parseFloat(cp) + parseFloat(dc)).toFixed(2) : "";
  const cogs =
    cp && sp ? ((parseFloat(cp) / parseFloat(sp)) * 100).toFixed(2) : "";

  return (
    <div className="overflow-x-auto border border-base-content/5 bg-base-100">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th className="text-center">SKU Code</th>
            <th className="text-center">Product Name - Inner Glaze</th>
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
                onChange={(e) => setSkuCode(e.target.value)}
                // onBlur={handleSkuSearch}
                className="input input-bordered"
                placeholder="SKU"
              />
            </td>
            <td>
              <p>{productName}</p>
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
              <p>{makingInclGst}</p>
            </td>

            <td>
              <input
                type="number"
                value={dc}
                onChange={(e) => setDeliveryCharges(e.target.value)}
                placeholder="Delivery"
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
              <p>{sellingInclGst}</p>
            </td>
            <td>
              <p>{cogs}%</p>
            </td>
            <td>
              <button
                className="btn btn-xs btn-primary mt-4"
                onClick={() => savePricing({ skuCode, cp, dc, sp })}
              >
                Save
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <AllPricing />
    </div>
  );
};

export default ProductDetails;
