import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuLayoutDashboard as LayoutDashboard,
  LuFolderOpen as FolderOpen,
  LuInfo as Info,
  LuDoorOpen as DoorOpen,
  LuUsers as Users,
  LuActivity as Activity,
  LuFlame as Flame,
  LuShieldCheck as ShieldCheck,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
} from "react-icons/lu";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Activity, label: "User Activity", path: "/user-activity" },
  { icon: Flame, label: "Heatmap", path: "/heatmap" },
  { icon: ShieldCheck, label: "Block/Unblock", path: "/block-rooms" },
  { icon: FolderOpen, label: "Room Categories", path: "/room-categories" },
  { icon: Info, label: "Room Information", path: "/room-information" },
  { icon: DoorOpen, label: "Rooms", path: "/rooms" },
  { icon: Users, label: "Users", path: "/users" },
];

const sidebarVariants = {
  hidden: { x: -24, opacity: 0, filter: "blur(8px)" },
  show: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="show"
      className={`glass-sidebar h-screen sticky top-0 flex flex-col transition-all duration-500 ease-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex items-center gap-3 px-5 py-6 border-b border-border/20"
      >
        <motion.div
          className="w-10 h-10 rounded-xl shrink-0 overflow-hidden ring-2 ring-white/10 shadow-lg"
          whileHover={{
            scale: 1.1,
            rotate: 5,
            boxShadow: "0 12px 32px -8px hsl(var(--primary) / 0.35)",
            transition: { type: "spring", stiffness: 400 },
          }}
        >
          <img src="/favicon.ico" alt="NavMe" className="w-full h-full object-contain" />
        </motion.div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-lg font-bold tracking-tight text-foreground"
          >
            NavMe
          </motion.span>
        )}
      </motion.div>

      {/* Menu */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 scrollbar-glass overflow-y-auto">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              custom={i}
              variants={menuItemVariants}
              initial="hidden"
              animate="show"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "text-primary shadow-[0_0_32px_hsla(var(--primary),0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileHover={{
                x: 6,
                scale: 1.02,
                transition: { duration: 0.25 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBg"
                  className="absolute inset-0 rounded-xl bg-primary/15 ring-1 ring-primary/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-secondary/30 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              )}
              <motion.div
                className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                  isActive ? "bg-primary/20" : "bg-transparent"
                }`}
                whileHover={{ scale: 1.08 }}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              </motion.div>
              {!collapsed && <span className="truncate relative z-10">{item.label}</span>}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0 relative z-10 shadow-[0_0_12px_hsl(var(--primary))]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border/20">
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors text-sm"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.div>
          {!collapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
