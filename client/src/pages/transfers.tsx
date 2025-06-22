import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransferForm } from "@/components/forms/transfer-form";
import { Plus, Filter, ArrowRightLeft } from "lucide-react";

export default function Transfers() {
  const [selectedBase, setSelectedBase] = useState<string>("all");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: transfers, isLoading } = useQuery({
    queryKey: ["/api/transfers", selectedBase === "all" ? "" : selectedBase, selectedAssetType === "all" ? "" : selectedAssetType, selectedDateRange],
  });

  const handleNewTransfer = () => {
    setIsFormOpen(true);
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
              ) : transfers && transfers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>From Base</TableHead>
                      <TableHead>To Base</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transfer Date</TableHead>
                      <TableHead>Initiated By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer: any) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          {transfer.asset?.description || 'Unknown Asset'}
                          <div className="text-sm text-gray-500 capitalize">
                            {transfer.asset?.type}
                          </div>
                        </TableCell>
                        <TableCell>{transfer.fromBase?.name}</TableCell>
                        <TableCell>{transfer.toBase?.name}</TableCell>
                        <TableCell className="font-mono">{transfer.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(transfer.transferDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transfer.user?.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Transfer</DialogTitle>
          </DialogHeader>
          <TransferForm
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
