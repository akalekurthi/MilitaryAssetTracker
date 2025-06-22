export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "commander" | "logistics";
  baseId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardMetrics {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  assignedAssets: number;
  breakdown: {
    purchases: number;
    transfersIn: number;
    transfersOut: number;
  };
}

export interface Activity {
  id: number;
  type: "purchase" | "transfer" | "assignment";
  description: string;
  base: string;
  user: string;
  timestamp: string;
}
