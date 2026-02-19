import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import TablePage from "./pages/TablePage";
import NavNodesActivity from "./pages/NavNodesActivity";
import Heatmap from "./pages/Heatmap";
import BlockShops from "./pages/BlockShops";
import NotFound from "./pages/NotFound";
import { tableConfigs } from "./lib/tableConfig";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/user-activity" element={<NavNodesActivity />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/block-rooms" element={<BlockShops />} />
              <Route path="/room-categories" element={<TablePage config={tableConfigs.ar_room_categories} />} />
              <Route path="/room-information" element={<TablePage config={tableConfigs.ar_room_information} />} />
              <Route path="/rooms" element={<TablePage config={tableConfigs.ar_rooms} />} />
              <Route path="/users" element={<TablePage config={tableConfigs.ar_user_presence} />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
