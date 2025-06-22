import { Card, CardContent } from "@/components/ui/card";
import { Package, BarChart3, ArrowRightLeft, Users } from "lucide-react";
import type { DashboardMetrics } from "@/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  onNetMovementClick: () => void;
}

export function MetricsCards({ metrics, onNetMovementClick }: MetricsCardsProps) {
  const percentageChange = metrics.openingBalance > 0 
    ? ((metrics.closingBalance - metrics.openingBalance) / metrics.openingBalance * 100).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Opening Balance</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {metrics.openingBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">As of start period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closing Balance</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {metrics.closingBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center text-xs ${
              parseFloat(percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}% from opening
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onNetMovementClick}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Movement</p>
              <p className="text-2xl font-bold text-military-700 font-mono">
                {metrics.netMovement >= 0 ? '+' : ''}{metrics.netMovement.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-military-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-military-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-gray-500 mr-2">Click for breakdown</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Assets</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {metrics.assignedAssets.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">Currently in use</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
