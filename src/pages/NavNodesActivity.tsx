import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LuRefreshCw as RefreshCw, LuLoaderCircle as Loader2, LuTrendingUp as TrendingUp, LuTrophy as Trophy, LuUsers as Users, LuChartColumn as BarChart3 } from "react-icons/lu";
import { supabase } from "@/lib/supabase";

const BAR_COLORS = [
  "hsl(221, 83%, 53%)", // Updated to Blue (Primary)
  "hsl(265, 75%, 60%)",
  "hsl(35, 90%, 55%)",
  "hsl(155, 70%, 45%)",
  "hsl(210, 85%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(45, 85%, 55%)",
  "hsl(190, 60%, 50%)",
  "hsl(280, 65%, 55%)",
  "hsl(15, 80%, 55%)",
];

function truncateName(name: string, max = 10): string {
  if (name.length <= max) return name;
  return name.slice(0, max) + "...";
}

const CustomXAxisTick = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) => {
  const label = truncateName(payload?.value ?? "", 10);
  return (
    <text
      x={x}
      y={(y ?? 0) + 12}
      textAnchor="middle"
      fill="hsl(var(--muted-foreground))"
      fontSize={12}
      fontWeight={600}
    >
      {label}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; points: number; created_by: string } }> }) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel px-4 py-3 text-sm shadow-2xl"
      >
        <p className="text-foreground font-semibold text-base">{data.name}</p>
        <p className="text-muted-foreground text-xs mt-1">Created by {data.created_by}</p>
        <div className="flex items-center gap-2 mt-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-primary font-bold text-lg">{data.points}</span>
          <span className="text-muted-foreground text-xs">points</span>
        </div>
      </motion.div>
    );
  }
  return null;
};

export default function NavNodesActivity() {
  const { data: rawNodes, isLoading, refetch } = useQuery({
    queryKey: ["user-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ar_nav_nodes")
        .select("node_name, created_by");
      if (error) throw error;
      return data as { node_name: string; created_by: string }[];
    },
  });

  const chartData = useMemo(() => {
    if (!rawNodes) return [];
    const grouped: Record<string, { count: number; created_by: string }> = {};
    rawNodes.forEach((node) => {
      const name = node.node_name || "Unknown";
      if (!grouped[name]) {
        grouped[name] = { count: 0, created_by: node.created_by || "—" };
      }
      grouped[name].count++;
    });
    return Object.entries(grouped)
      .map(([name, { count, created_by }]) => ({
        name,
        points: count,
        created_by,
      }))
      .sort((a, b) => b.points - a.points);
  }, [rawNodes]);

  const totalPoints = rawNodes?.length ?? 0;
  const totalUsers = chartData.length;
  const topScore = chartData[0]?.points ?? 0;
  const chartWidth = Math.max(600, chartData.length * 110);

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/25 shrink-0"
            >
              <img src="/favicon.ico" alt="NavMe" className="w-full h-full object-contain" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                User Activity
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Navigation activity per user
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => refetch()}
            className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {[
          { label: "Total Activity Points", desc: "Sum of all navigation actions", value: totalPoints, color: "primary", icon: BarChart3 },
          { label: "Active Users", desc: "Unique users who navigated", value: totalUsers, color: "accent", icon: Users },
          { label: "Highest Score", desc: "Most points by a single user", value: topScore, color: "glass-success", icon: Trophy },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, type: "spring" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-panel p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1, type: "spring", bounce: 0.4 }}
              className={`text-3xl font-bold text-${stat.color} tracking-tight`}
            >
              {isLoading ? (
                <span className="inline-block w-12 h-9 rounded bg-secondary/50 animate-pulse" />
              ) : (
                stat.value
              )}
            </motion.div>
            <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Vertical Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-4 sm:p-6 min-w-0 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">Activity Points per User</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Every navigation action earns 1 point — taller bars mean more active users</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            Loading activity data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] sm:h-[400px] text-muted-foreground">
            <img src="/favicon.ico" alt="NavMe" className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-medium">No activity recorded yet</p>
            <p className="text-xs mt-1">Activity will appear here once users start navigating</p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto scrollbar-glass -mx-2 px-2">
            <div style={{ width: chartWidth, minWidth: "100%", height: "min(400px, 55vw)" }} className="min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <defs>
                    {chartData.map((_, i) => (
                      <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={1} />
                        <stop offset="100%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsla(var(--muted-foreground), 0.2)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "hsla(var(--glass), 0.4)", radius: 12 }}
                  />
                  <Bar
                    dataKey="points"
                    radius={[12, 12, 4, 4]}
                    maxBarSize={70}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={`url(#barGrad${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </motion.div>

      {/* Leaderboard */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-panel p-4 sm:p-6 mt-4 sm:mt-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-foreground">Leaderboard</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Rankings based on total navigation activity — the more you explore, the higher you rank</p>
          <div className="space-y-2">
            {chartData.map((entry, i) => {
              const pct = topScore > 0 ? (entry.points / topScore) * 100 : 0;
              return (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/20 transition-colors group"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.08, type: "spring", bounce: 0.5 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: `${BAR_COLORS[i % BAR_COLORS.length]}20`,
                      color: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  >
                    #{i + 1}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{entry.name}</span>
                      <span className="text-sm font-bold" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>
                        {entry.points} pts
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[i % BAR_COLORS.length]}aa)`,
                          boxShadow: `0 0 12px ${BAR_COLORS[i % BAR_COLORS.length]}40`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Created by {entry.created_by}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
