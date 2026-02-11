import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import TablePage from "./pages/TablePage";
import NavNodesActivity from "./pages/NavNodesActivity";
import NotFound from "./pages/NotFound";
import { tableConfigs } from "./lib/tableConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/user-activity" element={<NavNodesActivity />} />
            <Route path="/shop-categories" element={<TablePage config={tableConfigs.ar_shop_categories} />} />
            <Route path="/shop-items" element={<TablePage config={tableConfigs.ar_shop_items} />} />
            <Route path="/shop-offers" element={<TablePage config={tableConfigs.ar_shop_offers} />} />
            <Route path="/shops" element={<TablePage config={tableConfigs.ar_shops} />} />
            <Route path="/users" element={<TablePage config={tableConfigs.ar_user_presence} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
