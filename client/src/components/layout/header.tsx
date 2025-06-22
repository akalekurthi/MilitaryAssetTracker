import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface HeaderProps {
  title: string;
  description: string;
  showFilters?: boolean;
  onBaseChange?: (value: string) => void;
  onAssetTypeChange?: (value: string) => void;
  onDateRangeChange?: (value: string) => void;
  selectedBase?: string;
  selectedAssetType?: string;
  selectedDateRange?: string;
}

export function Header({
  title,
  description,
  showFilters = false,
  onBaseChange,
  onAssetTypeChange,
  onDateRangeChange,
  selectedBase,
  selectedAssetType,
  selectedDateRange,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        
        {showFilters && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium text-gray-700">Date Range:</Label>
              <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium text-gray-700">Base:</Label>
              <Select value={selectedBase} onValueChange={onBaseChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Bases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Bases</SelectItem>
                  <SelectItem value="1">Fort Bragg</SelectItem>
                  <SelectItem value="2">Camp Pendleton</SelectItem>
                  <SelectItem value="3">Norfolk Naval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium text-gray-700">Equipment:</Label>
              <Select value={selectedAssetType} onValueChange={onAssetTypeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="weapons">Weapons</SelectItem>
                  <SelectItem value="ammunition">Ammunition</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
