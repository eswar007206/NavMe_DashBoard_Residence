import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  ShoppingBag,
  Tag,
  Store,
  Users,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { tableOrder, tableConfigs } from "@/lib/tableConfig";

const routeMap: Record<string, string> = {
  ar_shop_categories: "/shop-categories",
  ar_shop_items: "/shop-items",
  ar_shop_offers: "/shop-offers",
  ar_shops: "/shops",
  ar_user_presence: "/users",
};

const iconMap: Record<string, typeof Store> = {
  ar_shop_categories: FolderOpen,
  ar_shop_items: ShoppingBag,
  ar_shop_offers: Tag,
  ar_shops: Store,
  ar_user_presence: Users,
};

const colorMap: Record<string, { gradient: string; icon: string; bg: string }> = {
  ar_shop_categories: {
    gradient: "from-cyan-500 to-teal-500",
    icon: "text-cyan-400",
    bg: "bg-cyan-500/15",
  },
  ar_shop_items: {
    gradient: "from-violet-500 to-purple-500",
    icon: "text-violet-400",
    bg: "bg-violet-500/15",
  },
  ar_shop_offers: {
    gradient: "from-amber-500 to-orange-500",
    icon: "text-amber-400",
    bg: "bg-amber-500/15",
  },
  ar_shops: {
    gradient: "from-emerald-500 to-green-500",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  ar_user_presence: {
    gradient: "from-blue-500 to-indigo-500",
    icon: "text-blue-400",
    bg: "bg-blue-500/15",
  },
};

async function fetchCounts() {
  const results = await Promise.all(
    tableOrder.map(async (key) => {
      const { count, error } = await supabase
        .from(tableConfigs[key].tableName)
        .select("*", { count: "exact", head: true });
      return { key, count: error ? 0 : (count ?? 0) };
    })
  );
  const map: Record<string, number> = {};
  results.forEach((r) => (map[r.key] = r.count));
  return map;
}

async function fetchNavNodesCount() {
  const { count, error } = await supabase
    .from("ar_nav_nodes")
    .select("*", { count: "exact", head: true });
  return error ? 0 : (count ?? 0);
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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Overview() {
  const navigate = useNavigate();

  const { data: counts, isLoading } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: fetchCounts,
    refetchInterval: 30000,
  });

  const { data: navNodesCount, isLoading: navLoading } = useQuery({
    queryKey: ["nav-nodes-count"],
    queryFn: fetchNavNodesCount,
    refetchInterval: 30000,
  });

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
            className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/25"
          >
            <img src="/favicon.ico" alt="NavME" className="w-full h-full object-contain" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome to your NavME control panel
            </p>
          </div>
        </div>
      </motion.div>

      {/* User Activity — Featured Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <motion.button
          onClick={() => navigate("/user-activity")}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className="w-full glass-panel p-6 text-left relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <Activity className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-foreground">User Activity</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track who's exploring your property the most
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {navLoading ? (
                        <span className="inline-block w-8 h-4 rounded bg-secondary/50 animate-pulse" />
                      ) : (
                        `${navNodesCount ?? 0} total activity points`
                      )}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
            </div>
            <motion.div
              className="text-muted-foreground group-hover:text-primary transition-colors"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>

      {/* Section Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {tableOrder.map((key) => {
          const cfg = tableConfigs[key];
          const Icon = iconMap[key];
          const colors = colorMap[key];
          const count = counts?.[key];
          const route = routeMap[key];
          return (
            <motion.button
              key={key}
              variants={cardItem}
              onClick={() => navigate(route)}
              whileHover={{
                y: -6,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.97 }}
              className="glass-panel p-5 text-left relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-[0.04]`} />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </motion.div>
                  <motion.div
                    className="text-muted-foreground/40 group-hover:text-muted-foreground/80 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
                <motion.div
                  className="text-3xl font-bold text-foreground tracking-tight mb-1"
                >
                  {isLoading ? (
                    <span className="inline-block w-12 h-9 rounded bg-secondary/50 animate-pulse" />
                  ) : (
                    count ?? 0
                  )}
                </motion.div>
                <div className="text-sm font-medium text-foreground/80">{cfg.displayName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{cfg.description}</div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Quick Guide */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-6 mt-6"
      >
        <h2 className="text-sm font-bold text-foreground mb-3">How to use this dashboard</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Use the menu on the left to navigate between different sections. Each section lets you:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><span className="text-foreground font-medium">Search</span> — quickly find what you're looking for</li>
            <li><span className="text-foreground font-medium">Add New</span> — create a new entry</li>
            <li><span className="text-foreground font-medium">Edit</span> — make changes to any existing entry</li>
            <li><span className="text-foreground font-medium">Delete</span> — remove entries you no longer need</li>
            <li><span className="text-foreground font-medium">Refresh</span> — get the latest data</li>
          </ul>
          <p className="mt-3">Click on any card above to jump directly to that section.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
