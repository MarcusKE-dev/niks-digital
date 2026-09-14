-- ════════════════════════════════════════════════════════════
-- 002 — SECURITY HARDENING
--
-- WHY THIS EXISTS
-- ---------------
-- Every write policy in 001 was written as `auth.role() = 'authenticated'`.
-- In Supabase, *any* account that can sign in holds the `authenticated`
-- role, and the anon key that grants sign-in is shipped to every browser.
-- So if sign-ups are open (or a single non-admin account ever exists),
-- that policy let a stranger:
--
--   • insert, edit and delete products and categories
--   • read every order — names, phone numbers, delivery addresses
--   • change order and payment status
--   • upload to and delete from the product-images bucket
--
-- This migration re-points every policy at real admin membership
-- (`public.is_admin()`), removes the public INSERT on orders that let
-- callers bypass the server-side price checks, locks down the stock
-- RPC, and puts RLS on the two tables that were created by hand and
-- never had any (`admins`, `site_settings`).
--
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════


-- ── ADMINS TABLE ──────────────────────────────────────────────
-- Membership here is the single source of truth for admin access.

CREATE TABLE IF NOT EXISTS admins (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Columns the app relies on, for a table that predates this migration.
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email      text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- One admin row per account.
CREATE UNIQUE INDEX IF NOT EXISTS admins_user_id_key ON admins(user_id);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- No policies are defined for `admins`, which with RLS enabled means
-- anon and authenticated clients can read and write nothing. The server
-- reaches it with the service role key, which bypasses RLS.
DROP POLICY IF EXISTS "admins_select_self"          ON admins;
DROP POLICY IF EXISTS "admins_select_authenticated" ON admins;
DROP POLICY IF EXISTS "admins_all_authenticated"    ON admins;


-- ── is_admin() ────────────────────────────────────────────────
-- SECURITY DEFINER so policies can consult `admins` without every
-- caller needing read access to it. search_path is pinned so the
-- function cannot be hijacked by a shadowing schema.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()
  );
$$;

REVOKE ALL   ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ── CATEGORIES ────────────────────────────────────────────────

DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin"  ON categories;
DROP POLICY IF EXISTS "categories_update_admin"  ON categories;
DROP POLICY IF EXISTS "categories_delete_admin"  ON categories;

CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── PRODUCTS ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_select_admin"  ON products;
DROP POLICY IF EXISTS "products_insert_admin"  ON products;
DROP POLICY IF EXISTS "products_update_admin"  ON products;
DROP POLICY IF EXISTS "products_delete_admin"  ON products;

-- Shoppers see active products; admins see everything, including drafts.
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── ORDERS ────────────────────────────────────────────────────
-- Orders are created only by /api/orders/create, which runs with the
-- service role after re-pricing the cart against the database. The old
-- `WITH CHECK (true)` INSERT policy let anyone POST an order straight
-- to PostgREST with any total they liked, so it is removed rather than
-- rewritten. Reads are admin-only; the customer's own confirmation page
-- is served through the server, keyed on the order's unguessable UUID.

DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_select_own"    ON orders;
DROP POLICY IF EXISTS "orders_select_admin"  ON orders;
DROP POLICY IF EXISTS "orders_update_admin"  ON orders;
DROP POLICY IF EXISTS "orders_delete_admin"  ON orders;

CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "orders_delete_admin"
  ON orders FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── ORDER ITEMS ───────────────────────────────────────────────

DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
DROP POLICY IF EXISTS "order_items_select_public" ON order_items;
DROP POLICY IF EXISTS "order_items_select_admin"  ON order_items;
DROP POLICY IF EXISTS "order_items_update_admin"  ON order_items;
DROP POLICY IF EXISTS "order_items_delete_admin"  ON order_items;

CREATE POLICY "order_items_select_admin"
  ON order_items FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "order_items_update_admin"
  ON order_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_delete_admin"
  ON order_items FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── SITE SETTINGS ─────────────────────────────────────────────
-- Hero banner and category photos. Read by every visitor, written only
-- from the admin Settings page. This table was created by hand and had
-- no RLS at all, so any visitor could rewrite the homepage.

CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
DROP POLICY IF EXISTS "site_settings_insert_admin"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_admin"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_delete_admin"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_all_auth"      ON site_settings;

CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings_insert_admin"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "site_settings_update_admin"
  ON site_settings FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "site_settings_delete_admin"
  ON site_settings FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── STOCK RPC ─────────────────────────────────────────────────
-- decrement_stock() is reachable over PostgREST by anyone holding the
-- anon key. Left open, a stranger can call it in a loop and zero out
-- the entire inventory. Only the order API (service role) needs it.

DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('decrement_stock', 'generate_order_number')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated;', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role;', fn.sig);
  END LOOP;
END $$;


-- ── STORAGE ───────────────────────────────────────────────────
-- Uploads were open to any authenticated account, which made the
-- product-images bucket free hosting for anyone with a login.

DROP POLICY IF EXISTS "product_images_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;

CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Keep the bucket's own limits tight: 5 MB, images only. Blocks SVG,
-- which can carry script when served inline.
UPDATE storage.buckets
SET file_size_limit    = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'product-images';
