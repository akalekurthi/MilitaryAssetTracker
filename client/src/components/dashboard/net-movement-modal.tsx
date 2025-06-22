import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, ArrowRight, ArrowDown } from "lucide-react";
import type { DashboardMetrics } from "@/types";

interface NetMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DashboardMetrics;
}

export function NetMovementModal({ isOpen, onClose, metrics }: NetMovementModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Net Movement Breakdown</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Purchases</h4>
            <p className="text-2xl font-bold text-green-600 font-mono mt-2">
              +{metrics.breakdown.purchases.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Assets acquired</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Transfers In</h4>
            <p className="text-2xl font-bold text-blue-600 font-mono mt-2">
              +{metrics.breakdown.transfersIn.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Assets received</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowDown className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Transfers Out</h4>
            <p className="text-2xl font-bold text-red-600 font-mono mt-2">
              -{metrics.breakdown.transfersOut.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Assets sent</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Net Movement Total:</span>
            <span className="text-2xl font-bold text-military-700 font-mono">
              {metrics.netMovement >= 0 ? '+' : ''}{metrics.netMovement.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Formula: Purchases + Transfers In - Transfers Out
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
