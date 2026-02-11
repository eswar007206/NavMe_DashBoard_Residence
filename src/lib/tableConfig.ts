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
  ar_shop_categories: {
    tableName: "ar_shop_categories",
    displayName: "Shop Categories",
    description: "Organize your shops into categories for easy browsing",
    primaryKey: "category_id",
    defaultSort: { key: "category_id", direction: "asc" },
    columns: [
      { key: "category_id", label: "Category ID", type: "number", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Enter a unique category number" },
      { key: "category_name", label: "Category Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Food & Beverage, Fashion" },
      { key: "icon_class", label: "Icon", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Icon name for this category" },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_shop_items: {
    tableName: "ar_shop_items",
    displayName: "Shop Items",
    description: "All products and items available across your shops",
    primaryKey: "item_id",
    defaultSort: { key: "item_id", direction: "desc" },
    columns: [
      { key: "item_id", label: "Item ID", type: "number", showInTable: true, showInForm: false, editable: false },
      { key: "shop_id", label: "Shop", type: "number", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Which shop does this item belong to?" },
      { key: "item_name", label: "Item Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "What is this item called?" },
      { key: "item_type", label: "Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Food, Clothing, Electronics" },
      { key: "item_price", label: "Price", type: "number", editable: true, showInTable: true, showInForm: true, placeholder: "0.00" },
      { key: "item_currency", label: "Currency", type: "text", editable: true, showInTable: true, showInForm: true, defaultValue: "INR", placeholder: "e.g. INR, USD" },
      { key: "is_available", label: "Available", type: "select", editable: true, showInTable: true, showInForm: true, defaultValue: "Y", options: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }] },
      { key: "created_at", label: "Added On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_shop_offers: {
    tableName: "ar_shop_offers",
    displayName: "Shop Offers",
    description: "Create and manage special deals, discounts, and promotions",
    primaryKey: "offer_id",
    defaultSort: { key: "offer_id", direction: "desc" },
    columns: [
      { key: "offer_id", label: "Offer ID", type: "number", showInTable: true, showInForm: false, editable: false },
      { key: "shop_id", label: "Shop", type: "number", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Which shop is running this offer?" },
      { key: "offer_title", label: "Offer Title", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Summer Sale - 50% Off!" },
      { key: "offer_desc", label: "Description", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "Describe what this offer includes" },
      { key: "discount_type", label: "Discount Type", type: "select", editable: true, showInTable: true, showInForm: true, options: [{ value: "PERCENT", label: "Percentage (%)" }, { value: "FLAT", label: "Flat Amount" }] },
      { key: "discount_val", label: "Discount Value", type: "number", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. 20 for 20% or flat amount" },
      { key: "start_date", label: "Starts On", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "end_date", label: "Ends On", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "is_active", label: "Active", type: "select", editable: true, showInTable: true, showInForm: true, defaultValue: "Y", options: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }] },
      { key: "created_at", label: "Created On", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },

  ar_shops: {
    tableName: "ar_shops",
    displayName: "Shops",
    description: "Your registered shops and all their details",
    primaryKey: "shop_id",
    defaultSort: { key: "shop_id", direction: "desc" },
    columns: [
      { key: "shop_id", label: "Shop ID", type: "number", showInTable: true, showInForm: false, editable: false },
      { key: "shop_name", label: "Shop Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "What is this shop called?" },
      { key: "category_id", label: "Category", type: "number", editable: true, showInTable: true, showInForm: true, placeholder: "Which category does this shop belong to?" },
      { key: "floor_no", label: "Floor", type: "number", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. 1, 2, -1 for basement" },
      { key: "node_id", label: "Navigation Point", type: "number", editable: true, showInTable: false, showInForm: true, placeholder: "Linked navigation point on the map" },
      { key: "description", label: "Description", type: "textarea", editable: true, showInTable: false, showInForm: true, placeholder: "Tell visitors what this shop is about" },
      { key: "contact_no", label: "Contact Number", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "+91 98765 43210" },
      { key: "open_time", label: "Opens At", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "09:00" },
      { key: "close_time", label: "Closes At", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "21:00" },
      { key: "is_active", label: "Active", type: "select", editable: true, showInTable: true, showInForm: true, defaultValue: "Y", options: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }] },
      { key: "pos_x", label: "Position X", type: "number", editable: true, showInTable: false, showInForm: true, placeholder: "X coordinate on map" },
      { key: "pos_y", label: "Position Y", type: "number", editable: true, showInTable: false, showInForm: true, placeholder: "Y coordinate on map" },
      { key: "pos_z", label: "Position Z", type: "number", editable: true, showInTable: false, showInForm: true, placeholder: "Z coordinate on map" },
      { key: "image_url", label: "Image Link", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "Paste the image URL here" },
      { key: "shop_url", label: "Website", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "https://example.com" },
      { key: "created_at", label: "Added On", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "created_by", label: "Added By", type: "text", editable: true, showInTable: false, showInForm: true, placeholder: "Your name or email" },
    ],
  },

  ar_user_presence: {
    tableName: "ar_user_presence",
    displayName: "Users",
    description: "People using your NavME experience",
    primaryKey: "user_id",
    defaultSort: { key: "user_id", direction: "desc" },
    columns: [
      { key: "user_id", label: "User ID", type: "number", showInTable: true, showInForm: false, editable: false },
      { key: "user_name", label: "Name", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "User's display name" },
      { key: "email", label: "Email", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "user@example.com" },
      { key: "share_enabled", label: "Sharing", type: "select", editable: true, showInTable: true, showInForm: true, defaultValue: "N", options: [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }] },
      { key: "session_id", label: "Session", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Current session identifier" },
      { key: "last_seen_at", label: "Last Active", type: "datetime", editable: false, showInTable: true, showInForm: false },
    ],
  },
};

export const tableOrder = [
  "ar_shop_categories",
  "ar_shop_items",
  "ar_shop_offers",
  "ar_shops",
  "ar_user_presence",
] as const;
