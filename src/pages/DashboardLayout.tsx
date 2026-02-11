import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
      <div className="gradient-mesh" />
      <DashboardSidebar />
      <main className="flex-1 relative z-10 p-6 lg:p-8 overflow-y-auto scrollbar-glass">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
