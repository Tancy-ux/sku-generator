import { useState } from "react";
import AddProduct from "./AddProduct";
import AddMaterials from "./AddMaterials";
import AddCeramicColors from "./AddCeramicColors";
import ProductDetails from "./ProductDetails";
import ViewAll from "./ViewAll";

const TABS = [
  { key: "products", label: "Products", Component: AddProduct },
  { key: "materials", label: "Materials & Colors", Component: AddMaterials },
  { key: "ceramic", label: "Ceramic Colors", Component: AddCeramicColors },
  { key: "pricing", label: "Pricing", Component: ProductDetails },
  { key: "browse", label: "Browse All", Component: ViewAll },
];

const Manage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const ActiveComponent = TABS.find((t) => t.key === activeTab).Component;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b border-base-300">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
};

export default Manage;
