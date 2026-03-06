-- Create documentation table for full-text search indexing
CREATE TABLE IF NOT EXISTS documentation (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create full-text search index for fast queries
CREATE INDEX IF NOT EXISTS documentation_fts_idx 
ON documentation USING gin(to_tsvector('english', content || ' ' || title));

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS documentation_slug_idx ON documentation(slug);

-- Create index on section for filtering by category
CREATE INDEX IF NOT EXISTS documentation_section_idx ON documentation(section);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_documentation_updated_at ON documentation;
CREATE TRIGGER update_documentation_updated_at
  BEFORE UPDATE ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable full-text search for documentation table (optional - for advanced features)
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing public read access for documentation (adjust as needed)
CREATE POLICY "Public read access" ON documentation
  FOR SELECT USING (true);
