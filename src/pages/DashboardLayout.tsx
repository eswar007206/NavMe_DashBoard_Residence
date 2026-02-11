import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="gradient-mesh" />
      <DashboardSidebar />
      <main className="flex-1 relative z-10 p-6 lg:p-8 overflow-y-auto scrollbar-glass">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
