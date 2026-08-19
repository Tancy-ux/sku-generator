import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getBaseColors } from "../functions/colors";

export function useBaseColors() {
  const [baseColors, setBaseColors] = useState([]);

  const refreshBaseColors = useCallback(async () => {
    try {
      const response = await getBaseColors();
      setBaseColors(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error("Failed to load base colors");
    }
  }, []);

  useEffect(() => {
    refreshBaseColors();
  }, [refreshBaseColors]);

  return { baseColors, refreshBaseColors };
}
