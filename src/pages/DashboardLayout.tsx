import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-[100dvh] w-full min-w-0 overflow-x-hidden bg-background transition-colors duration-500">
      <div className="gradient-mesh" />
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-40 w-[420px] h-[420px] rounded-full opacity-15 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, hsl(265, 70%, 55%) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 min-w-0 relative z-10 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden scrollbar-glass"
      >
        <Outlet />
      </motion.main>
      {/* Mobile bottom nav — visible only on mobile */}
      <MobileBottomNav />
    </div>
  );
}
