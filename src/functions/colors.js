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
        return []
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
}

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
}

export const getMaterialCode = async (material, color) => {
    try {
        const res = await axios.post(`${BASE_URI}/m-code`, { material, color });
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

export const addNewColor = async (material, color) => {}