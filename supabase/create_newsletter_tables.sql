-- Create Newsletter Editions Table
CREATE TABLE IF NOT EXISTS newsletter_editions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL, -- Date of the edition (e.g., "2024-06-12")
  cover_image TEXT,
  synthesis TEXT, -- Executive abstract
  pdf_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Relationship Table (Junction Table for Ordering)
CREATE TABLE IF NOT EXISTS newsletter_items_rel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES newsletter_editions(id) ON DELETE CASCADE,
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(edition_id, news_item_id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_newsletter_editions_date ON newsletter_editions (date DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_rel_edition ON newsletter_items_rel (edition_id);

-- RLS Policies
ALTER TABLE newsletter_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_items_rel ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public items are viewable by everyone" ON newsletter_editions
  FOR SELECT USING (true);
CREATE POLICY "Public items are viewable by everyone" ON newsletter_items_rel
  FOR SELECT USING (true);

-- Authenticated/Service Role Write Access (Admin)
-- Assuming authenticated users with specific roles or service_role can write. 
-- For simplicity in this stack, allowing authenticated users to write if they are admins (handled by app logic/admin routes usually, strict RLS would check profile role)
-- For now, allowing all authenticated to INSERT/UPDATE/DELETE for admin features if your app uses simple auth
CREATE POLICY "Admins can insert editions" ON newsletter_editions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update editions" ON newsletter_editions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete editions" ON newsletter_editions
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert rels" ON newsletter_items_rel
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update rels" ON newsletter_items_rel
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete rels" ON newsletter_items_rel
  FOR DELETE USING (auth.role() = 'authenticated');
