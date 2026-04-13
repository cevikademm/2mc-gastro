-- 008_fix_admin_rls_recursion.sql
-- Fix infinite recursion in profiles RLS policies.
-- Root cause: migration 005 policies on `profiles` contained
--   EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
-- which triggers the same policy recursively. Replace with a
-- SECURITY DEFINER helper that bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles ---------------------------------------------------
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin());

-- brands / categories / products -----------------------------
DROP POLICY IF EXISTS "Admins manage brands" ON brands;
CREATE POLICY "Admins manage brands" ON brands
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products
  FOR ALL USING (public.is_admin());

-- gastro_orders / events -------------------------------------
DROP POLICY IF EXISTS "Admins read all orders" ON gastro_orders;
CREATE POLICY "Admins read all orders" ON gastro_orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update all orders" ON gastro_orders;
CREATE POLICY "Admins update all orders" ON gastro_orders
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read all order events" ON gastro_order_events;
CREATE POLICY "Admins read all order events" ON gastro_order_events
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert order events" ON gastro_order_events;
CREATE POLICY "Admins insert order events" ON gastro_order_events
  FOR INSERT WITH CHECK (public.is_admin());
