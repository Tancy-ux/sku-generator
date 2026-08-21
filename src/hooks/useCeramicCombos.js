import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { fetchAllColorEntries } from "../functions/api";

/**
 * @typedef {{outerColor: string, innerColor: string, rimColor: string, code: string, _id?: string}} CeramicCombo
 */

export function useCeramicCombos(enabled = true) {
  const [combos, setCombos] = useState(/** @type {CeramicCombo[]} */ ([]));
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refreshCombos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllColorEntries();
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : null;

      if (!data) throw new Error("Unexpected data format from API");
      setCombos(data);
    } catch (err) {
      setError(err.message || "Failed to load colors");
      toast.error("Failed to load colors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refreshCombos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCombos]);

  return { combos, loading, error, refreshCombos };
}
