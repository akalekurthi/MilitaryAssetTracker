import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, ArrowRightLeft } from "lucide-react";

export default function Transfers() {
  const [selectedBase, setSelectedBase] = useState<string>("");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");

  const { data: transfers, isLoading } = useQuery({
    queryKey: ["/api/transfers", selectedBase, selectedAssetType, selectedDateRange],
  });

  const handleNewTransfer = () => {
    console.log("New transfer");
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 overflow-x-auto">
        <Header
          title="Transfer Management"
          description="Manage asset transfers between military bases"
          showFilters={true}
          onBaseChange={setSelectedBase}
          onAssetTypeChange={setSelectedAssetType}
          onDateRangeChange={setSelectedDateRange}
          selectedBase={selectedBase}
          selectedAssetType={selectedAssetType}
          selectedDateRange={selectedDateRange}
        />
        
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transfer History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                  <Button size="sm" onClick={handleNewTransfer} className="bg-blue-600 hover:bg-blue-700">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    New Transfer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transfers found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Transfers will appear here once created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
