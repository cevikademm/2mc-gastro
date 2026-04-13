-- 007_admin_orders_rls.sql
-- Admin full access to gastro_orders + gastro_order_events.
-- Regular users keep their existing owner-scoped policies untouched.

ALTER TABLE gastro_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_order_events ENABLE ROW LEVEL SECURITY;

-- ── gastro_orders ───────────────────────────────────────────
DROP POLICY IF EXISTS "Admins read all orders" ON gastro_orders;
CREATE POLICY "Admins read all orders" ON gastro_orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins update all orders" ON gastro_orders;
CREATE POLICY "Admins update all orders" ON gastro_orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ── gastro_order_events ─────────────────────────────────────
DROP POLICY IF EXISTS "Admins read all order events" ON gastro_order_events;
CREATE POLICY "Admins read all order events" ON gastro_order_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins insert order events" ON gastro_order_events;
CREATE POLICY "Admins insert order events" ON gastro_order_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
