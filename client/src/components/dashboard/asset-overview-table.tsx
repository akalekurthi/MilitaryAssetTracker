import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Eye, Edit } from "lucide-react";

// This would normally come from your API
const mockAssetData = [
  {
    id: 1,
    type: "weapons",
    description: "M4A1 Carbine",
    base: "Fort Bragg",
    openingBalance: 450,
    purchases: 25,
    transfersIn: 10,
    transfersOut: 5,
    assigned: 200,
    expended: 15,
    closingBalance: 465,
  },
  {
    id: 2,
    type: "vehicles",
    description: "HUMVEE M1165",
    base: "Camp Pendleton", 
    openingBalance: 85,
    purchases: 3,
    transfersIn: 2,
    transfersOut: 1,
    assigned: 42,
    expended: 3,
    closingBalance: 86,
  },
  {
    id: 3,
    type: "ammunition",
    description: "5.56mm NATO",
    base: "Norfolk Naval",
    openingBalance: 15000,
    purchases: 5000,
    transfersIn: 500,
    transfersOut: 1200,
    assigned: 8500,
    expended: 2300,
    closingBalance: 8500,
  },
];

const getAssetTypeIcon = (type: string) => {
  switch (type) {
    case "weapons":
      return "🔫";
    case "vehicles":
      return "🚛";
    case "ammunition":
      return "💥";
    case "equipment":
      return "⚙️";
    default:
      return "📦";
  }
};

const getAssetTypeColor = (type: string) => {
  switch (type) {
    case "weapons":
      return "bg-blue-100 text-blue-600";
    case "vehicles":
      return "bg-green-100 text-green-600";
    case "ammunition":
      return "bg-red-100 text-red-600";
    case "equipment":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export function AssetOverviewTable() {
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting data...");
  };

  const handleAddAsset = () => {
    // Implement add asset functionality
    console.log("Adding asset...");
  };

  const handleViewDetails = (assetId: number) => {
    console.log("Viewing details for asset:", assetId);
  };

  const handleEditAsset = (assetId: number) => {
    console.log("Editing asset:", assetId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Asset Overview by Category
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-military-600 border-military-600 hover:bg-military-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={handleAddAsset}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Type</TableHead>
                <TableHead>Base</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Transfers In</TableHead>
                <TableHead className="text-right">Transfers Out</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Expended</TableHead>
                <TableHead className="text-right font-semibold">Closing Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssetData.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getAssetTypeColor(asset.type)}`}>
                        <span className="text-sm">{getAssetTypeIcon(asset.type)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.description}</div>
                        <div className="text-sm text-gray-500 capitalize">{asset.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{asset.base}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{asset.openingBalance.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-green-600">
                    +{asset.purchases.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-blue-600">
                    +{asset.transfersIn.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    -{asset.transfersOut.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-amber-600">
                    {asset.assigned.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {asset.expended.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {asset.closingBalance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(asset.id)}
                        className="text-military-600 hover:text-military-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAsset(asset.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
