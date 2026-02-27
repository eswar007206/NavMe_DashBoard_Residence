import React, { useState, useCallback, useMemo } from "react";
import { PROXIMITY_THRESHOLD } from "@/data/heatmapData";

// ─────────────────────────────────────────────────────────────────────────────
// AR coordinate axes (both floors share the same system):
//   x  →  vertical    HIGH x = TOP of blueprint
//   z  →  horizontal  LOW  z = LEFT,  HIGH z = RIGHT
//
// SVG mapping:
//   svgX = fn(z)   left=zMin → right=zMax
//   svgY = fn(x)   top=xMax  → bottom=xMin  [inverted]
// ─────────────────────────────────────────────────────────────────────────────

// ── GROUND FLOOR room POIs (from ar_rooms, ground floor):
//   1  Office        x=0.77   z=0.52
//   2  Guest Room    x=3.99   z=1.46
//   3  Great Room    x=6.40   z=-2.63
//   4  Breakfast     x=5.95   z=-5.53
//   5  Kitchen       x=5.78   z=-9.22
//   6  Sun Room      x=8.69   z=-6.31
//   13 Car Garage    x=-0.15  z=-8.41

// ── FIRST FLOOR room POIs (from ar_rooms, first floor):
//   7  Room 2        x=0.45   z=-3.80
//   8  Room 3        x=2.76   z=2.66
//   9  Room 4        x=5.28   z=0.09
//   10 Bonus Room    x=6.58   z=-2.17
//   11 Primary Suite x=6.58   z=-7.21
//   12 Closet        x=-0.09  z=-8.84

const PAD = { l: 28, r: 28, t: 28, b: 24 };

function makeScale(W: number, H: number, xMin: number, xMax: number, zMin: number, zMax: number) {
  const dw = W - PAD.l - PAD.r;
  const dh = H - PAD.t - PAD.b;
  const sx = (z: number) => PAD.l + ((z - zMin) / (zMax - zMin)) * dw;
  const sy = (x: number) => PAD.t + ((xMax - x) / (xMax - xMin)) * dh;
  return { sx, sy };
}

type Pt = { x: number; z: number };
type Scale = ReturnType<typeof makeScale>;

function pts2d(pts: Pt[], s: Scale) {
  return pts.map((p, i) =>
    `${i === 0 ? "M" : "L"}${s.sx(p.z).toFixed(2)},${s.sy(p.x).toFixed(2)}`
  ).join(" ") + " Z";
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUND FLOOR LAYOUT
// Data bounds: x: -1.5→10.2   z: -10.8→2.8
//
// All 7 POIs verified inside their polygons:
//   Sun Room   (8.69,-6.31) → x:7.2→10.2, z:-10.8→-4.2 ✓
//   Kitchen    (5.78,-9.22) → x:4.8→7.2,  z:-10.8→-7.4 ✓
//   Breakfast  (5.95,-5.53) → x:4.8→10.2, z:-7.4→-4.2  ✓
//   Great Room (6.40,-2.63) → x:4.8→10.2, z:-4.2→-1.0  ✓
//   Guest Room (3.99, 1.46) → x:2.2→10.2, z:-1.0→2.8   ✓
//   Office     (0.77, 0.52) → x:-1.5→2.2, z:-1.0→2.8   ✓
//   Car Garage (-0.15,-8.41)→ x:-1.5→4.8, z:-10.8→-4.2 ✓
// ─────────────────────────────────────────────────────────────────────────────
const GF = {
  xMin:-1.5, xMax:10.2, zMin:-10.8, zMax:2.8,
  // Key wall divisions
  xS:-1.5, xGN:2.2, xMN:4.8, xSRS:7.2, xN:10.2,
  zW:-10.8, zKE:-7.4, zBE:-4.2, zGE:-1.0, zE:2.8,
};

const GF_ROOMS = [
  { id:"sun_room",   col:"#EC4899", pts:[{x:GF.xSRS,z:GF.zW},{x:GF.xSRS,z:GF.zBE},{x:GF.xN,z:GF.zBE},{x:GF.xN,z:GF.zW}] },
  { id:"kitchen",    col:"#10B981", pts:[{x:GF.xMN,z:GF.zW},{x:GF.xMN,z:GF.zKE},{x:GF.xSRS,z:GF.zKE},{x:GF.xSRS,z:GF.zW}] },
  { id:"breakfast",  col:"#06B6D4", pts:[{x:GF.xMN,z:GF.zKE},{x:GF.xMN,z:GF.zBE},{x:GF.xN,z:GF.zBE},{x:GF.xN,z:GF.zKE}] },
  { id:"great_room", col:"#3B82F6", pts:[{x:GF.xMN,z:GF.zBE},{x:GF.xMN,z:GF.zGE},{x:GF.xN,z:GF.zGE},{x:GF.xN,z:GF.zBE}] },
  { id:"guest_room", col:"#8B5CF6", pts:[{x:GF.xGN,z:GF.zGE},{x:GF.xGN,z:GF.zE},{x:GF.xN,z:GF.zE},{x:GF.xN,z:GF.zGE}] },
  { id:"office",     col:"#F59E0B", pts:[{x:GF.xS,z:GF.zGE},{x:GF.xS,z:GF.zE},{x:GF.xGN,z:GF.zE},{x:GF.xGN,z:GF.zGE}] },
  { id:"dining_room",col:"#EF4444", pts:[{x:GF.xGN,z:GF.zBE},{x:GF.xGN,z:GF.zGE},{x:GF.xMN,z:GF.zGE},{x:GF.xMN,z:GF.zBE}] },
  { id:"foyer",      col:"#84CC16", pts:[{x:GF.xS,z:GF.zBE},{x:GF.xS,z:GF.zGE},{x:GF.xGN,z:GF.zGE},{x:GF.xGN,z:GF.zBE}] },
  { id:"garage",     col:"#6366F1", pts:[{x:GF.xS,z:GF.zW},{x:GF.xS,z:GF.zBE},{x:GF.xMN,z:GF.zBE},{x:GF.xMN,z:GF.zW}] },
];

const GF_WALLS: [[number,number],[number,number]][] = [
  [[GF.xSRS,GF.zW],[GF.xSRS,GF.zBE]],
  [[GF.xN,GF.zKE],[GF.xMN,GF.zKE]],
  [[GF.xN,GF.zBE],[GF.xS,GF.zBE]],
  [[GF.xN,GF.zGE],[GF.xS,GF.zGE]],
  [[GF.xMN,GF.zW],[GF.xMN,GF.zE]],
  [[GF.xGN,GF.zBE],[GF.xGN,GF.zE]],
];

interface Door { x1:number;z1:number;x2:number;z2:number;t:number;w:number;side:1|-1; }
const GF_DOORS: Door[] = [
  {x1:GF.xS,z1:GF.zW,  x2:GF.xS,z2:GF.zBE, t:0.32,w:2.5,side: 1},
  {x1:GF.xS,z1:GF.zBE, x2:GF.xS,z2:GF.zGE, t:0.6, w:0.9,side: 1},
  {x1:GF.xMN,z1:GF.zW,  x2:GF.xMN,z2:GF.zKE,t:0.75,w:0.9,side:-1},
  {x1:GF.xMN,z1:GF.zKE, x2:GF.xMN,z2:GF.zBE,t:0.5, w:0.9,side:-1},
  {x1:GF.xMN,z1:GF.zBE, x2:GF.xMN,z2:GF.zGE,t:0.35,w:1.0,side:-1},
  {x1:GF.xGN,z1:GF.zGE, x2:GF.xN, z2:GF.zGE,t:0.8, w:0.9,side: 1},
  {x1:GF.xGN,z1:GF.zBE, x2:GF.xGN,z2:GF.zGE,t:0.4, w:0.9,side:-1},
  {x1:GF.xSRS,z1:GF.zW,  x2:GF.xSRS,z2:GF.zBE,t:0.7,w:0.8,side: 1},
];

const GF_OUTER: Pt[] = [
  {x:GF.xS,z:GF.zW},{x:GF.xS,z:GF.zE},
  {x:GF.xGN,z:GF.zE},{x:GF.xN,z:GF.zE},
  {x:GF.xN,z:GF.zW},{x:GF.xS,z:GF.zW},
];

const GF_STAIR = { x1:3.1,z1:-3.6,x2:4.5,z2:-2.1,steps:5 };

// ─────────────────────────────────────────────────────────────────────────────
// FIRST FLOOR LAYOUT
//
// First floor POIs (from ar_rooms):
//   7  Room 2        x=0.45   z=-3.80  → center-left (bedroom 2)
//   8  Room 3        x=2.76   z=2.66   → right        (bedroom 3)
//   9  Room 4        x=5.28   z=0.09   → top-right    (bedroom 4)
//   10 Bonus Room    x=6.58   z=-2.17  → top-center   (bonus room)
//   11 Primary Suite x=6.58   z=-7.21  → top-left     (primary suite)
//   12 Closet        x=-0.09  z=-8.84  → bottom-left  (closet)
//
// Blueprint image layout (first floor):
//   ┌───────────────┬──────────────┬──────────────────┐
//   │ PRIMARY SUITE │  BONUS ROOM  │    BEDROOM 4     │
//   │ (top-left)    │ (top-center) │   (top-right)    │
//   ├────┬──────────┴──────────────┴──────────────────┤
//   │    │   LANDING / HALLWAY (open stair area)       │
//   ├────┤   ┌──────────────┐   ┌────────────────┐    │
//   │    │   │  BEDROOM 2   │   │   BEDROOM 3    │    │
//   │    │   │  (center-L)  │   │   (right)      │    │
//   │CLO.│   └──────────────┘   └────────────────┘    │
//   │    │                                             │
//   └────┴─────────────────────────────────────────────┘
//        └── Closet (bottom-left, separate bump-out)
//
// Data bounds: x: -1.5→8.5  z: -10.8→4.5
// Wall divisions (z):
//   zW=-10.8   zPE=-4.8  (primary suite east)
//   zBOE=-0.6  (bonus room east / bedroom4 west)
//   zE=4.5
// Wall divisions (x):
//   xS=-1.5  xCN=1.2  (closet north)  xMN=4.8  xN=8.5
// ─────────────────────────────────────────────────────────────────────────────

// Verified all POIs inside polygons:
//   Primary Suite (6.58,-7.21) → x:4.8→8.5,  z:-10.8→-4.8 ✓
//   Bonus Room    (6.58,-2.17) → x:4.8→8.5,  z:-4.8→-0.6  ✓
//   Room 4        (5.28, 0.09) → x:4.8→8.5,  z:-0.6→4.5   ✓
//   Room 2        (0.45,-3.80) → x:1.2→4.8,  z:-7.4→-0.6  ✓
//   Room 3        (2.76, 2.66) → x:1.2→4.8,  z:-0.6→4.5   ✓
//   Closet       (-0.09,-8.84) → x:-1.5→1.2, z:-10.8→-4.8 ✓

const FF = {
  xMin:-1.5, xMax:8.5, zMin:-10.8, zMax:4.5,
  xS:-1.5, xCN:1.2, xMN:4.8, xN:8.5,
  zW:-10.8, zPE:-4.8, zHE:-0.6, zE:4.5,
  // Room 2 / Room 3 vertical split
  zBR2E: -0.6,
};

const FF_ROOMS = [
  // Primary Suite: top-left, x:4.8→8.5, z:-10.8→-4.8  (POI: 6.58,-7.21 ✓)
  { id:"primary_suite", col:"#8B5CF6", pts:[
    {x:FF.xMN,z:FF.zW},{x:FF.xMN,z:FF.zPE},{x:FF.xN,z:FF.zPE},{x:FF.xN,z:FF.zW}
  ]},
  // Bonus Room: top-center, x:4.8→8.5, z:-4.8→-0.6  (POI: 6.58,-2.17 ✓)
  { id:"bonus_room", col:"#3B82F6", pts:[
    {x:FF.xMN,z:FF.zPE},{x:FF.xMN,z:FF.zHE},{x:FF.xN,z:FF.zHE},{x:FF.xN,z:FF.zPE}
  ]},
  // Room 4 (Bedroom 4): top-right, x:4.8→8.5, z:-0.6→4.5  (POI: 5.28,0.09 ✓)
  { id:"room_4", col:"#F59E0B", pts:[
    {x:FF.xMN,z:FF.zHE},{x:FF.xMN,z:FF.zE},{x:FF.xN,z:FF.zE},{x:FF.xN,z:FF.zHE}
  ]},
  // Room 2 (Bedroom 2): center-left, x:1.2→4.8, z:-7.4→-0.6  (POI: 0.45,-3.80)
  // Note: POI x=0.45 is below xCN=1.2 — extend Room 2 down to xS=-1.5
  { id:"room_2", col:"#10B981", pts:[
    {x:FF.xS,z:-7.4},{x:FF.xS,z:FF.zHE},{x:FF.xMN,z:FF.zHE},{x:FF.xMN,z:-7.4}
  ]},
  // Room 3 (Bedroom 3): center-right, x:1.2→4.8, z:-0.6→4.5  (POI: 2.76,2.66 ✓)
  { id:"room_3", col:"#EF4444", pts:[
    {x:FF.xCN,z:FF.zHE},{x:FF.xCN,z:FF.zE},{x:FF.xMN,z:FF.zE},{x:FF.xMN,z:FF.zHE}
  ]},
  // Closet: bottom-left, x:-1.5→1.2, z:-10.8→-7.4  (POI: -0.09,-8.84 ✓)
  { id:"closet", col:"#EC4899", pts:[
    {x:FF.xS,z:FF.zW},{x:FF.xS,z:-7.4},{x:FF.xCN,z:-7.4},{x:FF.xCN,z:FF.zW}
  ]},
  // Landing / Hallway: structural, center area (no POI)
  { id:"hallway", col:"#84CC16", pts:[
    {x:FF.xCN,z:FF.zW},{x:FF.xCN,z:FF.zHE},{x:FF.xMN,z:FF.zHE},{x:FF.xMN,z:FF.zW}
  ]},
];

const FF_WALLS: [[number,number],[number,number]][] = [
  // Primary Suite east (vertical)
  [[FF.xN,FF.zPE],[FF.xMN,FF.zPE]],
  // Bonus Room east / Room4 west (vertical)
  [[FF.xN,FF.zHE],[FF.xS,FF.zHE]],
  // Upper row south boundary (horizontal)
  [[FF.xMN,FF.zW],[FF.xMN,FF.zE]],
  // Room 2 / Hallway east, Room 3 (vertical split z=-7.4 to closet)
  [[FF.xMN,-7.4],[FF.xS,-7.4]],
  // Closet north wall
  [[FF.xCN,FF.zW],[FF.xCN,FF.zHE]],
  // Room 2/3 top (x=xCN, z:-7.4→-0.6 is the hallway/landing open area - just wall on north)
];

const FF_DOORS: Door[] = [
  // Primary Suite door
  {x1:FF.xMN,z1:FF.zW,  x2:FF.xMN,z2:FF.zPE, t:0.7, w:0.9,side:-1},
  // Bonus Room door
  {x1:FF.xMN,z1:FF.zPE, x2:FF.xMN,z2:FF.zHE, t:0.5, w:0.9,side:-1},
  // Room 4 door
  {x1:FF.xMN,z1:FF.zHE, x2:FF.xMN,z2:FF.zE,  t:0.3, w:0.9,side:-1},
  // Room 2 door
  {x1:FF.xS,z1:-7.4,    x2:FF.xS, z2:FF.zHE, t:0.6, w:0.9,side: 1},
  // Room 3 door
  {x1:FF.xCN,z1:FF.zHE, x2:FF.xMN,z2:FF.zHE, t:0.6, w:0.8,side: 1},
  // Closet door
  {x1:FF.xCN,z1:FF.zW,  x2:FF.xCN,z2:-7.4,   t:0.7, w:0.7,side: 1},
  // Stair opening (bottom of landing)
  {x1:FF.xS,z1:FF.zW,   x2:FF.xS, z2:-7.4,   t:0.4, w:1.0,side: 1},
];

// First floor outer perimeter
const FF_OUTER: Pt[] = [
  {x:FF.xS, z:FF.zW},{x:FF.xS, z:FF.zE},
  {x:FF.xMN,z:FF.zE},{x:FF.xN, z:FF.zE},
  {x:FF.xN, z:FF.zW},{x:FF.xS, z:FF.zW},
];

const FF_STAIR = { x1:1.2, z1:-3.5, x2:4.5, z2:-2.0, steps:5 };

// ─────────────────────────────────────────────────────────────────────────────

interface PlottedRoom { room_id:string; name:string; x:number; z:number; color:string; type:"room"; }
interface PlottedPoint { id:number; x:number; z:number; nearestRoom:string; nearestDist:number; color:string; type:"user"; userName?:string; }

interface Props {
  floorRooms: PlottedRoom[];
  userPoints: PlottedPoint[];
  onHoverDetail: (d: PlottedRoom | PlottedPoint | null) => void;
  isMobile: boolean;
  floor: "ground" | "first";
}

function DoorSVG({ d, sc, isMobile, outerW }: { d:Door; sc:Scale; isMobile:boolean; outerW:number }) {
  const mx=d.x1+(d.x2-d.x1)*d.t, mz=d.z1+(d.z2-d.z1)*d.t;
  const dx=d.x2-d.x1, dz=d.z2-d.z1;
  const len=Math.sqrt(dx*dx+dz*dz)||1;
  const ux=dx/len, uz=dz/len, hw=d.w/2;
  const ax=sc.sx(mz-uz*hw), ay=sc.sy(mx-ux*hw);
  const bx=sc.sx(mz+uz*hw), by=sc.sy(mx+ux*hw);
  const sdx=bx-ax, sdy=by-ay, sl=Math.sqrt(sdx*sdx+sdy*sdy)||1;
  const px=(-sdy/sl)*d.side, py=(sdx/sl)*d.side;
  const tx=ax+px*sl, ty=ay+py*sl;
  return (
    <g>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="hsl(var(--card))" strokeWidth={outerW+4}/>
      <line x1={ax} y1={ay} x2={tx} y2={ty}
        stroke="hsl(var(--primary))" strokeWidth={isMobile?1.2:1.7}
        strokeOpacity={0.8} strokeLinecap="round"/>
      <path d={`M${ax.toFixed(1)},${ay.toFixed(1)} A${sl.toFixed(1)},${sl.toFixed(1)} 0 0,${d.side===1?1:0} ${tx.toFixed(1)},${ty.toFixed(1)}`}
        fill="none" stroke="hsl(var(--primary))"
        strokeWidth={isMobile?0.8:1.1} strokeOpacity={0.35} strokeDasharray="3 2.5"/>
    </g>
  );
}

export default function BlueprintFloorPlan({ floorRooms, userPoints, onHoverDetail, isMobile, floor }: Props) {
  const [size, setSize] = useState({ w:860, h:500 });
  const [hoveredId, setHoveredId] = useState<string|null>(null);

  const measuredRef = useCallback((node:HTMLDivElement|null) => {
    if (!node) return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      if (r.width>40 && r.height>40) setSize({ w:r.width, h:r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
  }, []);

  // Select floor config
  const cfg = floor === "ground"
    ? { rooms:GF_ROOMS, walls:GF_WALLS, doors:GF_DOORS, outer:GF_OUTER, stair:GF_STAIR,
        xMin:GF.xMin, xMax:GF.xMax, zMin:GF.zMin, zMax:GF.zMax }
    : { rooms:FF_ROOMS, walls:FF_WALLS, doors:FF_DOORS, outer:FF_OUTER, stair:FF_STAIR,
        xMin:FF.xMin, xMax:FF.xMax, zMin:FF.zMin, zMax:FF.zMax };

  const sc = useMemo(
    () => makeScale(size.w, size.h, cfg.xMin, cfg.xMax, cfg.zMin, cfg.zMax),
    [size.w, size.h, cfg.xMin, cfg.xMax, cfg.zMin, cfg.zMax]
  );

  const wallW  = isMobile ? 1.5 : 2;
  const outerW = isMobile ? 3   : 4;

  const { w, h } = size;
  const st = cfg.stair;
  const stLeft  = sc.sx(st.z1);
  const stRight = sc.sx(st.z2);
  const stTop   = sc.sy(st.x2);
  const stBot   = sc.sy(st.x1);
  const stW = stRight - stLeft;
  const stH = stBot   - stTop;

  return (
    <div ref={measuredRef} className="relative w-full select-none"
      style={{ height: isMobile?340:500 }}>
      <svg width="100%" height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display:"block" }}>
        <defs>
          <pattern id="bpDot" x="0" y="0"
            width={isMobile?12:16} height={isMobile?12:16}
            patternUnits="userSpaceOnUse">
            <circle cx={isMobile?6:8} cy={isMobile?6:8} r="0.65"
              fill="hsla(var(--primary),0.12)"/>
          </pattern>
          <filter id="wGlow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5"
              floodColor="hsl(var(--primary))" floodOpacity="0.25"/>
          </filter>
          <filter id="pGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background dot grid */}
        <rect width={w} height={h} fill="url(#bpDot)" rx="8"/>

        {/* ── 1. Room fills — subtle tint only, NO labels ────────────── */}
        {cfg.rooms.map((room) => (
          <path key={`f-${room.id}`}
            d={pts2d(room.pts, sc)}
            fill={room.col + "18"}
            stroke="none"/>
        ))}

        {/* ── 2. Interior walls ────────────────────────────────────────── */}
        {cfg.walls.map(([[x1,z1],[x2,z2]], i) => (
          <line key={`iw-${i}`}
            x1={sc.sx(z1)} y1={sc.sy(x1)}
            x2={sc.sx(z2)} y2={sc.sy(x2)}
            stroke="hsl(var(--primary))"
            strokeWidth={wallW} strokeOpacity={0.45} strokeLinecap="square"/>
        ))}

        {/* ── 3. Door swings ───────────────────────────────────────────── */}
        {cfg.doors.map((d,i) => (
          <DoorSVG key={i} d={d} sc={sc} isMobile={isMobile} outerW={outerW}/>
        ))}

        {/* ── 4. Outer building perimeter ─────────────────────────────── */}
        <path d={pts2d(cfg.outer, sc)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={outerW}
          strokeLinejoin="miter" strokeLinecap="square"
          filter="url(#wGlow)" opacity={0.95}/>

        {/* ── 5. Staircase symbol ──────────────────────────────────────── */}
        {stH > 0 && stW > 0 && (
          <g opacity={0.38} style={{pointerEvents:"none"}}>
            <rect x={stLeft} y={stTop} width={stW} height={stH}
              fill="none" stroke="hsl(var(--primary))" strokeWidth={1}/>
            {Array.from({length:st.steps+1}).map((_,i) => (
              <line key={i}
                x1={stLeft}      y1={stTop+(stH/st.steps)*i}
                x2={stLeft+stW}  y2={stTop+(stH/st.steps)*i}
                stroke="hsl(var(--primary))" strokeWidth={0.7}/>
            ))}
            <text x={stLeft+stW/2} y={stTop+stH/2}
              textAnchor="middle" dominantBaseline="middle"
              fill="hsl(var(--primary))" fontSize={isMobile?4.5:7}
              fontWeight={700} fontFamily="Inter,sans-serif"
              style={{userSelect:"none"}}>UP</text>
          </g>
        )}

        {/* ── 6. North compass ─────────────────────────────────────────── */}
        {!isMobile && (
          <g style={{pointerEvents:"none"}}>
            <polygon
              points={`${w-PAD.r-14},${PAD.t+3} ${w-PAD.r-19},${PAD.t+20} ${w-PAD.r-14},${PAD.t+16} ${w-PAD.r-9},${PAD.t+20}`}
              fill="hsl(var(--primary))" opacity={0.7}/>
            <text x={w-PAD.r-14} y={PAD.t+32}
              textAnchor="middle" fill="hsl(var(--primary))"
              fontSize={9} fontWeight={800}
              fontFamily="Inter,sans-serif" opacity={0.6}
              style={{userSelect:"none"}}>N</text>
          </g>
        )}

        {/* ── 7. User tracking breadcrumbs ─────────────────────────────── */}
        {userPoints.map((pt) => (
          <circle key={`up-${pt.id}`}
            cx={sc.sx(pt.z)} cy={sc.sy(pt.x)}
            r={isMobile?1.8:2.8}
            fill={pt.color}
            fillOpacity={pt.nearestDist < PROXIMITY_THRESHOLD ? 0.6 : 0.25}
            style={{pointerEvents:"none"}}/>
        ))}

        {/* ── 8. Room POI markers — live from Supabase ─────────────────── */}
        {floorRooms.map((room) => {
          const px = sc.sx(room.z);
          const py = sc.sy(room.x);
          const oR = isMobile ? 7 : 11;
          const iR = isMobile ? 2.5 : 4;
          const isHov = hoveredId === room.room_id;
          return (
            <g key={`poi-${room.room_id}`} style={{cursor:"pointer"}}
              onMouseEnter={() => { setHoveredId(room.room_id); onHoverDetail(room); }}
              onMouseLeave={() => { setHoveredId(null); onHoverDetail(null); }}>
              {/* Halo ring */}
              <circle cx={px} cy={py} r={oR}
                fill={room.color} fillOpacity={isHov?0.22:0.1}
                stroke={room.color} strokeWidth={isHov?2:1.6}
                strokeOpacity={isHov?1:0.65}/>
              {/* Solid inner dot */}
              <circle cx={px} cy={py} r={iR}
                fill={room.color}
                filter={isHov?"url(#pGlow)":undefined}/>
              {/* Name label above dot */}
              {!isMobile && (
                <text x={px} y={py - oR - 5}
                  textAnchor="middle"
                  fill={room.color} fontSize={8.5} fontWeight={700}
                  fontFamily="Inter,system-ui,sans-serif"
                  opacity={isHov?1:0.92}
                  style={{pointerEvents:"none",userSelect:"none"}}>
                  {room.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
