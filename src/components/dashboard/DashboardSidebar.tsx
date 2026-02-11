import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  ShoppingBag,
  Tag,
  Store,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Activity, label: "User Activity", path: "/user-activity" },
  { icon: FolderOpen, label: "Shop Categories", path: "/shop-categories" },
  { icon: ShoppingBag, label: "Shop Items", path: "/shop-items" },
  { icon: Tag, label: "Shop Offers", path: "/shop-offers" },
  { icon: Store, label: "Shops", path: "/shops" },
  { icon: Users, label: "Users", path: "/users" },
];

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
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
        collapsed ? "w-[72px]" : "w-[250px]"
      }`}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center gap-3 px-5 py-6 border-b border-border/30"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="w-9 h-9 rounded-xl shrink-0 overflow-hidden"
        >
          <img src="/favicon.ico" alt="NavME" className="w-full h-full object-contain" />
        </motion.div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-lg font-bold tracking-tight text-foreground"
          >
            NavME
          </motion.span>
        )}
      </motion.div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 scrollbar-glass overflow-y-auto">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              custom={i}
              variants={menuItemVariants}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.03, x: 4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_25px_hsla(175,80%,50%,0.12)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBg"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 shrink-0 relative z-10 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate relative z-10">{item.label}</span>}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0 relative z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border/30">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-sm"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.div>
          {!collapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
