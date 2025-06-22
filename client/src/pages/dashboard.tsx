import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { NetMovementModal } from "@/components/dashboard/net-movement-modal";
import { AssetOverviewTable } from "@/components/dashboard/asset-overview-table";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import type { DashboardMetrics, Activity } from "@/types";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState<string>("");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", selectedBase, selectedDateRange],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activity"],
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 overflow-x-auto">
        <Header
          title="Asset Management Dashboard"
          description="Monitor and manage military assets across all bases"
          showFilters={true}
          onBaseChange={setSelectedBase}
          onAssetTypeChange={setSelectedAssetType}
          onDateRangeChange={setSelectedDateRange}
          selectedBase={selectedBase}
          selectedAssetType={selectedAssetType}
          selectedDateRange={selectedDateRange}
        />
        
        <div className="p-6">
          {metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : metrics ? (
            <MetricsCards 
              metrics={metrics} 
              onNetMovementClick={() => setIsModalOpen(true)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">Failed to load metrics</div>
              </div>
            </div>
          )}

          <AssetOverviewTable />

          <div className="mt-8">
            <RecentActivity activities={activities || []} isLoading={activitiesLoading} />
          </div>
        </div>
      </main>

      {metrics && (
        <NetMovementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          metrics={metrics}
        />
      )}
    </div>
  );
}
