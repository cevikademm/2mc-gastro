-- Siparişler tablosu
CREATE TABLE IF NOT EXISTS gastro_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  total_items INTEGER NOT NULL,
  notes TEXT,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sipariş event geçmişi
CREATE TABLE IF NOT EXISTS gastro_order_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES gastro_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE gastro_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastro_order_events ENABLE ROW LEVEL SECURITY;

-- gastro_orders policies (ayrı ayrı SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Users can view own orders" ON gastro_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON gastro_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON gastro_orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON gastro_orders
  FOR DELETE USING (auth.uid() = user_id);

-- gastro_order_events policies
CREATE POLICY "Users can view own order events" ON gastro_order_events
  FOR SELECT USING (order_id IN (SELECT id FROM gastro_orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own order events" ON gastro_order_events
  FOR INSERT WITH CHECK (order_id IN (SELECT id FROM gastro_orders WHERE user_id = auth.uid()));
