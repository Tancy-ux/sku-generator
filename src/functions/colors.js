import axios from "axios";
import toast from "react-hot-toast";

const BASE_URI = "https://product-db-c5u9.onrender.com/api/sku";

export const fetchCutleryColors = async () => {
  try {
    const res = await axios.get(`${BASE_URI}/cutlery`);
    console.log(res.data);
    return res.data.data;
  } catch (error) {
    toast.error("Error fetching cutlery colors");
    return [];
  }
};

export const fetchColorsByMaterial = async (material) => {
  try {
    const res = await axios.get(`${BASE_URI}/colors/${material}`);
    return res.data;
  } catch (error) {
    toast.error("Error fetching colors by material");
    return [];
  }
};

export const addCutleryColor = async (handle, finish) => {
  try {
    const res = await axios.post(`${BASE_URI}/cutlery`, { handle, finish });
    toast.success("Cutlery color added!");
    return res.data;
  } catch (error) {
    toast.error("Error adding cutlery color");
    return null;
  }
};

export const addColorByMaterial = async (material, color) => {
  try {
    const res = await axios.post(`${BASE_URI}/colors`, { material, color });
    toast.success(`Added new ${material} color!`);
    return res.data;
  } catch (error) {
    toast.error(`Error adding color for ${material}`);
    return null;
  }
};

export const getCutleryCode = async (handle, finish) => {
  try {
    const res = await axios.post(`${BASE_URI}/c-code`, { handle, finish });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMaterialCode = async (material, color) => {
  try {
    const res = await axios.post(`${BASE_URI}/m-code`, { material, color });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addNewColor = async (outerColor, innerColor, rimColor) => {
  try {
    const res = await axios.post(`${BASE_URI}/add-color`, {
      outerColor,
      innerColor,
      rimColor,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addBaseColor = async (color) => {
  try {
    const res = await axios.post(`${BASE_URI}/add-base`, color);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getBaseColors = async () => {
  try {
    const res = await axios.get(`${BASE_URI}/get-base`);
    return res.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateProduct = async (productId, updatedName) => {
  const response = await fetch(`${BASE_URI}/update-product/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: updatedName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update product");
  }

  return response.json();
};

export const deleteProduct = async (productId) => {
  const response = await fetch(`${BASE_URI}/del-product/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete product");
  }

  return response.json();
};

export const fetchOldSkuCodes = async () => {
  try {
    const res = await axios.get(`${BASE_URI}/oldsku`);
    return res.data.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteSku = async (skuCode) => {
  try {
    const res = await axios.delete(`${BASE_URI}/del-sku`, { data: { skuCode } });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};