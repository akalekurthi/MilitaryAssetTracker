import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ArrowRightLeft, 
  Users, 
  Shield,
  FileText,
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "commander", "logistics"],
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: ShoppingBag,
    roles: ["admin", "commander", "logistics"],
  },
  {
    title: "Transfers",
    href: "/transfers",
    icon: ArrowRightLeft,
    roles: ["admin", "commander", "logistics"],
  },
  {
    title: "Assignments",
    href: "/assignments",
    icon: Users,
    roles: ["admin", "commander"],
  },
];

const adminItems = [
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Audit Logs",
    href: "/logs",
    icon: FileText,
    roles: ["admin", "commander"],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const hasAccess = (roles: string[]) => roles.includes(user.role);

  return (
    <aside className="bg-military-700 text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-military-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-bronze-400 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-military-800" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MAMS</h1>
            <p className="text-sm text-military-200">Asset Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            if (!hasAccess(item.roles)) return null;
            
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-military-600 text-white"
                      : "text-military-200 hover:bg-military-600 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.title}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {adminItems.some(item => hasAccess(item.roles)) && (
          <div className="mt-8 pt-6 border-t border-military-600">
            <div className="text-xs font-semibold text-military-300 uppercase tracking-wider mb-3">
              Administration
            </div>
            <div className="space-y-2">
              {adminItems.map((item) => {
                if (!hasAccess(item.roles)) return null;
                
                const isActive = location === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-military-600 text-white"
                          : "text-military-200 hover:bg-military-600 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.title}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-military-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-military-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-military-300 capitalize">{user.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-military-300 hover:text-white hover:bg-military-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
