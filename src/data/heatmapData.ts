export const FLOOR_Y_THRESHOLD = 2.0;
export const PROXIMITY_THRESHOLD = 2.0;

export const ROOM_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  "#14B8A6", "#E11D48", "#9333EA",
];

export function getHeatColor(intensity: number): string {
  if (intensity >= 0.8) return "#EF4444";
  if (intensity >= 0.6) return "#F97316";
  if (intensity >= 0.4) return "#EAB308";
  if (intensity >= 0.2) return "#22D3EE";
  return "#3B82F6";
}

export function getHeatLabel(intensity: number): string {
  if (intensity >= 0.8) return "Peak";
  if (intensity >= 0.6) return "Very High";
  if (intensity >= 0.4) return "High";
  if (intensity >= 0.2) return "Moderate";
  return "Low";
}

export function distance2D(x1: number, z1: number, x2: number, z2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2);
}

export function getFloor(posY: number): "ground" | "first" {
  return posY < FLOOR_Y_THRESHOLD ? "ground" : "first";
}

export interface BuildingOutlinePoint {
  label: string;
  x: number;
  z: number;
}

// The outer building footprint — 11 corner points in X/Z coordinate space
export const BUILDING_OUTLINE: BuildingOutlinePoint[] = [
  { label: "p1",  x: 9.33,  z: -11.0 },
  { label: "p2",  x: 9.41,  z: -6.4  },
  { label: "p3",  x: 9.41,  z: -0.7  },
  { label: "p4",  x: 9.41,  z: 4.52  },
  { label: "p5",  x: 5.56,  z: 4.48  },
  { label: "p6",  x: 1.67,  z: 4.48  },
  { label: "p7",  x: -2.5,  z: 4.48  },
  { label: "p8",  x: -2.48, z: -0.69 },
  { label: "p9",  x: -2.41, z: -4.75 },
  { label: "p10", x: -1.12, z: -11.0 },
  { label: "p11", x: -4.19, z: -11.0 },
];

export const BUILDING_BOUNDS = {
  zMin: -13,
  zMax: 6.5,
  xMin: -6,
  xMax: 11,
};

// ─────────────────────────────────────────────────────────────────────────────
// Ground Floor room polygons — 4926 Tacoma floor plan, used by BlueprintFloorPlan.
// Coordinate system: x = east-west, z = north-south (high z = north = top of SVG)
// ─────────────────────────────────────────────────────────────────────────────
export interface RoomPolygon {
  id: string;
  label: string;
  sublabel?: string;
  points: Array<{ x: number; z: number }>;
  colorIndex: number;
  trackable: boolean;
}

export const GROUND_FLOOR_ROOMS: RoomPolygon[] = [
  // ── Garage (bottom-left, large) ──────────────────────────────────────────
  {
    id: "garage",
    label: "Two Car Garage",
    sublabel: "20'-2\" × 20'-10\"",
    colorIndex: 9,
    trackable: false,
    points: [
      { x: -4.19, z: -11.0 },
      { x: -1.12, z: -11.0 },
      { x: -2.41, z: -4.75 },
      { x: -2.48, z: -0.69 },
      { x: -4.8,  z: -0.69 },
      { x: -4.8,  z: -11.0 },
    ],
  },
  // ── Foyer ────────────────────────────────────────────────────────────────
  {
    id: "foyer",
    label: "Foyer",
    colorIndex: 7,
    trackable: true,
    points: [
      { x: 1.5,  z: -4.75 },
      { x: 3.2,  z: -4.75 },
      { x: 3.2,  z: -2.5  },
      { x: 1.5,  z: -2.5  },
    ],
  },
  // ── Dining Room ──────────────────────────────────────────────────────────
  {
    id: "dining_room",
    label: "Dining Room",
    sublabel: "12'-2\" × 16'-8\"",
    colorIndex: 4,
    trackable: true,
    points: [
      { x: 1.5,  z: -4.75 },
      { x: 5.5,  z: -4.75 },
      { x: 5.5,  z: -0.7  },
      { x: 1.5,  z: -0.7  },
    ],
  },
  // ── Great Room (center) ───────────────────────────────────────────────────
  {
    id: "great_room",
    label: "Great Room",
    sublabel: "18'-10\" × 16'-6\"",
    colorIndex: 0,
    trackable: true,
    points: [
      { x: 5.5,  z: -0.7  },
      { x: 9.41, z: -0.7  },
      { x: 9.41, z: 4.52  },
      { x: 5.5,  z: 4.52  },
    ],
  },
  // ── Breakfast ────────────────────────────────────────────────────────────
  {
    id: "breakfast",
    label: "Breakfast",
    sublabel: "8'-10\" × 16'-8\"",
    colorIndex: 6,
    trackable: true,
    points: [
      { x: 1.5,  z: -0.7  },
      { x: 5.5,  z: -0.7  },
      { x: 5.5,  z: 4.52  },
      { x: 1.5,  z: 4.52  },
    ],
  },
  // ── Kitchen ──────────────────────────────────────────────────────────────
  {
    id: "kitchen",
    label: "Kitchen",
    sublabel: "11'-4\" × 16'-8\"",
    colorIndex: 1,
    trackable: true,
    points: [
      { x: -2.48, z: -0.69 },
      { x: 1.5,   z: -0.69 },
      { x: 1.5,   z: 4.52  },
      { x: -2.48, z: 4.52  },
    ],
  },
  // ── Sunroom (top-left bump) ───────────────────────────────────────────────
  {
    id: "sunroom",
    label: "Sunroom",
    sublabel: "11'-4\" × 9'-10\"",
    colorIndex: 5,
    trackable: true,
    points: [
      { x: -2.48, z: 0.3   },
      { x: -2.48, z: 4.52  },
      { x: -5.2,  z: 4.52  },
      { x: -5.2,  z: 0.3   },
    ],
  },
  // ── Patio (top-center, outdoor) ───────────────────────────────────────────
  {
    id: "patio",
    label: "Patio",
    colorIndex: 11,
    trackable: false,
    points: [
      { x: 5.56, z: 4.52  },
      { x: 9.41, z: 4.52  },
      { x: 9.41, z: 6.2   },
      { x: 5.56, z: 6.2   },
    ],
  },
  // ── Guest Room (right) ────────────────────────────────────────────────────
  {
    id: "guest_room",
    label: "Guest Room",
    sublabel: "11'-2\" × 14'-4\"",
    colorIndex: 2,
    trackable: true,
    points: [
      { x: 5.56, z: -6.4  },
      { x: 9.41, z: -6.4  },
      { x: 9.41, z: -0.7  },
      { x: 5.56, z: -0.7  },
    ],
  },
  // ── Office (bottom-right) ─────────────────────────────────────────────────
  {
    id: "office",
    label: "Office",
    sublabel: "11'-2\" × 11'-6\"",
    colorIndex: 3,
    trackable: true,
    points: [
      { x: 5.56, z: -11.0 },
      { x: 9.33, z: -11.0 },
      { x: 9.41, z: -6.4  },
      { x: 5.56, z: -6.4  },
    ],
  },
];

// Door positions for the ground floor plan — each door interrupts a wall segment
export interface DoorDef {
  // The wall is defined by two room polygon corner points
  x1: number; z1: number;
  x2: number; z2: number;
  // Fraction along that wall (0→1) where the door centre sits
  t: number;
  // Door leaf width in the same coordinate units
  width: number;
  // Which side the door swings (for the arc indicator)
  swingDir: "left" | "right";
}

export const GROUND_FLOOR_DOORS: DoorDef[] = [
  // Front door — south wall of foyer
  { x1: 1.5, z1: -4.75, x2: 3.2, z2: -4.75, t: 0.5, width: 0.9, swingDir: "right" },
  // Garage exit
  { x1: -4.19, z1: -11.0, x2: -1.12, z2: -11.0, t: 0.35, width: 1.6, swingDir: "right" },
  // Kitchen ↔ Breakfast
  { x1: -2.48, z1: -0.69, x2: 1.5, z2: -0.69, t: 0.65, width: 0.9, swingDir: "left" },
  // Dining ↔ Great Room opening
  { x1: 5.5, z1: -4.75, x2: 5.5, z2: -0.7, t: 0.4, width: 1.2, swingDir: "right" },
  // Guest Room door
  { x1: 5.56, z1: -0.7, x2: 5.56, z2: -6.4, t: 0.25, width: 0.9, swingDir: "left" },
  // Office door
  { x1: 5.56, z1: -6.4, x2: 5.56, z2: -11.0, t: 0.3, width: 0.9, swingDir: "right" },
  // Sunroom door
  { x1: -2.48, z1: 0.3, x2: -2.48, z2: 4.52, t: 0.7, width: 0.9, swingDir: "right" },
];

export function generateTicks(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}
