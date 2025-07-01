import toast from "react-hot-toast";
import { fetchAllCodes } from "./api";
import { fetchOldSkuCodes } from "./colors";

export const fetchAllSkus = async () => {
  try {
    const [all, old] = await Promise.all([fetchAllCodes(), fetchOldSkuCodes()]);
    const combined = [...all, ...old];

    const smap = {};
    combined.forEach((sku) => {
      const code = sku.skuCode || sku.code;
      smap[code] = {
        productName: sku.productName || sku.name || "Unknown",
        color: sku.color || sku.innerColor || sku.colour || "",
      };
    });

    return smap;
  } catch (err) {
    toast.error("Failed to fetch SKU metadata:", err);
    return {};
  }
};

