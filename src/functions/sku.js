import { fetchAllCodes } from "./api";

export const fetchAllSkus = async () => {
  try {
    const all = await fetchAllCodes();

    const map = {};
    all.forEach((sku) => {
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
