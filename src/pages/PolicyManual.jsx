import { useState } from "react";
import PolicyManualViewer from "@/components/PolicyManualViewer";
import SZJIEPolicyViewer from "@/components/SZJIEPolicyViewer";

export default function PolicyManual() {
  const [activeTab, setActiveTab] = useState("szjie");

  return (
    <div className="p-6 space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => setActiveTab("szjie")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "szjie"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          SZJIE Support Services
        </button>
        <button
          onClick={() => setActiveTab("main")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "main"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          Full Policy Manual
        </button>
      </div>

      {activeTab === "szjie" ? <SZJIEPolicyViewer /> : <PolicyManualViewer />}
    </div>
  );
}