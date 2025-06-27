import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { fetchPricing, updatePricing } from "../functions/colors.js";
import toast from "react-hot-toast";
import { fetchAllSkus } from "../functions/sku.js";

const AllPricing = forwardRef((props, ref) => {
  const [pricingList, setPricingList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [skuMap, setSkuMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const loadPricing = async () => {
    const [pricing, skuInfo] = await Promise.all([
      fetchPricing(),
      fetchAllSkus(),
    ]);
    setPricingList(pricing);
    setSkuMap(skuInfo);
  };

  useEffect(() => {
    loadPricing();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: loadPricing,
  }));
  const handleEditClick = (index, item) => {
    setEditIndex(index);
    setEditData({
      id: item._id,
      skuCode: item.skuCode,
      cp: item.makingPriceExclGst,
      sp: item.sellingPriceExclGst,
      dc: item.deliveryCharges,
      gstRate: item.gstRate || 1.18,
    });
  };

  const handleSave = async () => {
    // @ts-ignore
    const { id, cp, sp, dc, gstRate } = editData;

    try {
      await updatePricing(id, {
        makingPriceExclGst: parseFloat(cp),
        deliveryCharges: parseFloat(dc),
        sellingPriceExclGst: parseFloat(sp),
        gstRate: parseFloat(gstRate),
      });

      await loadPricing();
      setEditIndex(null);
    } catch (err) {
      toast.error("Error saving changes");
    }
  };

  const calc = {
    total: (cp, dc) => {
      const cleanCp = parseFloat(cp) || 0;
      const cleanDc = parseFloat(dc) || 0;
      return (cleanCp + cleanDc).toFixed(2);
    },

    cogs: (cp, sp) => {
      const cleanCp = parseFloat(cp) || 0;
      const cleanSp = parseFloat(sp) || 1;
      return ((cleanCp / cleanSp) * 100).toFixed(1);
    },
  };

  return (
    <div className="overflow-x-auto border border-base-content/5 bg-base-100 my-8">
      <div className="flex m-2 justify-between">
        <h2 className="text-xl font-bold m-2">Saved Pricing Records</h2>
        <input
          type="text"
          placeholder="Search by SKU Code or Product Name.."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <table className="table table-zebra w-full">
        <thead>
          <tr className="text-center">
            <th>SKU Code</th>
            <th>Product Name - Inner Glaze</th>
            <th>Making Price (excl GST)</th>
            <th>Making Price (incl GST)</th>
            <th>Delivery</th>
            <th>Total Cost</th>
            <th>Selling Price (excl GST)</th>
            <th>Selling Price (incl GST)</th>
            {/* <th>GST Rate</th> */}
            <th>COGS</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {pricingList
            .filter((item) => {
              const productName =
                skuMap[item.skuCode]?.productName?.toLowerCase() || "";
              const sku = item.skuCode.toLowerCase();
              return (
                sku.includes(searchTerm) || productName.includes(searchTerm)
              );
            })
            .map((item, index) => {
              const isEditing = index === editIndex;

              const cp = isEditing
                ? // @ts-ignore
                  parseFloat(editData.cp) || 0
                : item.makingPriceExclGst;
              const dc = isEditing
                ? // @ts-ignore
                  parseFloat(editData.dc) || 0
                : item.deliveryCharges;
              const sp = isEditing
                ? // @ts-ignore
                  parseFloat(editData.sp) || 0
                : item.sellingPriceExclGst;
              const gstRate = isEditing
                ? // @ts-ignore
                  parseFloat(editData.gstRate) || 1.18
                : item.gstRate || 1.18;

              return (
                <tr key={item._id}>
                  <td>{item.skuCode}</td>
                  <td>
                    <p>
                      {skuMap[item.skuCode]?.productName || "—"}{" "}
                      <span className="text-gray-500 text-sm">
                        {skuMap[item.skuCode]?.color || ""}
                      </span>
                    </p>
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="input input-xs"
                        type="number"
                        // @ts-ignore
                        value={editData.cp}
                        onChange={(e) =>
                          setEditData({ ...editData, cp: e.target.value })
                        }
                      />
                    ) : (
                      item.makingPriceExclGst
                    )}
                  </td>

                  <td>{item.makingPriceInclGst.toFixed(2)}</td>

                  <td>
                    {isEditing ? (
                      <input
                        className="input input-xs"
                        type="number"
                        // @ts-ignore
                        value={editData.dc}
                        onChange={(e) =>
                          setEditData({ ...editData, dc: e.target.value })
                        }
                      />
                    ) : (
                      item.deliveryCharges
                    )}
                  </td>

                  <td>{calc.total(cp, dc)}</td>

                  <td>
                    {isEditing ? (
                      <input
                        className="input input-xs"
                        type="number"
                        // @ts-ignore
                        value={editData.sp}
                        onChange={(e) =>
                          setEditData({ ...editData, sp: e.target.value })
                        }
                      />
                    ) : (
                      item.sellingPriceExclGst
                    )}
                  </td>

                  <td>{(sp * gstRate).toFixed(2)}</td>

                  {/* <td>
                  {isEditing ? (
                    <select
                      className="select select-xs"
                      // @ts-ignore
                      value={editData.gstRate}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          gstRate: parseFloat(e.target.value),
                        })
                      }
                    >
                      <option value={1.12}>12%</option>
                      <option value={1.18}>18%</option>
                    </select>
                  ) : (
                    `${((gstRate - 1) * 100).toFixed(0)}%`
                  )}
                </td> */}

                  <td>{calc.cogs(cp, sp)}%</td>

                  <td>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          className="btn btn-xs btn-success"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-xs"
                          onClick={() => setEditIndex(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-xs btn-success btn-soft"
                        onClick={() => handleEditClick(index, item)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
});

export default AllPricing;
