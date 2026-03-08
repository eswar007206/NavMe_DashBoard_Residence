import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import TablePage from "./pages/TablePage";
import NotFound from "./pages/NotFound";
import { tableConfigs } from "./lib/tableConfig";
import { ThemeProvider } from "./components/theme-provider";

const NavNodesActivity = lazy(() => import("./pages/NavNodesActivity"));
const Heatmap = lazy(() => import("./pages/Heatmap"));
const BlockShops = lazy(() => import("./pages/BlockShops"));
const Snapshots = lazy(() => import("./pages/Snapshots"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
      Loading...
    </div>
  );
}

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
              <Route path="/user-activity" element={<Suspense fallback={<LazyFallback />}><NavNodesActivity /></Suspense>} />
              <Route path="/heatmap" element={<Suspense fallback={<LazyFallback />}><Heatmap /></Suspense>} />
              <Route path="/block-rooms" element={<Suspense fallback={<LazyFallback />}><BlockShops /></Suspense>} />
              <Route path="/pois" element={<TablePage config={tableConfigs.ar_ropin_pois} />} />
              <Route path="/users" element={<TablePage config={tableConfigs.ar_ropin_users} />} />
              <Route path="/electronic-assets" element={<TablePage config={tableConfigs.ar_electronic_assets} />} />
              <Route path="/complaints" element={<TablePage config={tableConfigs.ar_complaints} />} />
              <Route path="/feedback" element={<TablePage config={tableConfigs.ar_ropin_feedback} />} />
              <Route path="/snapshots" element={<Suspense fallback={<LazyFallback />}><Snapshots /></Suspense>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
