import { useEffect, useState, useRef } from "react";
import { savePricing } from "../functions/colors";
import AllPricing from "../components/AllPricing";
import { fetchAllSkus } from "../functions/sku";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const allPricingRef = useRef(null);
  const [productName, setProductName] = useState("");

  const [skuCode, setSkuCode] = useState("");
  const [cp, setCp] = useState(""); // Cost Price excl GST
  const [sp, setSp] = useState(""); // Selling Price excl GST
  const [dc, setDeliveryCharges] = useState(0);
  const [gstRate, setGstRate] = useState(1.18); // default to 18%

  const parsedCp = parseFloat(cp) || 0;
  const parsedSp = parseFloat(sp) || 0;

  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadSkus = async () => {
      const data = await fetchAllSkus();
      const products = Object.entries(data).map(([sku, details]) => ({
        skuCode: sku,
        productName: details.productName,
        color: details.color,
      }));
      setProductList(products);
    };
    loadSkus();
  }, []);

  // These calculations correctly use gstRate for makingInclGst
  const makingInclGst = cp ? (parsedCp * gstRate).toFixed(2) : "";
  const sellingInclGst = sp ? (parsedSp * gstRate).toFixed(2) : "";
  const totalCost = cp && dc ? (parsedCp + dc).toFixed(2) : "";
  const cogs = cp && sp ? ((parsedCp / parsedSp) * 100).toFixed(2) : "";

  const handleSave = async () => {
    if (!skuCode || !cp || !sp || !productName) {
      toast.error("Please fill all fields");
      return;
    }
    await savePricing({
      skuCode,
      cp,
      dc,
      sp,
      makingInclGst,
      sellingInclGst,
      totalCost,
      cogs,
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
          <tr className="text-center">
            <th>Product Name</th>
            <th>SKU Code</th>
            <th>GST Rate</th>
            <th>
              Making Price <br />
              (excl gst)
            </th>
            <th>
              Making Price <br /> (incl gst)
            </th>
            <th>Delivery Charges</th>
            <th>Total Cost</th>
            <th>
              Selling Price <br /> (excl gst)
            </th>
            <th>
              Selling Price <br /> (incl gst)
            </th>
            <th>COGS</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="dropdown">
              <input
                type="text"
                value={productName}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductName(value);

                  if (value.length > 0) {
                    const search = value.toLowerCase();

                    // 1. Products where name-color starts with search
                    const startsWithMatches = productList.filter((p) =>
                      `${p.productName} - ${p.color}`
                        .toLowerCase()
                        .startsWith(search)
                    );

                    // 2. Products where name-color includes search (but not starts with)
                    const includesMatches = productList.filter(
                      (p) =>
                        `${p.productName} - ${p.color}`
                          .toLowerCase()
                          .includes(search) &&
                        !`${p.productName} - ${p.color}`
                          .toLowerCase()
                          .startsWith(search)
                    );

                    // 3. Combine, remove duplicates, and limit to 15
                    const combined = [
                      ...startsWithMatches,
                      ...includesMatches,
                    ].slice(0, 15);

                    setFilteredProducts(combined);
                    setShowDropdown(true);
                  } else {
                    setFilteredProducts([]);
                    setShowDropdown(false);
                    setSkuCode("");
                  }
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 100)} // allow click
                placeholder="Type product name"
                className="input input-bordered w-sm text-xs"
              />
              {showDropdown && filteredProducts.length > 0 && (
                <ul className="dropdown-content menu bg-base-300 border border-base-content/20 rounded-box z-1 w-sm p-2 shadow-sm">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.skuCode}
                      onMouseDown={() => {
                        setProductName(
                          `${product.productName} - ${product.color}`
                        );
                        setSkuCode(product.skuCode);
                        setShowDropdown(false);
                      }}
                      className="cursor-pointer hover:bg-base-100 p-2 text-base-content/80"
                    >
                      {product.productName} - {product.color}
                    </li>
                  ))}
                </ul>
              )}
            </td>
            <td>{skuCode}</td>
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
                className="input input-bordered w-36"
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
                className="input input-bordered w-36"
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
                className="input input-bordered w-36"
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
