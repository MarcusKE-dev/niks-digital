-- ════════════════════════════════════════════════════════════
-- NIKS DIGITAL CONNECTION — DATABASE MIGRATION
-- File: supabase/migrations/001_initial_schema.sql

--
-- This creates:
--   • 4 tables: categories, products, orders, order_items
--   • Indexes for fast queries
--   • Row Level Security (RLS) policies
--   • Triggers to auto-update updated_at timestamps
--   • A helper function for generating order numbers
-- ════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════
-- TABLE: categories
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  description   TEXT,
  icon          TEXT,                    -- emoji, e.g. '📺'
  image_url     TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  categories              IS 'Product categories (TVs, Fridges, etc.)';
COMMENT ON COLUMN categories.slug         IS 'URL-safe identifier, e.g. televisions';
COMMENT ON COLUMN categories.display_order IS 'Controls order in category strip (lower = first)';


-- ════════════════════════════════════════════════════════════
-- TABLE: products
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  category_id   UUID        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description   TEXT,
  features      TEXT[]      NOT NULL DEFAULT '{}',  -- e.g. {'4K Display','3x HDMI'}
  price         NUMERIC(10,2) NOT NULL CHECK (price > 0),
  old_price     NUMERIC(10,2) CHECK (old_price IS NULL OR old_price > price),
  stock_qty     INT         NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  sku           TEXT        UNIQUE,
  brand         TEXT,
  images        TEXT[]      NOT NULL DEFAULT '{}',  -- ordered array of image URLs
  thumbnail     TEXT,                               -- primary image (first of images[])
  badge         TEXT        CHECK (badge IN ('new', 'sale', 'hot') OR badge IS NULL),
  is_featured   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  rating        NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count  INT         NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  weight_kg     NUMERIC(5,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  products            IS 'All product listings';
COMMENT ON COLUMN products.features   IS 'Array of key feature strings for the product detail page';
COMMENT ON COLUMN products.images     IS 'Ordered array of image URLs. First item = thumbnail.';
COMMENT ON COLUMN products.badge      IS 'Highlight label: new | sale | hot | NULL';
COMMENT ON COLUMN products.is_active  IS 'FALSE hides product from shop without deleting it';


-- ════════════════════════════════════════════════════════════
-- TABLE: orders
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT        UNIQUE NOT NULL,     -- NDC-2026-XXXX
  customer_name    TEXT        NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT        NOT NULL,
  delivery_address TEXT        NOT NULL,
  delivery_area    TEXT,
  notes            TEXT,
  subtotal         NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  payment_method   TEXT        NOT NULL DEFAULT 'mpesa'
                   CHECK (payment_method IN ('mpesa', 'card', 'cash')),
  payment_status   TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  mpesa_receipt    TEXT,                            -- M-Pesa receipt number e.g. QJK9X4ABCD
  order_status     TEXT        NOT NULL DEFAULT 'new'
                   CHECK (order_status IN ('new','confirmed','packed','dispatched','delivered','cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  orders              IS 'Customer orders placed on the site';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order ID shown to customers, e.g. NDC-2026-0042';
COMMENT ON COLUMN orders.mpesa_receipt IS 'Safaricom confirmation code returned by Daraja callback';


-- ════════════════════════════════════════════════════════════
-- TABLE: order_items
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID        REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT        NOT NULL,               -- snapshot at time of order
  product_image TEXT,                               -- snapshot
  quantity      INT         NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  total_price   NUMERIC(10,2) NOT NULL CHECK (total_price > 0)
);

COMMENT ON TABLE  order_items             IS 'Individual line items within an order';
COMMENT ON COLUMN order_items.product_name IS 'Stored as a snapshot — safe even if product is later renamed/deleted';


-- ════════════════════════════════════════════════════════════
-- INDEXES — for fast queries
-- ════════════════════════════════════════════════════════════

-- Products: most common queries
CREATE INDEX IF NOT EXISTS idx_products_category_id   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_badge          ON products(badge) WHERE badge IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_price          ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock          ON products(stock_qty);
CREATE INDEX IF NOT EXISTS idx_products_created_at     ON products(created_at DESC);

-- Full-text search index on product name + description
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));

-- Orders: admin queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status     ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status   ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone   ON orders(customer_phone);

-- Order items: join queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id  ON order_items(product_id);


-- ════════════════════════════════════════════════════════════
-- TRIGGER: auto-update updated_at on row change
-- ════════════════════════════════════════════════════════════

-- Function used by all updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to products
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Apply to orders
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ════════════════════════════════════════════════════════════
-- FUNCTION: generate_order_number()
-- Called from the Next.js API route, but defined here as backup.
-- Format: NDC-YYYY-NNNN (e.g. NDC-2026-0042)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_str    TEXT;
  seq_num     INT;
  order_num   TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');

  -- Count orders this year and add 1
  SELECT COUNT(*) + 1
    INTO seq_num
    FROM orders
   WHERE order_number LIKE 'NDC-' || year_str || '-%';

  order_num := 'NDC-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Controls who can read and write each table.
-- ════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- ── CATEGORIES ───────────────────────────────────────────────
-- Anyone can read categories (needed for nav, filters).
-- Only authenticated admin users can write.

CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── PRODUCTS ─────────────────────────────────────────────────
-- Anyone can read active products.
-- Authenticated admin can manage all products (including inactive).

CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (is_active = true);

-- Admin can see all products (including inactive)
CREATE POLICY "products_select_admin"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── ORDERS ───────────────────────────────────────────────────
-- Anyone can create an order (checkout).
-- Customers can read their own order by phone number.
-- Only authenticated admin can see all orders and update status.

CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Customer can view their own order using phone number
-- (passed as a custom header or auth claim in the API request)
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR customer_phone = current_setting('app.customer_phone', true)
  );

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');


-- ── ORDER ITEMS ───────────────────────────────────────────────
-- Same access rules as orders (joined via order_id).

CREATE POLICY "order_items_insert_public"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select_public"
  ON order_items FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND (
          auth.role() = 'authenticated'
          OR o.customer_phone = current_setting('app.customer_phone', true)
        )
    )
  );

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in the Supabase SQL editor to create storage
-- buckets for product images.
-- ════════════════════════════════════════════════════════════

-- Create the product-images bucket (public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,   -- 5MB max per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read product images
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "product_images_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update/delete
CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
