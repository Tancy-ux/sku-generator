import axios from "axios";
import toast from "react-hot-toast";

const BASE_URI = "https://product-db-c5u9.onrender.com/api/sku";

export const fetchMaterials = async () => {
  const res = await axios.get(`${BASE_URI}/materials`);
  return res.data.data;
};

export const fetchTypes = async () => {
  const res = await axios.get(`${BASE_URI}/types`);
  return res.data.data;
};

export const fetchProductsByType = async (type) => {
  try {
    const res = await axios.get(`${BASE_URI}/products/${type}`);
    return res.data.products 
      ? res.data 
      : { products: Array.isArray(res.data) ? res.data : [] };
  } catch (error) {
    toast.error("Error fetching products");
    return { products: [] };
  }
};

export const fetchColors = async () => {
  const response = await axios.get(`${BASE_URI}/colors`);
  const { outerColors, innerColors, rimColors } = response.data.data;
  return { outerColors, innerColors, rimColors };
};

export const addMaterial = async (material, code) => {
  try {
    if(!material || !code) {
      toast.error("Material and code are required");
      return null;
    }
    const res = await axios.post(`${BASE_URI}/add-material`, {
      material,
      code,
    });
    return res.data;
  } catch (error) {
    console.log(error)
  }
}

export const getColorCode = async (outerColor, innerColor, rimColor) => {
  try {
    const res = await axios.post(`${BASE_URI}/get-color-code`, {
      outerColor,
      innerColor,
      rimColor,
    });
    console.log("Color code response:", res.data.data);

    if (res.data.message) {
      toast.error(res.data.message);
    }
    return res.data.data;
  } catch (error) {
    toast.error(error);
    toast.error("Something went wrong");
  }
};

export const getDesignCode = async (productName) => {
  try {
    if (!productName) {
      toast.error("Product name is required");
      return null;
    }
    const res = await axios.post(`${BASE_URI}/design-code`, {
      productName,
    });

    if (!res.data.success) { 
      toast.error(res.data.message || "Failed to get design code");
      return null;
    }
    return res.data.designCode;

  } catch (error) {
    toast.error("Design code error:", error);
    toast.error("Something went wrong while fetching design code");    
    return null;
  }
}

export const addProduct = async (name, category) => {
  try {
    const res = await axios.post(`${BASE_URI}/add-product`, {
      name,
      category
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export const fetchAllColorEntries = async () => {
  try {
    const res = await axios.get(`${BASE_URI}/color-entries`);
    return res.data;
  } catch (error) {
    toast.error(error);
  }
}

export const fetchAllCodes = async () => {
  try {
    const res = await axios.get(`${BASE_URI}/all-codes`);
    return res.data.data;
  } catch (error) {
    toast.error(error);
  }
}

export const getMaterialSku = async (material, color, typology, product) => {
  try {
    const res = await axios.post(`${BASE_URI}/get-msku`, {
      materialName: material,
      colour: color,
      typology,
      productName: product
    });

    // Validate response structure
    if (!res.data) {
      throw new Error('No data received from server');
    }

    // Handle both possible success responses
    const skuData = res.data.data || res.data;
    if (!skuData.skuCode && !skuData.newSKU?.skuCode) {
      throw new Error('Invalid SKU data structure');
    }

    // Return consistent structure
    return {
      success: true,
      skuCode: skuData.skuCode || skuData.newSKU.skuCode,
      data: skuData
    };

  } catch (error) {
    toast.error('getMaterialSku error:', error);
    // Return error information instead of string
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

export const generateSKU = async (
  material,
  outerColor,
  innerColor,
  rimColor,
  typology,
  productName
) => {
  try {
    const res = await axios.post(`${BASE_URI}/get-sku`, {
      materialName: material,
      outerColor,
      innerColor,
      rimColor,
      typology,
      productName
    });

    // Validate response
    if (!res.data) {
      throw new Error('No data received from server');
    }

    // Handle both possible success responses
    const skuCode = res.data.skuCode || res.data.newSKU?.skuCode;
    if (!skuCode) {
      throw new Error('No SKU code in response');
    }

    return {
      success: true,
      skuCode,
      data: res.data
    };

  } catch (error) {
    toast.error('generateSKU error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};