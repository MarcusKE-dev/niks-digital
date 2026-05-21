// ════════════════════════════════════════════════════════════
// NIKS DIGITAL CONNECTION — TYPE DEFINITIONS
// Single source of truth for all TypeScript interfaces.
// These map directly to the Supabase database schema.
// ════════════════════════════════════════════════════════════

// ── CATEGORY ─────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null          // emoji or icon identifier
  image_url: string | null
  display_order: number
  created_at: string
}

// A leaner version used in nav dropdowns and filter sidebars
export interface CategorySummary {
  id: string
  name: string
  slug: string
  icon: string | null
  product_count?: number       // joined from products table
}

// ── PRODUCT ──────────────────────────────────────────────────

export type ProductBadge = 'new' | 'sale' | 'hot' | null

export interface Product {
  id: string
  name: string
  slug: string
  category_id: string
  category?: Category          // joined
  description: string | null
  features: string[]           // e.g. ['4K Display', '3x HDMI', ...]
  price: number                // in KES
  old_price: number | null     // null = no discount
  stock_qty: number
  sku: string | null
  brand: string | null
  images: string[]             // array of URLs (first = thumbnail)
  thumbnail: string | null     // primary display image URL
  badge: ProductBadge
  is_featured: boolean
  is_active: boolean
  rating: number               // 0.00 – 5.00
  review_count: number
  weight_kg: number | null
  created_at: string
  updated_at: string
}

// Lightweight version for listing pages (no heavy fields)
export interface ProductSummary {
  id: string
  name: string
  slug: string
  category_id: string
  category_name?: string
  brand: string | null
  price: number
  old_price: number | null
  thumbnail: string | null
  badge: ProductBadge
  is_featured: boolean
  stock_qty: number
  rating: number
  review_count: number
}

// ── CART ─────────────────────────────────────────────────────

export interface CartItem {
  id: string                   // product id
  name: string
  slug: string
  thumbnail: string | null
  price: number
  qty: number                  // quantity in cart
  stock_qty: number            // max available
  brand: string | null
}

export interface CartState {
  items: CartItem[]
  // Actions
  addItem:      (product: ProductSummary | Product, qty?: number) => void
  removeItem:   (productId: string) => void
  updateQty:    (productId: string, qty: number) => void
  clearCart:    () => void
  // Computed
  totalItems:   () => number
  subtotal:     () => number
  deliveryFee:  () => number
  total:        () => number
}

// ── ORDER ────────────────────────────────────────────────────

export type PaymentMethod = 'mpesa' | 'card' | 'cash'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  order_number: string         // e.g. NDC-2026-0042
  customer_name: string
  customer_email: string | null
  customer_phone: string
  delivery_address: string
  delivery_area: string | null
  notes: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  mpesa_receipt: string | null
  order_status: OrderStatus
  created_at: string
  updated_at: string
  // Joined
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string         // snapshot — product may change later
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
}

// ── FORMS ────────────────────────────────────────────────────

// Checkout form data (matches Zod schema in lib/validations.ts)
export interface CheckoutFormData {
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_area: string
  delivery_address: string
  notes: string
  payment_method: PaymentMethod
  mpesa_phone: string          // defaults to customer_phone
}

// Admin: Create/edit product form
export interface ProductFormData {
  name: string
  slug: string
  category_id: string
  brand: string
  sku: string
  price: number
  old_price: number | ''
  stock_qty: number
  description: string
  features: string[]
  badge: ProductBadge
  is_featured: boolean
  is_active: boolean
  weight_kg: number | ''
  images: string[]             // URLs after upload
}

// Admin: Create/edit category form
export interface CategoryFormData {
  name: string
  slug: string
  description: string
  icon: string
  display_order: number
}

// Contact form
export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

// ── FILTERS ──────────────────────────────────────────────────

export interface ProductFilters {
  category?: string            // category slug
  brand?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  badge?: ProductBadge
  is_featured?: boolean
  sort?: ProductSortOption
  page?: number
  limit?: number
  search?: string
}

export type ProductSortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'rating'
  | 'popular'

// ── API RESPONSES ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Daraja STK Push response
export interface DarajaStkResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

// Daraja callback data (sent to our webhook)
export interface DarajaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number          // 0 = success
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value?: string | number
        }>
      }
    }
  }
}

// ── UI STATE ─────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number            // ms, default 3500
}

export interface Modal {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
}

// ── DELIVERY AREAS ───────────────────────────────────────────

export const DELIVERY_AREAS = [
  { value: 'kikuyu',       label: 'Kikuyu Town',           fee: 0    },
  { value: 'kawangware',   label: 'Kawangware',            fee: 200  },
  { value: 'ruthimitu',    label: 'Ruthimitu / Dagoretti',  fee: 200  },
  { value: 'cbd',          label: 'Nairobi CBD',            fee: 300  },
  { value: 'westlands',    label: 'Westlands / Parklands',  fee: 300  },
  { value: 'kasarani',     label: 'Kasarani / Thika Rd',    fee: 400  },
  { value: 'karen',        label: 'Karen / Langata',        fee: 400  },
  { value: 'kitengela',    label: 'Kitengela / Ongata',     fee: 500  },
  { value: 'limuru',       label: 'Limuru / Tigoni',        fee: 300  },
  { value: 'ruiru',        label: 'Ruiru / Juja',           fee: 500  },
  { value: 'other',        label: 'Other (contact us)',     fee: 0    },
] as const

export type DeliveryArea = typeof DELIVERY_AREAS[number]['value']

// Free delivery threshold (KES)
export const FREE_DELIVERY_THRESHOLD = 10_000

// ── UTILITY TYPES ────────────────────────────────────────────

// Make some fields optional for partial updates
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Extract non-null values
export type NonNullable<T> = T extends null | undefined ? never : T
