import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Suppliers from "./pages/Suppliers";
import Alerts from "./pages/Alerts";
import Achievements from "./pages/Achievements";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";
import Sustainability from "./pages/Sustainability";
import RouteOptimizer from "./pages/RouteOptimizer";
import CostOptimization from "./pages/CostOptimization";
import AutoOrders from "./pages/AutoOrders";
import Logout from "./pages/Logout";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
          <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
          <Route path="/achievements" element={<Layout><Achievements /></Layout>} />
          <Route path="/help" element={<Layout><HelpCenter /></Layout>} />
              <Route path="/sustainability" element={<Layout><Sustainability /></Layout>} />
              <Route path="/route-optimizer" element={<Layout><RouteOptimizer /></Layout>} />
              <Route path="/cost-optimization" element={<Layout><CostOptimization /></Layout>} />
              <Route path="/auto-orders" element={<Layout><AutoOrders /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
