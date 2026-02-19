import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LuFolderOpen as FolderOpen,
  LuInfo as Info,
  LuDoorOpen as DoorOpen,
  LuUsers as Users,
  LuTrendingUp as TrendingUp,
  LuArrowRight as ArrowRight,
  LuActivity as Activity,
} from "react-icons/lu";
import { supabase } from "@/lib/supabase";
import { tableOrder, tableConfigs } from "@/lib/tableConfig";

const routeMap: Record<string, string> = {
  ar_room_categories: "/room-categories",
  ar_room_information: "/room-information",
  ar_rooms: "/rooms",
  ar_user_presence: "/users",
};

const iconMap: Record<string, typeof DoorOpen> = {
  ar_room_categories: FolderOpen,
  ar_room_information: Info,
  ar_rooms: DoorOpen,
  ar_user_presence: Users,
};

const colorMap: Record<string, { gradient: string; icon: string; bg: string; glow: string }> = {
  ar_room_categories: {
    gradient: "from-cyan-500 to-teal-500",
    icon: "text-cyan-400",
    bg: "bg-cyan-500/15",
    glow: "shadow-cyan-500/25",
  },
  ar_room_information: {
    gradient: "from-violet-500 to-purple-500",
    icon: "text-violet-400",
    bg: "bg-violet-500/15",
    glow: "shadow-violet-500/25",
  },
  ar_rooms: {
    gradient: "from-emerald-500 to-green-500",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/15",
    glow: "shadow-emerald-500/25",
  },
  ar_user_presence: {
    gradient: "from-blue-500 to-indigo-500",
    icon: "text-blue-400",
    bg: "bg-blue-500/15",
    glow: "shadow-blue-500/25",
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
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 48, scale: 0.9, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
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
      className="space-y-8"
    >
      {/* Header — big entrance */}
      <motion.div
        initial={{ opacity: 0, y: -32, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 ring-2 ring-white/10"
          >
            <img src="/favicon.ico" alt="NavMe" className="w-full h-full object-contain" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-sm text-muted-foreground mt-1"
            >
              Welcome to your NavMe Residence control panel
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* User Activity — featured hero card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <motion.button
          onClick={() => navigate("/user-activity")}
          className="w-full glass-panel p-5 sm:p-8 text-left relative overflow-hidden group rounded-2xl sm:rounded-3xl"
          whileHover={{
            y: -12,
            scale: 1.01,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          whileTap={{ scale: 0.995 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/40 ring-2 ring-white/20 shrink-0"
                whileHover={{
                  rotate: 360,
                  scale: 1.1,
                  boxShadow: "0 25px 50px -12px hsl(var(--primary) / 0.5)",
                  transition: { duration: 0.7, type: "spring" },
                }}
              >
                <Activity className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-foreground">User Activity</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track who's exploring your residence the most
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {navLoading ? (
                        <span className="inline-block w-10 h-5 rounded bg-secondary/50 animate-pulse" />
                      ) : (
                        `${navNodesCount ?? 0} total activity points`
                      )}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
            </div>
            <motion.div
              className="text-muted-foreground group-hover:text-primary transition-colors hidden sm:block"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-8 h-8" />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>

      {/* Section Cards — staggered, big hovers */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
              className="glass-panel p-6 text-left relative overflow-hidden group rounded-2xl"
              whileHover={{
                y: -12,
                scale: 1.03,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`}
              />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}
                    whileHover={{
                      rotate: 12,
                      scale: 1.15,
                      transition: { type: "spring", stiffness: 400 },
                    }}
                  >
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </motion.div>
                  <motion.div
                    className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
                <motion.div
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2"
                  layout
                >
                  {isLoading ? (
                    <span className="inline-block w-14 h-10 rounded-lg bg-secondary/50 animate-pulse" />
                  ) : (
                    count ?? 0
                  )}
                </motion.div>
                <div className="text-base font-semibold text-foreground/90">{cfg.displayName}</div>
                <div className="text-xs text-muted-foreground mt-1">{cfg.description}</div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Quick Guide — glass with subtle entrance */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-5 sm:p-8 mt-6 sm:mt-8 rounded-2xl"
      >
        <h2 className="text-base font-bold text-foreground mb-4">How to use this dashboard</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Use the menu on the left to navigate between different sections. Each section lets you:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><span className="text-foreground font-medium">Search</span> — quickly find what you're looking for</li>
            <li><span className="text-foreground font-medium">Add New</span> — create a new entry</li>
            <li><span className="text-foreground font-medium">Edit</span> — make changes to any existing entry</li>
            <li><span className="text-foreground font-medium">Delete</span> — remove entries you no longer need</li>
            <li><span className="text-foreground font-medium">Refresh</span> — get the latest data</li>
          </ul>
          <p className="mt-4">Click on any card above to jump directly to that section.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
