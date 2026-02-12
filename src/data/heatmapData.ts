export interface HeatmapStore {
  id: number;
  name: string;
  logo: string;
  position: { x: number; y: number };
  category: string;
  color: string;
}

export interface TrafficRecord {
  storeId: number;
  hour: number;
  visits: number;
  avgDwellMinutes: number;
}

export interface TimePreset {
  label: string;
  range: [number, number];
}

export const heatmapStores: HeatmapStore[] = [
  {
    id: 1,
    name: "Adidas",
    logo: "https://g3cb3b1c0924a5d-rho2ag4cklj4nhpl.adb.ap-hyderabad-1.oraclecloudapps.com/ords/ng/ng/logo-images/shops/116",
    position: { x: 18, y: 22 },
    category: "Sports & Fashion",
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Starbucks",
    logo: "https://g3cb3b1c0924a5d-rho2ag4cklj4nhpl.adb.ap-hyderabad-1.oraclecloudapps.com/ords/ng/ng/logo-images/shops/81",
    position: { x: 75, y: 20 },
    category: "Food & Beverage",
    color: "#10B981",
  },
  {
    id: 3,
    name: "Pepe Jeans",
    logo: "https://g3cb3b1c0924a5d-rho2ag4cklj4nhpl.adb.ap-hyderabad-1.oraclecloudapps.com/ords/ng/ng/logo-images/shops/108",
    position: { x: 48, y: 50 },
    category: "Fashion",
    color: "#8B5CF6",
  },
  {
    id: 4,
    name: "Arrow",
    logo: "https://g3cb3b1c0924a5d-rho2ag4cklj4nhpl.adb.ap-hyderabad-1.oraclecloudapps.com/ords/ng/ng/logo-images/shops/115",
    position: { x: 20, y: 78 },
    category: "Formal Wear",
    color: "#F59E0B",
  },
  {
    id: 5,
    name: "US Polo",
    logo: "https://g3cb3b1c0924a5d-rho2ag4cklj4nhpl.adb.ap-hyderabad-1.oraclecloudapps.com/ords/ng/ng/logo-images/shops/118",
    position: { x: 75, y: 76 },
    category: "Casual Wear",
    color: "#EC4899",
  },
];

export const trafficData: TrafficRecord[] = [
  // Adidas — moderate traffic, peaks in afternoon/evening
  { storeId: 1, hour: 9, visits: 5, avgDwellMinutes: 8 },
  { storeId: 1, hour: 10, visits: 12, avgDwellMinutes: 15 },
  { storeId: 1, hour: 11, visits: 18, avgDwellMinutes: 20 },
  { storeId: 1, hour: 12, visits: 22, avgDwellMinutes: 18 },
  { storeId: 1, hour: 13, visits: 28, avgDwellMinutes: 22 },
  { storeId: 1, hour: 14, visits: 35, avgDwellMinutes: 25 },
  { storeId: 1, hour: 15, visits: 42, avgDwellMinutes: 20 },
  { storeId: 1, hour: 16, visits: 38, avgDwellMinutes: 18 },
  { storeId: 1, hour: 17, visits: 45, avgDwellMinutes: 22 },
  { storeId: 1, hour: 18, visits: 40, avgDwellMinutes: 19 },
  { storeId: 1, hour: 19, visits: 30, avgDwellMinutes: 15 },
  { storeId: 1, hour: 20, visits: 15, avgDwellMinutes: 10 },

  // Starbucks — highest traffic, peaks in morning and late afternoon
  { storeId: 2, hour: 9, visits: 35, avgDwellMinutes: 25 },
  { storeId: 2, hour: 10, visits: 48, avgDwellMinutes: 30 },
  { storeId: 2, hour: 11, visits: 55, avgDwellMinutes: 35 },
  { storeId: 2, hour: 12, visits: 60, avgDwellMinutes: 28 },
  { storeId: 2, hour: 13, visits: 52, avgDwellMinutes: 22 },
  { storeId: 2, hour: 14, visits: 45, avgDwellMinutes: 25 },
  { storeId: 2, hour: 15, visits: 50, avgDwellMinutes: 30 },
  { storeId: 2, hour: 16, visits: 58, avgDwellMinutes: 32 },
  { storeId: 2, hour: 17, visits: 62, avgDwellMinutes: 28 },
  { storeId: 2, hour: 18, visits: 48, avgDwellMinutes: 20 },
  { storeId: 2, hour: 19, visits: 35, avgDwellMinutes: 18 },
  { storeId: 2, hour: 20, visits: 20, avgDwellMinutes: 12 },

  // Pepe Jeans — moderate, peaks in evening
  { storeId: 3, hour: 9, visits: 3, avgDwellMinutes: 10 },
  { storeId: 3, hour: 10, visits: 8, avgDwellMinutes: 15 },
  { storeId: 3, hour: 11, visits: 14, avgDwellMinutes: 20 },
  { storeId: 3, hour: 12, visits: 18, avgDwellMinutes: 22 },
  { storeId: 3, hour: 13, visits: 22, avgDwellMinutes: 25 },
  { storeId: 3, hour: 14, visits: 25, avgDwellMinutes: 28 },
  { storeId: 3, hour: 15, visits: 30, avgDwellMinutes: 22 },
  { storeId: 3, hour: 16, visits: 28, avgDwellMinutes: 20 },
  { storeId: 3, hour: 17, visits: 35, avgDwellMinutes: 25 },
  { storeId: 3, hour: 18, visits: 38, avgDwellMinutes: 30 },
  { storeId: 3, hour: 19, visits: 32, avgDwellMinutes: 22 },
  { storeId: 3, hour: 20, visits: 18, avgDwellMinutes: 15 },

  // Arrow — lower traffic, formal wear niche
  { storeId: 4, hour: 9, visits: 2, avgDwellMinutes: 12 },
  { storeId: 4, hour: 10, visits: 6, avgDwellMinutes: 18 },
  { storeId: 4, hour: 11, visits: 10, avgDwellMinutes: 22 },
  { storeId: 4, hour: 12, visits: 15, avgDwellMinutes: 20 },
  { storeId: 4, hour: 13, visits: 18, avgDwellMinutes: 25 },
  { storeId: 4, hour: 14, visits: 20, avgDwellMinutes: 22 },
  { storeId: 4, hour: 15, visits: 22, avgDwellMinutes: 18 },
  { storeId: 4, hour: 16, visits: 19, avgDwellMinutes: 15 },
  { storeId: 4, hour: 17, visits: 24, avgDwellMinutes: 20 },
  { storeId: 4, hour: 18, visits: 20, avgDwellMinutes: 18 },
  { storeId: 4, hour: 19, visits: 14, avgDwellMinutes: 12 },
  { storeId: 4, hour: 20, visits: 8, avgDwellMinutes: 8 },

  // US Polo — good traffic, casual appeal
  { storeId: 5, hour: 9, visits: 8, avgDwellMinutes: 10 },
  { storeId: 5, hour: 10, visits: 15, avgDwellMinutes: 15 },
  { storeId: 5, hour: 11, visits: 22, avgDwellMinutes: 18 },
  { storeId: 5, hour: 12, visits: 28, avgDwellMinutes: 20 },
  { storeId: 5, hour: 13, visits: 32, avgDwellMinutes: 22 },
  { storeId: 5, hour: 14, visits: 35, avgDwellMinutes: 25 },
  { storeId: 5, hour: 15, visits: 40, avgDwellMinutes: 20 },
  { storeId: 5, hour: 16, visits: 38, avgDwellMinutes: 18 },
  { storeId: 5, hour: 17, visits: 42, avgDwellMinutes: 22 },
  { storeId: 5, hour: 18, visits: 45, avgDwellMinutes: 25 },
  { storeId: 5, hour: 19, visits: 35, avgDwellMinutes: 18 },
  { storeId: 5, hour: 20, visits: 20, avgDwellMinutes: 12 },
];

export const timePresets: TimePreset[] = [
  { label: "All Day", range: [9, 20] },
  { label: "Morning", range: [9, 11] },
  { label: "Afternoon", range: [12, 14] },
  { label: "Evening", range: [15, 17] },
  { label: "Night", range: [18, 20] },
];

export const hourOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 9);

export function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

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
