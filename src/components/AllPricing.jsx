import { useEffect, useState } from "react";
import { fetchPricing } from "../functions/colors.js";

const AllPricing = () => {
  const [pricingList, setPricingList] = useState([]);

  useEffect(() => {
    const loadPricing = async () => {
      const data = await fetchPricing();
      setPricingList(data);
    };

    loadPricing();
  }, []);

  return (
    <div className="overflow-x-auto border border-base-content/5 bg-base-100 my-8">
      <h2 className="text-xl font-bold mb-2">Saved Pricing Records</h2>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>SKU Code</th>
            <th>Making (excl GST)</th>
            <th>Making (incl GST)</th>
            <th>Delivery</th>
            <th>Total Cost</th>
            <th>Selling (excl GST)</th>
            <th>Selling (incl GST)</th>
            <th>COGS</th>
          </tr>
        </thead>
        <tbody>
          {pricingList.map((item, index) => (
            <tr key={index}>
              <td>{item.skuCode}</td>
              <td>{item.makingPriceExclGst}</td>
              <td>{item.makingPriceInclGst}</td>
              <td>{item.deliveryCharges}</td>
              <td>{item.totalCost}</td>
              <td>{item.sellingPriceExclGst}</td>
              <td>{item.sellingPriceInclGst}</td>
              <td>{item.cogs.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllPricing;
