export type Business = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  published: boolean;
  plan_key: string;
  allow_pickup: boolean;
  allow_delivery: boolean;
  shipping_mode: "global" | "neighborhood";
  global_shipping_fee: number;
  billing_status: "ok" | "past_due" | "canceled";
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
};
export type Category = {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};
export type Photo = {
  id?: string;
  storage_path: string;
  public_url: string;
  sort_order?: number;
};
export type Product = {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  internal_code: string | null;
  description: string;
  price: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  archived_at: string | null;
  product_images: Photo[];
};
export type Settings = {
  business_id: string;
  accent_color: string;
  logo_url: string | null;
  logo_path: string | null;
  layout: "grid" | "list" | "showcase";
  theme: "light" | "dark" | "soft";
  card_style: "soft" | "bordered" | "minimal";
  image_ratio: "landscape" | "square" | "portrait";
  button_style: "rounded" | "pill" | "square";
  headline: string;
  description: string;
  show_search: boolean;
  show_categories: boolean;
  show_descriptions: boolean;
  show_promo_bar: boolean;
  promo_text: string;
};
export type Zone = {
  id: string;
  business_id: string;
  name: string;
  fee: number;
  active: boolean;
  sort_order: number;
};
export type OrderItem = {
  product_id: string;
  product_name_snapshot: string;
  product_image_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};
export type Order = {
  id: string;
  business_id: string;
  order_number: number;
  status: "new" | "conversation" | "completed";
  outcome: "sold" | "not_sold" | null;
  customer_name: string;
  customer_phone: string;
  fulfillment: "pickup" | "delivery";
  neighborhood_name_snapshot: string | null;
  delivery_address: string | null;
  delivery_complement: string | null;
  notes: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};
export type StoreData = {
  business: Business;
  settings: Settings;
  categories: Category[];
  products: Product[];
  zones: Zone[];
};
export type DashboardData = StoreData & {
  orders: Order[];
  email: string;
  view: "kanban" | "list";
};
