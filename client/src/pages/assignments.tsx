import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { Plus, Filter, Users } from "lucide-react";

export default function Assignments() {
  const [selectedBase, setSelectedBase] = useState<string>("all");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["/api/assignments", selectedBase === "all" ? "" : selectedBase, selectedAssetType === "all" ? "" : selectedAssetType, selectedDateRange],
  });

  const handleNewAssignment = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 overflow-x-auto">
        <Header
          title="Assignment & Expenditure Management"
          description="Track asset assignments to personnel and expenditures"
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
                <CardTitle>Assignment History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                  <Button size="sm" onClick={handleNewAssignment} className="bg-amber-600 hover:bg-amber-700">
                    <Users className="w-4 h-4 mr-2" />
                    New Assignment
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
              ) : assignments && assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Base</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Personnel ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignment Date</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          {assignment.asset?.description || 'Unknown Asset'}
                          <div className="text-sm text-gray-500 capitalize">
                            {assignment.asset?.type}
                          </div>
                        </TableCell>
                        <TableCell>{assignment.base?.name}</TableCell>
                        <TableCell>{assignment.assignedTo}</TableCell>
                        <TableCell className="font-mono">{assignment.personnelId || 'N/A'}</TableCell>
                        <TableCell className="font-mono">{assignment.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'assigned' ? 'default' : 'destructive'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{assignment.user?.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Asset assignments will appear here once created
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
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <AssignmentForm
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
