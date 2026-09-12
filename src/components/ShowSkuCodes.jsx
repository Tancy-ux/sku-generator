import { useEffect, useMemo, useRef, useState } from "react";
import {
  createShopifyProduct,
  fetchAllCodes,
  fetchTypes,
  syncShopifyStatus,
} from "../functions/api";
import { FiCopy, FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { FaShopify } from "react-icons/fa";
import { deleteSku, editOldSku, fetchOldSkuCodes } from "../functions/colors";
import { SiZincsearch } from "react-icons/si";
import toast from "react-hot-toast";

const isUnglazed = (color) =>
  typeof color === "string" && color.trim().toLowerCase() === "unglazed";

/**
 * Collapses a glaze trio into a readable label instead of always spelling
 * out all three:
 *   - all three match -> one color name.
 *   - Inner or Outer is the odd one out (i.e. Rim matches whichever of the
 *     other two it shares a color with) -> plain "Inner | Outer" naming,
 *     same convention as when all three differ.
 *   - only the Rim differs -> "{Inner/Outer color} with {Rim color} Rim".
 *   - all three differ -> full "Inner | Outer | Rim" breakdown.
 * An "Unglazed" minority slot (e.g. a dip plate's bare rim) is dropped
 * entirely rather than called out — it's not a color choice.
 */
const formatGlazeCombo = (colorI, colorO, colorR) => {
  if (colorI === colorO && colorO === colorR) return colorI;

  const positions = [
    ["Inner", colorI],
    ["Outer", colorO],
    ["Rim", colorR],
  ];
  const groups = new Map();
  positions.forEach(([label, color]) => {
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color).push(label);
  });

  if (groups.size === 2) {
    const entries = [...groups.entries()];
    const majority = entries.find(([, labels]) => labels.length === 2);
    const minority = entries.find(([, labels]) => labels.length === 1);
    if (majority && minority) {
      const [majorColor] = majority;
      const [minorColor, minorLabels] = minority;
      if (isUnglazed(minorColor)) return majorColor;
      if (minorLabels[0] === "Rim") {
        return `${majorColor} with ${minorColor} Rim`;
      }
      // Inner or Outer is the odd one out — name it the plain way instead.
      return `${colorI} | ${colorO}`;
    }
  }

  return `${colorI} | ${colorO} | ${colorR}`;
};

const ShowSkuCodes = () => {
  const [skus, setSkus] = useState([]);
  const [oldSkus, setOldSkus] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [shopifyFilter, setShopifyFilter] = useState("all"); // all | listed | unlisted
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skuToDelete, setSkuToDelete] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  // skuCode -> "pending" while the request is in flight, admin URL once pushed
  const [shopifyState, setShopifyState] = useState({});

  // Measures the sticky title/search/filter block so the table's header row
  // can stick right below it (instead of overlapping it) as the page scrolls.
  const stickyHeaderRef = useRef(null);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);

  useEffect(() => {
    const el = stickyHeaderRef.current;
    if (!el) return;
    const update = () =>
      setStickyHeaderHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isLoading =
    skus.length === 0 && oldSkus.length === 0 && types.length === 0;

  const loadData = async () => {
    try {
      const [skuData, typeData, oldSkuData] = await Promise.all([
        fetchAllCodes(),
        fetchTypes(),
        fetchOldSkuCodes(),
      ]);

      if (skuData) setSkus(skuData);
      if (typeData) setTypes(typeData);
      if (oldSkuData) setOldSkus(oldSkuData);

      const alreadyPushed = {};
      [...(skuData || []), ...(oldSkuData || [])].forEach((s) => {
        if (s.shopifyProductId) {
          alreadyPushed[s.skuCode || s.code] = s.shopifyAdminUrl || true;
        }
      });
      setShopifyState(alreadyPushed);
    } catch (error) {
      toast.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setVisibleCount(15);
  }, [searchTerm, activeSearch, selectedType, shopifyFilter]);

  const handleSyncWithShopify = async () => {
    setIsSyncing(true);
    const res = await syncShopifyStatus();
    setIsSyncing(false);

    if (!res.success) {
      toast.error(res.error || "Failed to check Shopify status");
      return;
    }

    const newlyListed = res.listed?.length || 0;
    const newlyDelisted = res.delisted?.length || 0;

    if (newlyListed || newlyDelisted) {
      await loadData();
    }

    if (!newlyListed && !newlyDelisted) {
      toast(
        `Checked ${res.checked} SKU${res.checked === 1 ? "" : "s"} — no changes`,
      );
      return;
    }

    if (newlyListed) {
      toast.success(
        `Found ${newlyListed} already-listed product${newlyListed === 1 ? "" : "s"} on Shopify`,
      );
    }
    if (newlyDelisted) {
      toast(
        `${newlyDelisted} product${newlyDelisted === 1 ? "" : "s"} no longer found on Shopify — marked Unlisted`,
      );
    }
  };

  // Modified filter logic

  const filteredSkus = useMemo(() => {
    const txt = searchTerm.trim().toLowerCase();
    const all = [...skus, ...oldSkus];
    const source =
      activeSearch && txt
        ? all
        : all.filter(
            (s) => selectedType === "all" || s.typeCode === selectedType,
          );

    return source
      .filter((sku) => {
        if (!txt) return true;
        const hay = [
          sku.productName || sku.name,
          sku.color,
          sku.skuCode || sku.code,
        ].map((str) => (str || "").toLowerCase());
        return hay.some((part) => part.includes(txt));
      })
      .filter((sku) => {
        if (shopifyFilter === "all") return true;
        const isListed = Boolean(shopifyState[sku.skuCode || sku.code]);
        return shopifyFilter === "listed" ? isListed : !isListed;
      })
      .sort((a, b) => {
        const nameA = (a.productName || a.name || "").toLowerCase();
        const nameB = (b.productName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [
    searchTerm,
    activeSearch,
    selectedType,
    shopifyFilter,
    shopifyState,
    skus,
    oldSkus,
  ]);

  const visibleSkus = filteredSkus.slice(0, visibleCount);

  const noResults = searchTerm.trim() && filteredSkus.length === 0;

  const handleCopy = (text, index) => {
    const codeToCopy = text.skuCode || text.code || text;
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1000);
      })
      .catch((err) => {
        toast.error("Failed to copy text: ", err);
      });
  };
  const handlePushToShopify = async (sku) => {
    const code = sku.skuCode || sku.code;
    if (!code || shopifyState[code]) return;

    setShopifyState((prev) => ({ ...prev, [code]: "pending" }));

    const res = await createShopifyProduct(code);

    if (!res.success) {
      setShopifyState((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
      toast.error(res.error || "Failed to create Shopify product");
      return;
    }

    setShopifyState((prev) => ({
      ...prev,
      [code]: res.data?.adminUrl || true,
    }));

    if (res.alreadyExists) {
      toast(`${code} already exists on Shopify`);
    } else if (res.missingPrice) {
      toast.success(
        `${code} created on Shopify — no pricing found, price set to 0`,
      );
    } else {
      toast.success(`${code} created on Shopify (POS only)`);
    }
  };

  const handleSaveEdit = async (sku) => {
    try {
      const updated = await editOldSku(sku._id, editValue);
      setOldSkus((prev) =>
        prev.map((item, i) =>
          item._id === sku._id ? { ...item, code: updated.code } : item,
        ),
      );
      setEditIndex(null);
    } catch (err) {
      toast.error("Failed to edit SKU:", err.message);
    }
  };

  const openDeleteModal = (skuCode) => {
    setSkuToDelete(skuCode);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSkuToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (skuToDelete) {
      try {
        await deleteSku(skuToDelete);
        const updatedSkus = skus.filter((sku) => sku.skuCode !== skuToDelete);
        const updatedOldSkus = oldSkus.filter(
          (sku) => sku.code !== skuToDelete,
        );
        setSkus(updatedSkus);
        setOldSkus(updatedOldSkus);
        setDeleteError(null);
      } catch (error) {
        toast.error("Error deleting SKU:", error);
        setDeleteError("Failed to delete SKU. Please try again.");
      } finally {
        closeDeleteModal(); // Close the modal after the operation
      }
    }
  };

  return (
    <div className="p-6 w-full lg:w-4/5 mx-auto">
      <div
        ref={stickyHeaderRef}
        className="sticky top-0 z-20 bg-base-100 flex flex-col md:flex-row justify-between gap-8 items-center mb-8 pb-4 border-b border-base-300"
      >
        <h1 className="text-2xl font-semibold shrink-0">View All SKUs</h1>
        <div className="flex items-center">
          {/* Add search bar */}
          <div className="relative w-84">
            <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              <SiZincsearch size={12} className="text-base-content/60" />
            </div>
            <input
              type="text"
              placeholder="Enter 2 letters to search products..."
              className="input input-bordered pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveSearch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim().length >= 2) {
                  e.preventDefault();
                  setActiveSearch(true);
                }
              }}
            />
          </div>
          <button
            className="btn btn-primary btn-sm"
            disabled={searchTerm.trim().length < 2}
            onClick={() => setActiveSearch(true)}
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm font-medium">
              Filter:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select select-bordered select-sm w-40"
            >
              <option value="all">All Types</option>
              {types
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((type, idx) => (
                  <option key={idx} value={type.code}>
                    {type.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="shopify-filter" className="text-sm font-medium">
              Shopify:
            </label>
            <select
              id="shopify-filter"
              value={shopifyFilter}
              onChange={(e) => setShopifyFilter(e.target.value)}
              className="select select-bordered select-sm w-32"
            >
              <option value="all">All</option>
              <option value="listed">Listed</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          <button
            onClick={handleSyncWithShopify}
            disabled={isSyncing}
            className="btn btn-sm btn-outline whitespace-nowrap"
            title="Read-only: checks which SKUs already exist on Shopify and updates their Listed/Unlisted status here. Never creates, edits, or deletes anything on Shopify."
          >
            <FiRefreshCw
              size={12}
              className={isSyncing ? "animate-spin" : ""}
            />
            {isSyncing ? "Checking..." : "Check Shopify Status"}
          </button>
        </div>
      </div>

      <div>
        <table className="table table-zebra w-full">
          <thead
            className="sticky z-10 bg-base-100"
            style={{ top: stickyHeaderHeight }}
          >
            <tr>
              <th className="text-center">Product Name - Inner Glaze</th>
              <th className="text-center">SKU Code</th>
              <th className="text-center">Type</th>
              <th className="text-center">Shopify</th>
            </tr>
          </thead>
          <tbody>
            {visibleSkus.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-base-content/60">
                  {noResults ? (
                    "No results found"
                  ) : (
                    <p>
                      {isLoading
                        ? "Loading…"
                        : noResults
                          ? "No results found"
                          : `No current SKUs found for selected type.`}
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              visibleSkus.map((sku, idx) => (
                <tr key={idx}>
                  <td className="text-center">
                    {sku.productName || sku.name}{" "}
                    {sku.color ? (
                      <span className="text-base-content/60">{sku.color}</span>
                    ) : (
                      <span className="text-base-content/60">
                        {formatGlazeCombo(
                          sku.color_i,
                          sku.color_o,
                          sku.color_r,
                        )}
                      </span>
                    )}
                  </td>
                  <td className="text-center font-mono">
                    <div className="flex items-center justify-center gap-2">
                      {editIndex === idx ? (
                        <>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-32"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit(sku);
                              }
                            }}
                          />
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleSaveEdit(sku)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-xs"
                            onClick={() => setEditIndex(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {sku.skuCode || sku.code}
                          <button
                            onClick={() => handleCopy(sku, idx)}
                            className="badge badge-sm ml-1 cursor-pointer"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === idx ? (
                              <span className="text-success">Copied!</span>
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditIndex(idx);
                              setEditValue(sku.code || sku.skuCode); // or sku.skuCode if it's a new SKU
                            }}
                            className="badge badge-sm cursor-pointer text-warning"
                            title="Edit SKU"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() =>
                              openDeleteModal(sku.skuCode || sku.code)
                            }
                            className="badge badge-sm cursor-pointer text-error"
                            title="Delete SKU"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="text-center whitespace-nowrap">
                    <span className="badge badge-sm badge-outline badge-primary whitespace-nowrap">
                      {types.find((t) => t.code === sku.typeCode)?.name ||
                        sku.typeCode}
                    </span>
                  </td>

                  <td className="text-center whitespace-nowrap">
                    {(() => {
                      const code = sku.skuCode || sku.code;
                      const state = shopifyState[code];

                      if (state === "pending") {
                        return (
                          <button className="btn btn-xs btn-outline" disabled>
                            <span className="loading loading-spinner loading-xs" />
                          </button>
                        );
                      }

                      if (state) {
                        return typeof state === "string" ? (
                          <a
                            href={state}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-xs btn-success btn-outline whitespace-nowrap"
                            title="Open in Shopify admin"
                          >
                            <FaShopify size={12} /> Listed in Shopify
                          </a>
                        ) : (
                          <span className="btn btn-xs btn-success btn-outline no-animation whitespace-nowrap">
                            <FaShopify size={12} /> Listed in Shopify
                          </span>
                        );
                      }

                      return (
                        <button
                          onClick={() => handlePushToShopify(sku)}
                          className="btn btn-xs btn-outline btn-primary whitespace-nowrap"
                          title="Create an ACTIVE Shopify product published to POS only"
                        >
                          <FaShopify size={12} /> Create Listing
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <dialog id="delete_modal" className="modal" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Delete</h3>
              <p className="py-4">
                Are you sure you want to delete SKU:{" "}
                <span className="font-mono">{skuToDelete}</span>?
              </p>
              <div className="modal-action">
                <form method="dialog" className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline btn-error"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                  <button className="btn btn-sm" onClick={closeDeleteModal}>
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        )}
        {deleteError && (
          <div className="text-error text-sm mt-2">{deleteError}</div>
        )}

        {filteredSkus.length > visibleCount && (
          <div className="text-center mt-4">
            <button
              className="btn btn-primary"
              onClick={() =>
                setVisibleCount((c) => Math.min(c + 20, filteredSkus.length))
              }
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowSkuCodes;
