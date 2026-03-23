-- Add user_id to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies for interviews
DROP POLICY IF EXISTS "Users can view their own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can insert their own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can update their own interviews" ON interviews;
DROP POLICY IF EXISTS "Allow anonymous insert" ON interviews;
DROP POLICY IF EXISTS "Allow anonymous select" ON interviews;
DROP POLICY IF EXISTS "Allow anonymous update" ON interviews;

-- Allow authenticated users to manage their own interviews
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" ON interviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON interviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow anonymous (guest) users to create and view interviews temporarily
-- Guest interviews will have NULL user_id
CREATE POLICY "Guests can insert interviews" ON interviews
  FOR INSERT TO anon WITH CHECK (user_id IS NULL);

CREATE POLICY "Guests can view their session interviews" ON interviews
  FOR SELECT TO anon USING (user_id IS NULL);

CREATE POLICY "Guests can update their session interviews" ON interviews
  FOR UPDATE TO anon USING (user_id IS NULL);
