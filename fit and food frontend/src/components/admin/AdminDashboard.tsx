"use client";

import { useState } from "react";
import AdminStats from "./AdminStats";
import SubscriptionsTab from "./SubscriptionsTab";
import OrdersTab from "./OrdersTab";
import DeliveriesTab from "./DeliveriesTab";
import CatalogTab from "./CatalogTab";
import GymsTab from "./GymsTab";
import PacksTab from "./PacksTab";
import LogsTab from "./LogsTab";

const TABS = [
  { id: "subs", label: "Abonnements" },
  { id: "orders", label: "Commandes & Reconduction" },
  { id: "deliveries", label: "Livraisons" },
  { id: "catalog", label: "Catalogue Repas" },
  { id: "gyms", label: "Salles Partenaires" },
  { id: "tarifs", label: "Tarifs & Promotions" },
  { id: "logs", label: "Logs / Webhooks" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("subs");

  return (
    <div>
      <h1 className="text-2xl font-heading text-secondary mb-6">Espace Administrateur - Dashboard</h1>

      <AdminStats />

      <div className="bg-white rounded-xl p-6 shadow-sm mt-6 min-w-0 w-full">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap snap-x snap-mandatory touch-pan-x -mx-1 px-1 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 snap-start whitespace-nowrap text-xs px-3.5 py-2 rounded-full border ${
                activeTab === tab.id ? "bg-secondary text-white border-secondary" : "bg-bg-light border-border text-text-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "subs" && <SubscriptionsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "deliveries" && <DeliveriesTab />}
        {activeTab === "catalog" && <CatalogTab />}
        {activeTab === "gyms" && <GymsTab />}
        {activeTab === "tarifs" && <PacksTab />}
        {activeTab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}