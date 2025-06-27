import { fetchAllCodes } from "./api";
import { fetchOldSkuCodes } from "./colors";

export const fetchAllSkus = async () => {
  try {
    const [all, old] = await Promise.all([fetchAllCodes(), fetchOldSkuCodes()]);
    const combined = [...all, ...old];

    const map = {};
    combined.forEach((sku) => {
      const code = sku.skuCode || sku.code;
      map[code] = {
        productName: sku.productName || sku.name || "Unknown",
        color: sku.color || sku.innerColor || sku.colour || "",
      };
    });

    return map;
  } catch (err) {
    console.error("Failed to fetch SKU metadata:", err);
    return {};
  }
};

