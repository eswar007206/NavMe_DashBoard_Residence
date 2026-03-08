export interface ColumnConfig {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "datetime" | "boolean" | "select" | "textarea";
  required?: boolean;
  editable?: boolean;
  showInTable?: boolean;
  showInForm?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface TableConfig {
  tableName: string;
  displayName: string;
  description: string;
  primaryKey: string;
  columns: ColumnConfig[];
  defaultSort?: { key: string; direction: "asc" | "desc" };
}

export const tableConfigs: Record<string, TableConfig> = {
  ar_ropin_pois: {
    tableName: "ar_ropin_pois",
    displayName: "Points of Interest",
    description: "All POIs (rooms/locations) and their details",
    primaryKey: "id",
    defaultSort: { key: "id", direction: "desc" },
    columns: [
      { key: "id", label: "ID", type: "text", editable: false, showInTable: true, showInForm: false },
      { key: "poi_name", label: "POI Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Name of the POI" },
      { key: "poi_type", label: "POI Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Room, Landmark" },
      { key: "node_id", label: "Node ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Node ID" },
      { key: "icon_url", label: "Icon URL", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "https://..." },
      { key: "pos_x", label: "Position X", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_y", label: "Position Y", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_z", label: "Position Z", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "show_in_ar", label: "Show in AR", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "true or false" },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "true or false" },
      { key: "amenities_desc", label: "Amenities", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "Describe the amenities..." },
      { key: "technology_desc", label: "Technology", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "Describe the technology..." },
      { key: "highlight_desc", label: "Highlights", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "Describe the highlights..." },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "updated_at", label: "Updated On", type: "datetime", editable: false, showInTable: false, showInForm: false },
    ],
  },

  ar_ropin_users: {
    tableName: "ar_ropin_users",
    displayName: "Users",
    description: "People using your NavMe experience",
    primaryKey: "id",
    defaultSort: { key: "id", direction: "desc" },
    columns: [
      { key: "id", label: "User ID", type: "text", editable: false, showInTable: true, showInForm: false },
      { key: "user_name", label: "Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Display name" },
      { key: "email", label: "Email", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "user@example.com" },
      { key: "role", label: "Role", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Resident, Visitor" },
      { key: "share_enabled", label: "Sharing", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "true or false" },
      { key: "last_seen_at", label: "Last Active", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "session_id", label: "Session", type: "text", editable: true, showInTable: false, showInForm: false },
      { key: "skills", label: "Skills", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Skills" },
      { key: "hobbies", label: "Hobbies", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Hobbies" },
      { key: "about", label: "About", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "About this user..." },
      { key: "created_at", label: "Joined On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_electronic_assets: {
    tableName: "ar_electronic_assets",
    displayName: "Electronic Assets",
    description: "Electronic items and devices in each room",
    primaryKey: "id",
    defaultSort: { key: "id", direction: "desc" },
    columns: [
      { key: "id", label: "Asset ID", type: "text", editable: false, showInTable: true, showInForm: false },
      { key: "room_part", label: "Room Part", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Living Room" },
      { key: "room_name", label: "Room Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Room name" },
      { key: "asset_name", label: "Asset Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. AC, TV" },
      { key: "sl_no", label: "Serial No", type: "number", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Serial number" },
      { key: "pos_x", label: "Position X", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "0" },
      { key: "pos_y", label: "Position Y", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "0" },
      { key: "pos_z", label: "Position Z", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "0" },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "true or false" },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_complaints: {
    tableName: "ar_complaints",
    displayName: "Complaints",
    description: "User complaints about assets and rooms",
    primaryKey: "id",
    defaultSort: { key: "id", direction: "desc" },
    columns: [
      { key: "id", label: "Complaint ID", type: "text", editable: false, showInTable: true, showInForm: false },
      { key: "asset_name", label: "Asset Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Asset name" },
      { key: "sl_no", label: "Serial No", type: "number", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Serial number" },
      { key: "room_part", label: "Room Part", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Room part" },
      { key: "room_name", label: "Room Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Room name" },
      { key: "user_name", label: "User Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Complainant name" },
      { key: "user_email", label: "User Email", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "user@example.com" },
      { key: "status", label: "Status", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "OPEN, CLOSED, etc." },
      { key: "created_at", label: "Filed On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_ropin_feedback: {
    tableName: "ar_ropin_feedback",
    displayName: "Feedback",
    description: "User feedback and suggestions",
    primaryKey: "id",
    defaultSort: { key: "id", direction: "desc" },
    columns: [
      { key: "id", label: "Feedback ID", type: "text", editable: false, showInTable: true, showInForm: false },
      { key: "user_name", label: "User Name", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "User name" },
      { key: "user_email", label: "User Email", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "user@example.com" },
      { key: "feedback", label: "Feedback", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "Feedback message..." },
      { key: "created_at", label: "Submitted On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

};

export const tableOrder = [
  "ar_ropin_pois",
  "ar_ropin_users",
  "ar_electronic_assets",
  "ar_complaints",
  "ar_ropin_feedback",
] as const;
