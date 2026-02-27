import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuLayoutDashboard as LayoutDashboard,
  LuActivity as Activity,
  LuFlame as Flame,
  LuShieldCheck as ShieldCheck,
  LuDoorOpen as DoorOpen,
  LuEllipsis as MoreHorizontal,
} from "react-icons/lu";
import { useState } from "react";

const primaryItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Activity, label: "Activity", path: "/user-activity" },
  { icon: Flame, label: "Heatmap", path: "/heatmap" },
  { icon: ShieldCheck, label: "Block", path: "/block-rooms" },
  { icon: MoreHorizontal, label: "More", path: "__more__" },
];

const moreItems = [
  { label: "Room Categories", path: "/room-categories" },
  { label: "Room Information", path: "/room-information" },
  { label: "Rooms", path: "/rooms" },
  { label: "Users", path: "/users" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some((m) => location.pathname === m.path);

  return (
    <>
      {/* "More" overlay */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-3 right-3 z-50 glass-panel p-3 rounded-2xl md:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {moreItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setShowMore(false);
                  }}
                  className={`text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-secondary/40"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-sidebar border-t border-border/20 safe-area-bottom">
        <div className="flex items-center justify-around px-1 h-16">
          {primaryItems.map((item) => {
            const isMore = item.path === "__more__";
            const isActive = isMore
              ? isMoreActive || showMore
              : location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  if (isMore) {
                    setShowMore((v) => !v);
                  } else {
                    navigate(item.path);
                    setShowMore(false);
                  }
                }}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
