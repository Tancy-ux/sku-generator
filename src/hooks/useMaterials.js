import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { fetchMaterials } from "../functions/api";

export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshMaterials = useCallback(async () => {
    try {
      const data = await fetchMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMaterials();
  }, [refreshMaterials]);

  return { materials, loading, refreshMaterials };
}
