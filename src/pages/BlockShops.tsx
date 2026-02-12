import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldOff, X, Check } from "lucide-react";
import { heatmapStores } from "@/data/heatmapData";

interface ShopStatus {
  [id: number]: boolean;
}

interface Toast {
  id: number;
  shopName: string;
  active: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function BlockShops() {
  const [status, setStatus] = useState<ShopStatus>(() => {
    const init: ShopStatus = {};
    heatmapStores.forEach((s) => (init[s.id] = true));
    return init;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toggle = (id: number, name: string) => {
    const next = !status[id];
    setStatus((prev) => ({ ...prev, [id]: next }));

    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, shopName: name, active: next }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3000);
  };

  const activeCount = Object.values(status).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Block / Unblock Shops
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enable or disable rooms and shops in the mall
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-4 mb-6 flex items-center justify-between"
        style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-sm font-medium text-foreground">
              {activeCount} Active
            </span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
            <span className="text-sm font-medium text-foreground">
              {heatmapStores.length - activeCount} Blocked
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {heatmapStores.length} total shops
        </span>
      </motion.div>

      {/* Shop cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {heatmapStores.map((store) => {
          const isActive = status[store.id];
          return (
            <motion.div
              key={store.id}
              variants={cardItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-panel p-5 relative overflow-hidden"
              style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
            >
              {/* Subtle gradient overlay based on status */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${store.color}08 0%, transparent 60%)`,
                }}
              />

              <div className="relative z-10">
                {/* Top row: logo + toggle */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/90 dark:bg-white/10 p-1.5 shadow-sm">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        isActive ? "" : "grayscale opacity-40"
                      }`}
                    />
                  </div>

                  {/* iOS-style toggle */}
                  <button
                    onClick={() => toggle(store.id, store.name)}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20"
                        : "bg-secondary/60"
                    }`}
                  >
                    <motion.div
                      className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm"
                      animate={{ left: isActive ? 24 : 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>

                {/* Store info */}
                <h3
                  className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {store.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {store.category}
                </p>

                {/* Status badge */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-red-400"
                      }`}
                    />
                    {isActive ? "Active" : "Blocked"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`glass-panel px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-2xl border ${
                toast.active
                  ? "border-emerald-500/30"
                  : "border-red-500/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  toast.active
                    ? "bg-emerald-500/15"
                    : "bg-red-500/15"
                }`}
              >
                {toast.active ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {toast.shopName}
                </p>
                <p
                  className={`text-xs font-medium ${
                    toast.active ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {toast.active
                    ? "Shop is now active"
                    : "Shop is now disabled"}
                </p>
              </div>
              <button
                onClick={() =>
                  setToasts((prev) =>
                    prev.filter((t) => t.id !== toast.id)
                  )
                }
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
