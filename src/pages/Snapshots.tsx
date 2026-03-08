import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LuCamera as Camera,
  LuUser as User,
  LuMail as Mail,
  LuSmile as Smile,
  LuLoaderCircle as Loader2,
  LuRefreshCw as RefreshCw,
  LuMapPin as MapPin,
  LuCalendar as Calendar,
} from "react-icons/lu";
import { supabase } from "@/lib/supabase";

interface Snapshot {
  id: string;
  user_name: string;
  user_email: string;
  image_url: string;
  image_path: string;
  description: string | null;
  sentiment: string;
  pos_x: number | null;
  pos_y: number | null;
  pos_z: number | null;
  created_at: string;
}

async function fetchSnapshots(): Promise<Snapshot[]> {
  const { data, error } = await supabase
    .from("ar_snapshots")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sentimentColor(sentiment: string) {
  const s = sentiment.toLowerCase();
  if (s === "positive" || s === "happy" || s === "good") return "bg-emerald-500/15 text-emerald-400";
  if (s === "negative" || s === "sad" || s === "bad") return "bg-red-500/15 text-red-400";
  if (s === "neutral") return "bg-yellow-500/15 text-yellow-400";
  return "bg-blue-500/15 text-blue-400";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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

export default function Snapshots() {
  const {
    data: snapshots,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["snapshots"],
    queryFn: fetchSnapshots,
    refetchInterval: 60_000,
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
                Snapshots
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Photos captured by users during their AR experience
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => refetch()}
            className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Loading snapshots...
        </div>
      ) : !snapshots || snapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <Camera className="w-16 h-16 mb-3 opacity-30" />
          <p className="text-sm font-medium">No snapshots yet</p>
          <p className="text-xs mt-1">Snapshots will appear here when users capture photos in AR.</p>
        </div>
      ) : (
        <>
          {/* Count bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-3 sm:p-4 mb-6 flex items-center gap-3"
          >
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
            </span>
          </motion.div>

          {/* Card grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {snapshots.map((snap) => (
              <motion.div
                key={snap.id}
                variants={cardItem}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-panel rounded-2xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-video bg-secondary/30 overflow-hidden">
                  <img
                    src={snap.image_url}
                    alt={snap.description || "Snapshot"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23333'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23555'%3EImage not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Sentiment badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${sentimentColor(snap.sentiment)}`}
                    >
                      <Smile className="w-3 h-3" />
                      {snap.sentiment}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Description */}
                  {snap.description && (
                    <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                      {snap.description}
                    </p>
                  )}

                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {snap.user_name}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{snap.user_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(snap.created_at)}
                    </div>
                    {(snap.pos_x != null || snap.pos_y != null || snap.pos_z != null) && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {(snap.pos_x ?? 0).toFixed(1)}, {(snap.pos_y ?? 0).toFixed(1)}, {(snap.pos_z ?? 0).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
