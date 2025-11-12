import { ReactNode, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TruckIcon,
  Bell,
  Menu,
  X,
  Trophy,
  HelpCircle,
  Leaf,
  Navigation,
  TrendingDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/suppliers", icon: TruckIcon, label: "Suppliers" },
    { path: "/alerts", icon: Bell, label: "Alerts" },
  ];

  const advancedModules = [
    { path: "/auto-orders", icon: Zap, label: "Auto Orders" },
    { path: "/cost-optimization", icon: TrendingDown, label: "Cost Optimization" },
    { path: "/sustainability", icon: Leaf, label: "Sustainability" },
    { path: "/route-optimizer", icon: Navigation, label: "Route Optimizer" },
  ];


  const secondaryItems = [
    { path: "/achievements", icon: Trophy, label: "Achievements" },
    { path: "/help", icon: HelpCircle, label: "Help Center" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">JIT Inventory</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">JIT Inventory System</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur">
          <nav className="container p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop Navigation & Content */}
      <div className="container flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">MAIN</p>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors", location.pathname === item.path ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted")}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">ADVANCED</p>
              {advancedModules.map((item) => (
                <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors", location.pathname === item.path ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted")}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>

          </nav>
          
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">More</p>
            <nav className="space-y-1">
              {secondaryItems.map((item) => (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
