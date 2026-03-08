const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://vfpgtifzqznfdtecmpsc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcGd0aWZ6cXpuZmR0ZWNtcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTgyMjgsImV4cCI6MjA4NzU3NDIyOH0.GIRe4b0UzY8znx-Rnd-YYYMNRVkv6WIJanmNEPNFF-k"
);

async function seedData() {
  console.log("Starting seed...");

  // 1. Insert dummy POIs (rooms for heatmap)
  const pois = [
    { poi_name: "Living Room", poi_type: "Room", pos_x: 2.0, pos_y: 0.5, pos_z: 3.0, is_active: true, show_in_ar: true },
    { poi_name: "Kitchen", poi_type: "Room", pos_x: -3.0, pos_y: 0.5, pos_z: 1.5, is_active: true, show_in_ar: true },
    { poi_name: "Bedroom 1", poi_type: "Room", pos_x: 5.0, pos_y: 0.5, pos_z: -2.0, is_active: true, show_in_ar: true },
    { poi_name: "Bathroom", poi_type: "Room", pos_x: -1.0, pos_y: 0.5, pos_z: -4.0, is_active: true, show_in_ar: true },
    { poi_name: "Garden", poi_type: "Room", pos_x: 0.0, pos_y: 0.5, pos_z: 6.0, is_active: true, show_in_ar: true },
    { poi_name: "Master Bedroom", poi_type: "Room", pos_x: 3.0, pos_y: 4.0, pos_z: 2.0, is_active: true, show_in_ar: true },
    { poi_name: "Study Room", poi_type: "Room", pos_x: -2.0, pos_y: 4.0, pos_z: -1.0, is_active: true, show_in_ar: true },
    { poi_name: "Balcony", poi_type: "Room", pos_x: 6.0, pos_y: 4.0, pos_z: 0.0, is_active: true, show_in_ar: true },
  ];

  const { data: poiData, error: poiErr } = await supabase
    .from("ar_ropin_pois")
    .insert(pois)
    .select("id, poi_name");

  if (poiErr) {
    console.error("POI insert error:", poiErr.message);
  } else {
    console.log("Inserted POIs:", poiData.length);
  }

  // 2. Insert dummy users
  const users = [
    { user_name: "Aarav", email: "aarav@example.com", role: "Resident", share_enabled: true },
    { user_name: "Priya", email: "priya@example.com", role: "Resident", share_enabled: true },
    { user_name: "Rohan", email: "rohan@example.com", role: "Visitor", share_enabled: false },
  ];

  const { data: userData, error: userErr } = await supabase
    .from("ar_ropin_users")
    .insert(users)
    .select("id, user_name");

  if (userErr) {
    console.error("User insert error:", userErr.message);
  } else {
    console.log("Inserted users:", userData.length, userData);
  }

  // 3. Insert nav nodes (the underlying table for user_nodes view)
  // We need user_ids from the inserted users
  if (userData && userData.length > 0) {
    const navNodes = [];
    const userIds = userData.map(u => u.id);

    // Ground floor activity (pos_y < 2)
    const groundPositions = [
      { pos_x: 2.1, pos_y: 0.6, pos_z: 3.2 },  // near Living Room
      { pos_x: 1.8, pos_y: 0.5, pos_z: 2.8 },  // near Living Room
      { pos_x: -2.8, pos_y: 0.5, pos_z: 1.3 },  // near Kitchen
      { pos_x: -3.2, pos_y: 0.6, pos_z: 1.7 },  // near Kitchen
      { pos_x: 4.8, pos_y: 0.5, pos_z: -1.8 },  // near Bedroom 1
      { pos_x: -0.8, pos_y: 0.5, pos_z: -3.8 },  // near Bathroom
      { pos_x: 0.2, pos_y: 0.5, pos_z: 5.8 },  // near Garden
      { pos_x: 2.5, pos_y: 0.5, pos_z: 3.5 },  // near Living Room
      { pos_x: -2.5, pos_y: 0.5, pos_z: 1.0 },  // near Kitchen
      { pos_x: 5.2, pos_y: 0.5, pos_z: -2.2 },  // near Bedroom 1
      { pos_x: 1.0, pos_y: 0.5, pos_z: 4.0 },  // between Living Room and Garden
      { pos_x: -1.5, pos_y: 0.5, pos_z: -3.5 },  // near Bathroom
    ];

    // First floor activity (pos_y > 2)
    const firstFloorPositions = [
      { pos_x: 3.2, pos_y: 4.1, pos_z: 2.2 },  // near Master Bedroom
      { pos_x: 2.8, pos_y: 4.0, pos_z: 1.8 },  // near Master Bedroom
      { pos_x: -1.8, pos_y: 4.0, pos_z: -0.8 },  // near Study Room
      { pos_x: -2.2, pos_y: 4.0, pos_z: -1.2 },  // near Study Room
      { pos_x: 5.8, pos_y: 4.0, pos_z: 0.2 },  // near Balcony
      { pos_x: 6.2, pos_y: 4.0, pos_z: -0.2 },  // near Balcony
      { pos_x: 3.5, pos_y: 4.0, pos_z: 2.5 },  // near Master Bedroom
      { pos_x: -1.5, pos_y: 4.0, pos_z: -0.5 },  // near Study Room
    ];

    const allPositions = [...groundPositions, ...firstFloorPositions];

    for (let i = 0; i < allPositions.length; i++) {
      const userId = userIds[i % userIds.length];
      navNodes.push({
        user_id: userId,
        pos_x: allPositions[i].pos_x,
        pos_y: allPositions[i].pos_y,
        pos_z: allPositions[i].pos_z,
        saved_point_name: null,
      });
    }

    const { data: nodeData, error: nodeErr } = await supabase
      .from("ar_ropin_navnode")
      .insert(navNodes)
      .select("id");

    if (nodeErr) {
      console.error("Nav node insert error:", nodeErr.message);
    } else {
      console.log("Inserted nav nodes:", nodeData.length);
    }
  }

  // 4. Verify user_nodes view returns data
  const { data: viewData, error: viewErr } = await supabase
    .from("user_nodes")
    .select("id, node_name, pos_x, pos_y, pos_z, created_by")
    .limit(5);

  if (viewErr) {
    console.error("user_nodes view error:", viewErr.message);
  } else {
    console.log("user_nodes view sample:", JSON.stringify(viewData, null, 2));
  }

  console.log("Seed complete!");
}

seedData().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
