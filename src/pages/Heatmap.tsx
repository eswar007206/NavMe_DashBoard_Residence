import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Flame,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Calendar,
  Timer,
} from "lucide-react";
import {
  heatmapStores,
  trafficData,
  timePresets,
  hourOptions,
  formatHour,
  getHeatColor,
  getHeatLabel,
} from "@/data/heatmapData";

/* ─── Chart Tooltip ─── */
const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel px-4 py-3 text-sm shadow-2xl"
      >
        <p className="text-foreground font-semibold mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 py-0.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground text-xs">{p.name}</span>
            <span className="text-foreground font-semibold text-xs ml-auto">
              {p.value}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

/* ─── Main Component ─── */
export default function Heatmap() {
  const [timeRange, setTimeRange] = useState<[number, number]>([9, 20]);
  const [activePreset, setActivePreset] = useState("All Day");
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState("Today");

  /* ── Filtered & aggregated data ── */
  const filteredTraffic = useMemo(
    () =>
      trafficData.filter(
        (t) => t.hour >= timeRange[0] && t.hour <= timeRange[1]
      ),
    [timeRange]
  );

  const storeTraffic = useMemo(() => {
    const map: Record<number, { visits: number; avgDwell: number }> = {};
    filteredTraffic.forEach((t) => {
      if (!map[t.storeId]) map[t.storeId] = { visits: 0, avgDwell: 0 };
      map[t.storeId].visits += t.visits;
      map[t.storeId].avgDwell += t.avgDwellMinutes;
    });
    Object.keys(map).forEach((id) => {
      const count = filteredTraffic.filter(
        (t) => t.storeId === Number(id)
      ).length;
      if (count > 0) map[Number(id)].avgDwell = Math.round(map[Number(id)].avgDwell / count);
    });
    return map;
  }, [filteredTraffic]);

  const maxVisits = useMemo(
    () => Math.max(...Object.values(storeTraffic).map((t) => t.visits), 1),
    [storeTraffic]
  );

  /* ── Stats ── */
  const totalVisits = Object.values(storeTraffic).reduce(
    (s, t) => s + t.visits,
    0
  );

  const peakHour = useMemo(() => {
    const hourTotals: Record<number, number> = {};
    filteredTraffic.forEach((t) => {
      hourTotals[t.hour] = (hourTotals[t.hour] || 0) + t.visits;
    });
    const peak = Object.entries(hourTotals).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    )[0];
    return peak ? Number(peak[0]) : 9;
  }, [filteredTraffic]);

  const topStore = useMemo(() => {
    const sorted = Object.entries(storeTraffic).sort(
      (a, b) => b[1].visits - a[1].visits
    );
    return sorted[0]
      ? heatmapStores.find((s) => s.id === Number(sorted[0][0]))
      : null;
  }, [storeTraffic]);

  const avgDwell = useMemo(() => {
    const vals = Object.values(storeTraffic);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((s, t) => s + t.avgDwell, 0) / vals.length);
  }, [storeTraffic]);

  /* ── Sorted stores for ranking ── */
  const sortedStores = useMemo(
    () =>
      [...heatmapStores].sort(
        (a, b) =>
          (storeTraffic[b.id]?.visits ?? 0) -
          (storeTraffic[a.id]?.visits ?? 0)
      ),
    [storeTraffic]
  );

  /* ── Deterministic dot positions (Vogel spiral) ── */
  const dots = useMemo(() => {
    const result: Record<
      number,
      Array<{ x: number; y: number; size: number; opacity: number; delay: number }>
    > = {};

    heatmapStores.forEach((store) => {
      const visits = storeTraffic[store.id]?.visits ?? 0;
      const intensity = maxVisits > 0 ? visits / maxVisits : 0;
      const dotCount = Math.max(4, Math.round(intensity * 20));
      const arr: typeof result[number] = [];
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const maxRadius = 4 + intensity * 7;

      for (let i = 0; i < dotCount; i++) {
        const angle = i * goldenAngle + store.id * 1.3;
        const r = Math.sqrt((i + 1) / dotCount) * maxRadius;
        arr.push({
          x: store.position.x + Math.cos(angle) * r,
          y: store.position.y + Math.sin(angle) * r,
          size: 3 + intensity * 5 * (1 - (i / dotCount) * 0.5),
          opacity: 0.25 + intensity * 0.55 * (1 - (i / dotCount) * 0.4),
          delay: i * 0.04,
        });
      }
      result[store.id] = arr;
    });
    return result;
  }, [storeTraffic, maxVisits]);

  /* ── Line chart data ── */
  const lineChartData = useMemo(() => {
    const hours: number[] = [];
    for (let h = timeRange[0]; h <= timeRange[1]; h++) hours.push(h);
    return hours.map((hour) => {
      const entry: Record<string, number | string> = {
        hour: formatHour(hour),
      };
      heatmapStores.forEach((store) => {
        const rec = trafficData.find(
          (t) => t.storeId === store.id && t.hour === hour
        );
        entry[store.name] = rec?.visits ?? 0;
      });
      return entry;
    });
  }, [timeRange]);

  /* ── Handlers ── */
  const handlePreset = (preset: (typeof timePresets)[number]) => {
    setTimeRange(preset.range);
    setActivePreset(preset.label);
  };

  const handleStartHour = (val: number) => {
    setTimeRange([val, Math.max(val, timeRange[1])]);
    setActivePreset("");
  };

  const handleEndHour = (val: number) => {
    setTimeRange([Math.min(timeRange[0], val), val]);
    setActivePreset("");
  };

  /* ━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━ */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Foot Traffic Heatmap
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Analyze visitor density and dwell time across mall stores
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-5 mb-6"
        style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
      >
        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Time Range
          </span>
          {timePresets.map((preset) => (
            <motion.button
              key={preset.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreset(preset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                activePreset === preset.label
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>

        {/* Custom range + date */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From</span>
            <select
              className="glass-input py-1.5 px-2.5 text-xs min-w-[80px]"
              value={timeRange[0]}
              onChange={(e) => handleStartHour(Number(e.target.value))}
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">to</span>
            <select
              className="glass-input py-1.5 px-2.5 text-xs min-w-[80px]"
              value={timeRange[1]}
              onChange={(e) => handleEndHour(Number(e.target.value))}
            >
              {hourOptions
                .filter((h) => h >= timeRange[0])
                .map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
            </select>
          </div>

          <div className="h-5 w-px bg-border/50 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              className="glass-input py-1.5 px-2.5 text-xs min-w-[110px]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          {
            label: "Total Visits",
            desc: "Across all stores",
            value: totalVisits,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Peak Hour",
            desc: "Highest overall traffic",
            value: formatHour(peakHour),
            icon: Clock,
            color: "text-orange-400",
          },
          {
            label: "Most Popular",
            desc: "Highest footfall store",
            value: topStore?.name ?? "—",
            icon: MapPin,
            color: "text-emerald-400",
          },
          {
            label: "Avg Dwell Time",
            desc: "Average across stores",
            value: `${avgDwell} min`,
            icon: Timer,
            color: "text-violet-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + i * 0.08,
              type: "spring",
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-panel p-5"
            style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
          >
            <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
            <div className={`text-2xl font-bold ${stat.color} tracking-tight`}>
              {stat.value}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {stat.label}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Mall Map ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-6 mb-6"
        style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
      >
        {/* Map header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Mall Floor Plan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click stores to highlight &middot; Toggle heatmap overlay
            </p>
          </div>

          {/* Heatmap toggle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              heatmapEnabled
                ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 shadow-md shadow-orange-500/10 border border-orange-500/30"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            {heatmapEnabled ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span>Heatmap</span>
            {/* iOS toggle */}
            <div
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                heatmapEnabled
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-secondary"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ left: heatmapEnabled ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Map container */}
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{ aspectRatio: "16 / 9", minHeight: 420, background: "hsla(var(--background), 1)", border: "2px solid hsla(var(--glass-border), 0.5)" }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(hsla(var(--glass-border), 0.06) 1px, transparent 1px),
                linear-gradient(90deg, hsla(var(--glass-border), 0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Corridor lines */}
          <div
            className="absolute top-0 left-1/2 w-px h-full -translate-x-1/2"
            style={{ background: "hsla(var(--glass-border), 0.12)" }}
          />
          <div
            className="absolute left-0 top-1/2 w-full h-px -translate-y-1/2"
            style={{ background: "hsla(var(--glass-border), 0.12)" }}
          />

          {/* Entrance label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-[0.2em]">
              Entrance
            </span>
          </div>

          {/* Exit label */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] text-muted-foreground/50 font-semibold uppercase tracking-[0.2em]">
              Exit
            </span>
          </div>

          {/* Heat glows */}
          <AnimatePresence>
            {heatmapEnabled &&
              heatmapStores.map((store) => {
                const intensity =
                  (storeTraffic[store.id]?.visits ?? 0) / maxVisits;
                const size = 140 + intensity * 140;
                return (
                  <motion.div
                    key={`glow-${store.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: `${store.position.x}%`,
                      top: `${store.position.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: size,
                      height: size,
                      background: `radial-gradient(circle, ${getHeatColor(intensity)}28 0%, ${getHeatColor(intensity)}0a 50%, transparent 70%)`,
                      filter: `blur(${10 + intensity * 18}px)`,
                    }}
                  />
                );
              })}
          </AnimatePresence>

          {/* Dots */}
          <AnimatePresence>
            {heatmapEnabled &&
              heatmapStores.map((store) => {
                const intensity =
                  (storeTraffic[store.id]?.visits ?? 0) / maxVisits;
                const heatColor = getHeatColor(intensity);
                return dots[store.id]?.map((dot, i) => (
                  <motion.div
                    key={`dot-${store.id}-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: dot.opacity, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      delay: 0.2 + dot.delay,
                      duration: 0.4,
                      type: "spring",
                    }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: dot.size,
                      height: dot.size,
                      background: heatColor,
                      boxShadow: `0 0 ${dot.size * 2}px ${heatColor}50`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ));
              })}
          </AnimatePresence>

          {/* Store cards */}
          {heatmapStores.map((store, i) => {
            const visits = storeTraffic[store.id]?.visits ?? 0;
            const intensity = maxVisits > 0 ? visits / maxVisits : 0;
            const isSelected = selectedStore === store.id;
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.4,
                }}
                className="absolute z-10 cursor-pointer"
                style={{
                  left: `${store.position.x}%`,
                  top: `${store.position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                whileHover={{ scale: 1.12, zIndex: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedStore(isSelected ? null : store.id)
                }
              >
                <div
                  className={`glass-panel p-2 flex flex-col items-center gap-1 min-w-[72px] transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/90 dark:bg-white/10 flex items-center justify-center p-1">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector("span")) {
                          const span = document.createElement("span");
                          span.className =
                            "text-sm font-bold text-foreground";
                          span.textContent = store.name
                            .charAt(0)
                            .toUpperCase();
                          parent.appendChild(span);
                        }
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight whitespace-nowrap">
                    {store.name}
                  </span>
                  {heatmapEnabled && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${getHeatColor(intensity)}20`,
                        color: getHeatColor(intensity),
                      }}
                    >
                      {visits}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Legend */}
          <AnimatePresence>
            {heatmapEnabled && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute bottom-3 left-3 glass-panel p-2.5 z-20"
              >
                <p className="text-[10px] font-semibold text-foreground mb-1.5">
                  Traffic Density
                </p>
                {[
                  { color: "#3B82F6", label: "Low" },
                  { color: "#22D3EE", label: "Moderate" },
                  { color: "#EAB308", label: "High" },
                  { color: "#F97316", label: "Very High" },
                  { color: "#EF4444", label: "Peak" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 py-0.5"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: item.color,
                        boxShadow: `0 0 6px ${item.color}60`,
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Hourly Traffic Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-6 mb-6"
        style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Hourly Traffic Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visitor count per store across selected time range
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatHour(timeRange[0])} – {formatHour(timeRange[1])}
            </span>
          </div>
        </div>

        <div
          className="overflow-x-auto scrollbar-glass rounded-xl p-3"
          style={{ background: "hsla(var(--background), 1)", border: "2px solid hsla(var(--glass-border), 0.5)" }}
        >
          <div style={{ minWidth: 500, height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ left: 5, right: 15, top: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsla(var(--muted-foreground), 0.15)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: "hsla(var(--glass-border), 0.3)",
                    strokeDasharray: "4 4",
                  }}
                />
                {heatmapStores.map((store) => (
                  <Line
                    key={store.id}
                    type="monotone"
                    dataKey={store.name}
                    stroke={store.color}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: store.color, strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: store.color,
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    opacity={
                      selectedStore === null || selectedStore === store.id
                        ? 1
                        : 0.15
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inline chart legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-border/20">
          {heatmapStores.map((store) => (
            <motion.button
              key={store.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setSelectedStore(
                  selectedStore === store.id ? null : store.id
                )
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedStore === store.id
                  ? "bg-secondary/80 text-foreground"
                  : selectedStore === null
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: store.color }}
              />
              {store.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Store Traffic Ranking ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-panel p-6"
        style={{ background: "hsla(var(--glass), 0.92)", border: "2.5px solid hsla(var(--glass-border), 0.6)" }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h2 className="text-base font-semibold text-foreground">
            Store Traffic Ranking
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Ranked by total visits in selected time range &middot; Click a store
          to filter the chart
        </p>

        <div className="space-y-2.5">
          {sortedStores.map((store, i) => {
            const visits = storeTraffic[store.id]?.visits ?? 0;
            const dwell = storeTraffic[store.id]?.avgDwell ?? 0;
            const intensity = maxVisits > 0 ? visits / maxVisits : 0;
            const pct = maxVisits > 0 ? (visits / maxVisits) * 100 : 0;
            const isSelected = selectedStore === store.id;

            return (
              <motion.button
                key={store.id}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.55 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                onClick={() =>
                  setSelectedStore(isSelected ? null : store.id)
                }
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left ${
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-secondary/20"
                }`}
              >
                {/* Rank badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.65 + i * 0.08,
                    type: "spring",
                    bounce: 0.5,
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: `${store.color}18`,
                    color: store.color,
                  }}
                >
                  #{i + 1}
                </motion.div>

                {/* Store logo */}
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/90 dark:bg-white/10 shrink-0 p-0.5">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {store.name}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${getHeatColor(intensity)}20`,
                          color: getHeatColor(intensity),
                        }}
                      >
                        {getHeatLabel(intensity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        ~{dwell} min dwell
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: store.color }}
                      >
                        {visits} visits
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.7 + i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${store.color}, ${store.color}aa)`,
                        boxShadow: `0 0 12px ${store.color}40`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {store.category}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
