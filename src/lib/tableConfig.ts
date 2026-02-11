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
      { key: "category_id", label: "Category ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "category_name", label: "Category Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Food & Beverage, Fashion" },
      { key: "icon_class", label: "Icon", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. fa-store" },
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
      { key: "item_id", label: "Item ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "shop_id", label: "Shop ID", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Shop ID" },
      { key: "item_name", label: "Item Name", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Name of the item" },
      { key: "item_type", label: "Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Food, Clothing" },
      { key: "item_price", label: "Price", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0.00" },
      { key: "item_currency", label: "Currency", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. INR, USD" },
      { key: "is_available", label: "Available", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
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
      { key: "offer_id", label: "Offer ID", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "shop_id", label: "Shop ID", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Shop ID" },
      { key: "offer_title", label: "Offer Title", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. Summer Sale" },
      { key: "offer_desc", label: "Description", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "What this offer includes" },
      { key: "discount_type", label: "Discount Type", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "PERCENT or FLAT" },
      { key: "discount_val", label: "Discount Value", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. 20" },
      { key: "start_date", label: "Starts On", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "end_date", label: "Ends On", type: "date", editable: true, showInTable: true, showInForm: true },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
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
      { key: "shop_id", label: "Shop ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Shop ID" },
      { key: "shop_name", label: "Shop Name", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Name of the shop" },
      { key: "category_id", label: "Category ID", type: "text", required: true, editable: true, showInTable: true, showInForm: true, placeholder: "Category ID" },
      { key: "floor_no", label: "Floor", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "e.g. 1" },
      { key: "node_id", label: "Node ID", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Node ID" },
      { key: "description", label: "Description", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "About this shop" },
      { key: "contact_no", label: "Contact Number", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "+91 98765 43210" },
      { key: "open_time", label: "Opens At", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "09:00" },
      { key: "close_time", label: "Closes At", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "21:00" },
      { key: "is_active", label: "Active", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
      { key: "created_at", label: "Added On", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "created_by", label: "Added By", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Your name" },
      { key: "pos_x", label: "Position X", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_y", label: "Position Y", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "pos_z", label: "Position Z", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "0" },
      { key: "image_url", label: "Image Link", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "https://" },
      { key: "image_blob", label: "Image Data", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "file_name", label: "File Name", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "mime_type", label: "Mime Type", type: "text", editable: true, showInTable: true, showInForm: true },
      { key: "shop_url", label: "Website", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "https://" },
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
      { key: "share_enabled", label: "Sharing", type: "text", editable: true, showInTable: true, showInForm: true, placeholder: "Y or N" },
      { key: "last_seen_at", label: "Last Active", type: "datetime", editable: false, showInTable: true, showInForm: false },
      { key: "session_id", label: "Session", type: "text", editable: true, showInTable: true, showInForm: false },
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
