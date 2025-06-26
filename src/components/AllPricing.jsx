import { useEffect, useState } from "react";
import { fetchPricing, updatePricing } from "../functions/colors.js";
import toast from "react-hot-toast";
import { fetchAllSkus } from "../functions/sku.js";

const AllPricing = () => {
  const [pricingList, setPricingList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [skuMap, setSkuMap] = useState({});

  useEffect(() => {
    const loadAll = async () => {
      const [pricing, skuInfo] = await Promise.all([
        fetchPricing(),
        fetchAllSkus(),
      ]);

      setPricingList(pricing);
      setSkuMap(skuInfo);
    };

    loadAll();
  }, []);

  const handleEditClick = (index, item) => {
    setEditIndex(index);
    setEditData({
      id: item._id,
      skuCode: item.skuCode,
      cp: item.makingPriceExclGst,
      sp: item.sellingPriceExclGst,
      dc: item.deliveryCharges,
    });
  };

  const handleSave = async () => {
    // @ts-ignore
    const { id, cp, sp, dc } = editData;

    try {
      await updatePricing(id, {
        makingPriceExclGst: parseFloat(cp),
        deliveryCharges: parseFloat(dc),
        sellingPriceExclGst: parseFloat(sp),
      });

      const updated = await fetchPricing();
      setPricingList(updated);
      setEditIndex(null);
    } catch (err) {
      toast.error("Error saving changes");
    }
  };

  const calc = {
    inclGst: (x) => {
      const value = parseFloat(x) || 0;
      return (value * 1.18).toFixed(2);
    },

    total: (cp, dc) => {
      const cleanCp = parseFloat(cp) || 0;
      const cleanDc = parseFloat(dc) || 0;
      return (cleanCp + cleanDc).toFixed(2);
    },

    cogs: (cp, sp) => {
      const cleanCp = parseFloat(cp) || 0;
      const cleanSp = parseFloat(sp) || 1; // avoid division by 0
      return ((cleanCp / cleanSp) * 100).toFixed(1);
    },
  };

  return (
    <div className="overflow-x-auto border border-base-content/5 bg-base-100 my-8">
      <h2 className="text-xl font-bold m-2">Saved Pricing Records</h2>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>SKU Code</th>
            <th>Product Name</th>
            <th>Making Price (excl GST)</th>
            <th>Making Price (incl GST)</th>
            <th>Delivery</th>
            <th>Total Cost</th>
            <th>Selling Price (excl GST)</th>
            <th>Selling Price (incl GST)</th>
            <th>COGS</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pricingList.map((item, index) => {
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
                parseFloat(editData.sp) || 1
              : item.sellingPriceExclGst;

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

                <td>{calc.inclGst(cp)}</td>

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

                <td>{calc.inclGst(sp)}</td>
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
};

export default AllPricing;
