import { useState, useMemo, useCallback, useEffect, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Customized,
} from "recharts";
import {
  LuFlame as Flame,
  LuMapPin as MapPin,
  LuUsers as Users,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuRefreshCw as RefreshCw,
  LuLoaderCircle as Loader2,
  LuNavigation as Navigation,
  LuLocate as Locate,
  LuDoorOpen as DoorOpen,
  LuSearch as Search,
} from "react-icons/lu";
import { supabase } from "@/lib/supabase";
import {
  FLOOR_Y_THRESHOLD,
  PROXIMITY_THRESHOLD,
  ROOM_COLORS,
  distance2D,
  getFloor,
  getHeatColor,
  getHeatLabel,
  BUILDING_OUTLINE,
  BUILDING_BOUNDS,
  generateTicks,
} from "@/data/heatmapData";

interface Room {
  room_id: string;
  room_name: string;
  floor_no: string;
  pos_x: string;
  pos_y: string;
  pos_z: string;
}

interface NavNode {
  id: number;
  node_name: string;
  pos_x: string;
  pos_y: string;
  pos_z: string;
  created_by: string;
  created_at: string;
}

interface PlottedRoom {
  room_id: string;
  name: string;
  x: number;
  z: number;
  color: string;
  type: "room";
}

interface PlottedPoint {
  id: number;
  x: number;
  z: number;
  nearestRoom: string;
  nearestDist: number;
  color: string;
  type: "user";
  userName?: string;
}

const ALL_USERS_VALUE = "__ALL__";

const FLOORS = [
  { key: "ground" as const, label: "Ground Floor" },
  { key: "first" as const, label: "First Floor" },
];

async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("ar_rooms")
    .select("room_id, room_name, floor_no, pos_x, pos_y, pos_z")
    .order("room_id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function fetchNavNodes(): Promise<NavNode[]> {
  const { data, error } = await supabase
    .from("ar_nav_nodes")
    .select("id, node_name, pos_x, pos_y, pos_z, created_by, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

function parseNum(val: string | null | undefined): number {
  if (!val) return 0;
  return parseFloat(val.toString().trim()) || 0;
}

const mobileQuery = "(max-width: 639px)";
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(mobileQuery);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
const getSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => false;
function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const RoomShapeDesktop = (props: { cx?: number; cy?: number; payload?: PlottedRoom }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill={payload.color} fillOpacity={0.15} stroke={payload.color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill={payload.color} />
      <text x={cx} y={cy - 24} textAnchor="middle" fill={payload.color} fontSize={11} fontWeight={700}>
        {payload.name}
      </text>
    </g>
  );
};

const RoomShapeMobile = (props: { cx?: number; cy?: number; payload?: PlottedRoom }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={payload.color} fillOpacity={0.18} stroke={payload.color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill={payload.color} />
    </g>
  );
};

const UserPointShapeDesktop = (props: { cx?: number; cy?: number; payload?: PlottedPoint }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const opacity = payload.nearestDist < PROXIMITY_THRESHOLD ? 0.7 : 0.35;
  return <circle cx={cx} cy={cy} r={3.5} fill={payload.color} fillOpacity={opacity} />;
};

const UserPointShapeMobile = (props: { cx?: number; cy?: number; payload?: PlottedPoint }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const opacity = payload.nearestDist < PROXIMITY_THRESHOLD ? 0.7 : 0.35;
  return <circle cx={cx} cy={cy} r={2.5} fill={payload.color} fillOpacity={opacity} />;
};

/** Syncs hover to parent so details show in the fixed panel; no floating tooltip. */
function SyncTooltipToPanel({
  active,
  payload,
  onDetail,
}: {
  active?: boolean;
  payload?: Array<{ payload: PlottedRoom | PlottedPoint }>;
  onDetail: (d: PlottedRoom | PlottedPoint | null) => void;
}) {
  useEffect(() => {
    if (active && payload?.[0]) onDetail(payload[0].payload);
    else onDetail(null);
  }, [active, payload, onDetail]);
  return null;
}

function userToColorIndex(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  return Math.abs(h);
}

const BuildingOutlineRenderer = (props: any) => {
  const { xAxisMap, yAxisMap } = props;
  if (!xAxisMap || !yAxisMap) return null;

  const xKey = Object.keys(xAxisMap)[0];
  const yKey = Object.keys(yAxisMap)[0];
  if (!xKey || !yKey) return null;

  const xAxis = xAxisMap[xKey];
  const yAxis = yAxisMap[yKey];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const pts = BUILDING_OUTLINE.map((p) => ({
    px: xAxis.scale(p.z) as number,
    py: yAxis.scale(p.x) as number,
  }));

  const d =
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.px} ${p.py}`).join(" ") +
    " Z";

  return (
    <path
      d={d}
      fill="none"
      stroke="hsla(var(--primary), 0.55)"
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
};

export default function Heatmap() {
  const isMobile = useIsMobile();
  const [floorIndex, setFloorIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(ALL_USERS_VALUE);
  const [userSearch, setUserSearch] = useState("");
  const [selectedMapDetail, setSelectedMapDetail] = useState<PlottedRoom | PlottedPoint | null>(null);

  const selectedFloor = FLOORS[floorIndex].key;

  const { data: rooms, isLoading: roomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ["heatmap-rooms"],
    queryFn: fetchRooms,
    refetchInterval: 60000,
  });

  const { data: navNodes, isLoading: nodesLoading, refetch: refetchNodes } = useQuery({
    queryKey: ["heatmap-nodes"],
    queryFn: fetchNavNodes,
    refetchInterval: 30000,
  });

  const isLoading = roomsLoading || nodesLoading;

  const uniqueUsers = useMemo(() => {
    if (!navNodes) return [];
    const names = new Set<string>();
    navNodes.forEach((n) => {
      if (n.node_name && !n.node_name.startsWith("saved_")) {
        names.add(n.node_name);
      }
    });
    return Array.from(names).sort();
  }, [navNodes]);

  const filteredUserOptions = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return uniqueUsers;
    return uniqueUsers.filter((u) => u.toLowerCase().includes(q));
  }, [uniqueUsers, userSearch]);

  const roomColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms?.forEach((r, i) => {
      map[r.room_id] = ROOM_COLORS[i % ROOM_COLORS.length];
    });
    return map;
  }, [rooms]);

  const floorRooms: PlottedRoom[] = useMemo(() => {
    if (!rooms) return [];
    return rooms
      .filter((r) => {
        const y = parseNum(r.pos_y);
        return getFloor(y) === selectedFloor;
      })
      .map((r) => ({
        room_id: r.room_id,
        name: r.room_name,
        x: parseNum(r.pos_x),
        z: parseNum(r.pos_z),
        color: roomColorMap[r.room_id] || "#888",
        type: "room" as const,
      }));
  }, [rooms, selectedFloor, roomColorMap]);

  const userPoints: PlottedPoint[] = useMemo(() => {
    if (!navNodes || floorRooms.length === 0) return [];

    const filtered = navNodes.filter((n) => {
      if (n.node_name.startsWith("saved_")) return false;
      const y = parseNum(n.pos_y);
      if (getFloor(y) !== selectedFloor) return false;
      if (selectedUser !== ALL_USERS_VALUE && n.node_name !== selectedUser) return false;
      return true;
    });

    const isAllUsers = selectedUser === ALL_USERS_VALUE;

    return filtered.map((n) => {
      const x = parseNum(n.pos_x);
      const z = parseNum(n.pos_z);
      const userName = n.node_name ?? "Unknown";

      let nearestRoom = "Unknown";
      let nearestDist = Infinity;
      let nearestColor = "#6B7280";

      floorRooms.forEach((room) => {
        const dist = distance2D(x, z, room.x, room.z);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestRoom = room.name;
          nearestColor = room.color;
        }
      });

      const baseColor = nearestDist < PROXIMITY_THRESHOLD ? nearestColor : "#6B7280";
      const color = isAllUsers
        ? ROOM_COLORS[userToColorIndex(userName) % ROOM_COLORS.length]
        : baseColor;

      return {
        id: n.id,
        x,
        z,
        nearestRoom,
        nearestDist,
        color,
        type: "user" as const,
        userName,
      };
    });
  }, [navNodes, selectedUser, selectedFloor, floorRooms]);

  const roomVisitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    floorRooms.forEach((r) => (counts[r.name] = 0));
    userPoints.forEach((pt) => {
      if (pt.nearestDist < PROXIMITY_THRESHOLD && counts[pt.nearestRoom] !== undefined) {
        counts[pt.nearestRoom]++;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: floorRooms.find((r) => r.name === name)?.color || "#888" }))
      .sort((a, b) => b.count - a.count);
  }, [userPoints, floorRooms]);

  const totalPoints = userPoints.length;
  const roomsVisited = roomVisitCounts.filter((r) => r.count > 0).length;
  const mostVisitedRoom = roomVisitCounts[0]?.name ?? "—";
  const avgDist = useMemo(() => {
    if (userPoints.length === 0) return 0;
    return userPoints.reduce((s, p) => s + p.nearestDist, 0) / userPoints.length;
  }, [userPoints]);

  const switchFloor = useCallback((dir: -1 | 1) => {
    setFloorIndex((prev) => Math.max(0, Math.min(FLOORS.length - 1, prev + dir)));
  }, []);

  const refetchAll = useCallback(() => {
    refetchRooms();
    refetchNodes();
  }, [refetchRooms, refetchNodes]);

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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/25 ring-2 ring-white/10 shrink-0"
            >
              <img src="/favicon.ico" alt="NavMe" className="w-full h-full object-contain" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                Residence Heatmap
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Real-time AR navigation tracking
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={refetchAll}
            className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Dedicated User selection — search, All users, or pick one user */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="glass-panel p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Select user</h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              View heatmap for a specific user or all users at once.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 min-w-0">
            <label htmlFor="heatmap-user-search" className="sr-only">Search user</label>
            <div className="flex items-center gap-2 glass-input py-2.5 px-3 rounded-xl">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                id="heatmap-user-search"
                type="text"
                placeholder="Search user by name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          {/* All users option — prominent */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUser(ALL_USERS_VALUE)}
            className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium border-2 transition-all flex items-center gap-2 ${
              selectedUser === ALL_USERS_VALUE
                ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                : "bg-secondary/30 border-border/50 text-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <Users className="w-4 h-4" />
            See all user activity
          </motion.button>
        </div>

        {/* User list — select one user */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Or select a user:</p>
          {uniqueUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">No users with tracking data yet.</p>
          ) : filteredUserOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">No users match &quot;{userSearch.trim()}&quot;.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredUserOptions.map((u) => (
                <motion.button
                  key={u}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedUser(u)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all border-2 ${
                    selectedUser === u
                      ? "bg-primary/20 border-primary text-primary shadow-md shadow-primary/10"
                      : "bg-secondary/20 border-border/40 text-foreground hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  {u}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Current selection indicator */}
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing:</span>
          <span className="font-medium text-foreground">
            {selectedUser === ALL_USERS_VALUE ? "All users" : selectedUser}
          </span>
        </div>
      </motion.div>

      {/* Floor switcher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-4 sm:p-5 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-3">
          <DoorOpen className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground mr-1">Floor</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => switchFloor(-1)}
            disabled={floorIndex === 0}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <div className="min-w-[130px] text-center">
            <span className="text-sm font-bold text-foreground">{FLOORS[floorIndex].label}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => switchFloor(1)}
            disabled={floorIndex === FLOORS.length - 1}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {[
          { label: "Tracking Points", desc: selectedUser === ALL_USERS_VALUE ? "All users" : `For ${selectedUser}`, value: totalPoints, icon: Navigation, color: "text-primary" },
          { label: "Rooms Visited", desc: `Within ${PROXIMITY_THRESHOLD}m radius`, value: roomsVisited, icon: DoorOpen, color: "text-emerald-400" },
          { label: "Most Visited", desc: "Highest proximity count", value: mostVisitedRoom, icon: MapPin, color: "text-orange-400" },
          { label: "Avg Distance", desc: "From nearest room", value: `${avgDist.toFixed(2)}`, icon: Locate, color: "text-violet-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08, type: "spring" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-panel p-3.5 sm:p-5"
          >
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mb-1.5 sm:mb-2" />
            <div className={`text-lg sm:text-2xl font-bold ${stat.color} tracking-tight`}>
              {isLoading ? (
                <span className="inline-block w-12 h-8 rounded bg-secondary/50 animate-pulse" />
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Scatter Plot */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-3 sm:p-6 mb-4 sm:mb-6"
      >
        {/* Map header */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-5 px-1 sm:px-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {FLOORS[floorIndex].label} — Position Map
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              {isMobile ? "Tap a point • Scroll to pan" : "Hover over a point to see details below"}
            </p>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20" />
                <span className="text-[10px] text-muted-foreground">Room POI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground">User point</span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[280px] sm:h-[500px] text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-sm">Loading tracking data...</span>
          </div>
        ) : floorRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[280px] sm:h-[500px] text-muted-foreground">
            <DoorOpen className="w-12 h-12 sm:w-16 sm:h-16 mb-3 opacity-30" />
            <p className="text-sm font-medium">No rooms on this floor</p>
          </div>
        ) : (
          <div
            className="rounded-xl sm:rounded-xl overflow-x-auto overflow-y-hidden scrollbar-glass -mx-1 sm:mx-0"
            style={{ background: "hsla(var(--background), 1)", border: "1px solid hsla(var(--glass-border), 0.35)" }}
          >
            <div
              className="p-1 sm:p-3"
              style={{
                width: isMobile ? Math.max(480, floorRooms.length * 70) : "100%",
                minWidth: isMobile ? 480 : "100%",
                height: isMobile ? 420 : 580,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={
                    isMobile
                      ? { top: 12, right: 16, bottom: 24, left: 4 }
                      : { top: 30, right: 30, bottom: 30, left: 15 }
                  }
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />
                  <XAxis
                    type="number"
                    dataKey="z"
                    name="Z"
                    domain={[BUILDING_BOUNDS.zMin, BUILDING_BOUNDS.zMax]}
                    ticks={generateTicks(BUILDING_BOUNDS.zMin, BUILDING_BOUNDS.zMax, isMobile ? 3 : 1)}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: isMobile ? 8 : 10 }}
                    axisLine={{ stroke: "hsla(var(--muted-foreground), 0.6)", strokeWidth: 1.5 }}
                    tickLine={{ stroke: "hsla(var(--muted-foreground), 0.4)" }}
                    label={isMobile ? undefined : { value: "Z Axis", position: "insideBottomRight", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="x"
                    name="X"
                    domain={[BUILDING_BOUNDS.xMin, BUILDING_BOUNDS.xMax]}
                    ticks={generateTicks(BUILDING_BOUNDS.xMin, BUILDING_BOUNDS.xMax, isMobile ? 3 : 1)}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: isMobile ? 8 : 10 }}
                    axisLine={{ stroke: "hsla(var(--muted-foreground), 0.6)", strokeWidth: 1.5 }}
                    tickLine={{ stroke: "hsla(var(--muted-foreground), 0.4)" }}
                    width={isMobile ? 32 : 50}
                    label={isMobile ? undefined : { value: "X Axis", angle: -90, position: "insideLeft", offset: 10, fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <ZAxis range={isMobile ? [24, 24] : [40, 40]} />
                  <Tooltip content={<SyncTooltipToPanel onDetail={setSelectedMapDetail} />} cursor={{ stroke: "hsla(var(--primary), 0.4)", strokeWidth: 1 }} />
                  <Customized component={BuildingOutlineRenderer} />

                  <Scatter
                    name="User"
                    data={userPoints}
                    shape={isMobile ? <UserPointShapeMobile /> : <UserPointShapeDesktop />}
                    isAnimationActive={false}
                  />
                  <Scatter
                    name="Rooms"
                    data={floorRooms}
                    shape={isMobile ? <RoomShapeMobile /> : <RoomShapeDesktop />}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Room legend — always shown, critical on mobile since labels are hidden */}
        {floorRooms.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-border/20">
            {isMobile && (
              <p className="text-[10px] text-muted-foreground mb-2 px-1">Rooms on map (tap a circle for details):</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 sm:px-0 sm:justify-center">
              {floorRooms.map((room) => (
                <button
                  key={room.room_id}
                  type="button"
                  onClick={() => setSelectedMapDetail(room)}
                  className="flex items-center gap-1.5 py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-secondary/30 active:bg-secondary/40 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10" style={{ background: room.color }} />
                  <span className="text-[11px] sm:text-[10px] text-foreground/80 font-medium">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Point details */}
        <div className="mt-3 sm:mt-5 rounded-xl border border-border/30 sm:border-2 sm:border-border/40 bg-card/50 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/30 bg-muted/20">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Point details</h3>
          </div>
          <div className="p-3 sm:p-4 min-h-[72px] sm:min-h-[100px]">
            {selectedMapDetail ? (
              selectedMapDetail.type === "room" ? (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: `${(selectedMapDetail as PlottedRoom).color}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: (selectedMapDetail as PlottedRoom).color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{(selectedMapDetail as PlottedRoom).name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Room POI &middot; X: {(selectedMapDetail as PlottedRoom).x.toFixed(2)} &middot; Z: {(selectedMapDetail as PlottedRoom).z.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 flex items-center justify-center bg-primary/10">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    {(selectedMapDetail as PlottedPoint).userName && (
                      <p className="text-sm font-bold text-foreground">{(selectedMapDetail as PlottedPoint).userName}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      X: {(selectedMapDetail as PlottedPoint).x.toFixed(3)} &middot; Z: {(selectedMapDetail as PlottedPoint).z.toFixed(3)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Near <strong className="text-foreground">{(selectedMapDetail as PlottedPoint).nearestRoom}</strong> &middot; {(selectedMapDetail as PlottedPoint).nearestDist.toFixed(2)} units
                    </p>
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isMobile ? "Tap a room circle or user point on the map to see details." : "Move your cursor over a room or user point on the map to see details here."}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Room Visit Ranking */}
      {roomVisitCounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-panel p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <h2 className="text-base font-semibold text-foreground">
              Room Proximity Ranking
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            How often <strong>{selectedUser === ALL_USERS_VALUE ? "all users" : selectedUser}</strong> were tracked near each room on {FLOORS[floorIndex].label} (within {PROXIMITY_THRESHOLD} unit radius)
          </p>

          <div className="space-y-2.5">
            {roomVisitCounts.map((room, i) => {
              const maxCount = roomVisitCounts[0]?.count || 1;
              const pct = maxCount > 0 ? (room.count / maxCount) * 100 : 0;
              const intensity = maxCount > 0 ? room.count / maxCount : 0;
              return (
                <motion.div
                  key={room.name}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/20 transition-colors"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.65 + i * 0.08, type: "spring", bounce: 0.5 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: `${room.color}18`, color: room.color }}
                  >
                    #{i + 1}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{room.name}</span>
                        {room.count > 0 && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${getHeatColor(intensity)}20`, color: getHeatColor(intensity) }}
                          >
                            {getHeatLabel(intensity)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: room.color }}>
                        {room.count} hits
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.7 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background: room.count > 0
                            ? `linear-gradient(90deg, ${room.color}, ${room.color}aa)`
                            : "transparent",
                          boxShadow: room.count > 0 ? `0 0 12px ${room.color}40` : "none",
                        }}
                      />
                    </div>
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
