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
  ar_room_categories: {
    tableName: "ar_room_categories",
    displayName: "Room Categories",
    description: "Organize your rooms into categories for easy browsing",
    primaryKey: "category_id",
    defaultSort: { key: "category_id", direction: "asc" },
    columns: [
      { key: "category_id", label: "Category ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "category_name", label: "Category Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Living Space, Bedroom" },
      { key: "icon_class", label: "Icon", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. fa-door-open" },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_room_information: {
    tableName: "ar_room_information",
    displayName: "Room Information",
    description: "Additional details and info entries for each room",
    primaryKey: "info_id",
    defaultSort: { key: "info_id", direction: "desc" },
    columns: [
      { key: "info_id", label: "Info ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "room_id", label: "Room ID", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Room ID" },
      { key: "title", label: "Title", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Info title" },
      { key: "description", label: "Description", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "Describe this info entry" },
      { key: "info_type", label: "Info Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Feature, Note" },
      { key: "floor_no", label: "Floor", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Ground Floor" },
      { key: "node_id", label: "Node ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Node ID" },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
      { key: "start_date", label: "Start Date", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "end_date", label: "End Date", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_rooms: {
    tableName: "ar_rooms",
    displayName: "Rooms",
    description: "All rooms in the residence and their details",
    primaryKey: "room_id",
    defaultSort: { key: "room_id", direction: "desc" },
    columns: [
      { key: "room_id", label: "Room ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Room ID" },
      { key: "room_name", label: "Room Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Name of the room" },
      { key: "category_id", label: "Category ID", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Category ID" },
      { key: "floor_no", label: "Floor", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Ground Floor" },
      { key: "node_id", label: "Node ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Node ID" },
      { key: "description", label: "Description", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "About this room" },
      { key: "contact_person", label: "Contact Person", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Person name" },
      { key: "contact_no", label: "Contact Number", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "+91 98765 43210" },
      { key: "room_type", label: "Room Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Bedroom, Kitchen" },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
      { key: "created_at", label: "Added On", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "created_by", label: "Added By", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Your name" },
      { key: "pos_x", label: "Position X", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_y", label: "Position Y", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_z", label: "Position Z", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "image_url", label: "Image Link", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "https://" },
      { key: "amenities_desc", label: "Amenities", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "Describe the amenities..." },
      { key: "technology_desc", label: "Technology", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "Describe the technology..." },
      { key: "highlight_desc", label: "Highlights", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "Describe the highlights..." },
    ],
  },

  ar_user_presence: {
    tableName: "ar_user_presence",
    displayName: "Users",
    description: "People using your NavMe experience",
    primaryKey: "user_id",
    defaultSort: { key: "user_id", direction: "desc" },
    columns: [
      { key: "user_id", label: "User ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "user_name", label: "Name", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Display name" },
      { key: "email", label: "Email", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "user@example.com" },
      { key: "role", label: "Role", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Resident, Visitor" },
      { key: "share_enabled", label: "Sharing", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "true or false" },
      { key: "last_seen_at", label: "Last Active", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "session_id", label: "Session", type: "text", editable: true, showInTable: true, showInForm: false },
      { key: "skills", label: "Skills", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Skills" },
      { key: "hobbies", label: "Hobbies", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Hobbies" },
      { key: "about", label: "About", type: "textarea", editable: true, showInTable: true, showInForm: true, placeholder: "About this user..." },
      { key: "created_at", label: "Joined On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },
};

export const tableOrder = [
  "ar_room_categories",
  "ar_room_information",
  "ar_rooms",
  "ar_user_presence",
] as const;
