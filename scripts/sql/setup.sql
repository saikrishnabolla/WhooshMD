-- ============================================================
-- WhooshMD Database Setup
-- ============================================================
-- Run this entire script in your Supabase SQL Editor to set up
-- all required tables, indexes, RLS policies, and triggers.
--
-- Prerequisites:
-- 1. Create a Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your project dashboard
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- ============================================================


-- ============================================================
-- 1. CALL RESULTS TABLE
-- Stores AI voice call outcomes and extracted data
-- ============================================================

CREATE TABLE IF NOT EXISTS call_results (
  id SERIAL,
  call_id VARCHAR(50) PRIMARY KEY,
  provider_npi VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  availability_status TEXT,
  availability_details TEXT,
  summary TEXT,
  sentiment VARCHAR(20),
  call_date TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Extracted variables from AI analysis
  extracted_variables JSONB,
  clinic_name TEXT,
  contact_person TEXT,
  insurance_accepted TEXT,
  appointment_types_available TEXT,
  availability_timeframe TEXT,
  specific_availability TEXT,
  call_outcome_quality TEXT,
  clinic_phone_verified TEXT,
  follow_up_needed TEXT,
  callback_instructions TEXT,
  additional_requirements TEXT
);

-- Indexes for call_results
CREATE INDEX IF NOT EXISTS idx_call_results_provider_npi ON call_results(provider_npi);
CREATE INDEX IF NOT EXISTS idx_call_results_user_id ON call_results(user_id);
CREATE INDEX IF NOT EXISTS idx_call_results_status ON call_results(status);
CREATE INDEX IF NOT EXISTS idx_call_results_created_at ON call_results(created_at);
CREATE INDEX IF NOT EXISTS idx_call_results_clinic_name ON call_results(clinic_name);
CREATE INDEX IF NOT EXISTS idx_call_results_insurance_accepted ON call_results(insurance_accepted);

-- Enable RLS
ALTER TABLE call_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_results
DROP POLICY IF EXISTS "Users can view own call results" ON call_results;
CREATE POLICY "Users can view own call results" ON call_results
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own call results" ON call_results;
CREATE POLICY "Users can insert own call results" ON call_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own call results" ON call_results;
CREATE POLICY "Users can update own call results" ON call_results
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON call_results;
CREATE POLICY "Service role full access" ON call_results
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_call_results_updated_at ON call_results;
CREATE TRIGGER update_call_results_updated_at
    BEFORE UPDATE ON call_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 2. FAVORITES TABLE
-- Stores user's favorite healthcare providers
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  provider_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider_npi)
);

-- Indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_provider_npi ON favorites(provider_npi);
CREATE INDEX IF NOT EXISTS idx_favorites_user_provider ON favorites(user_id, provider_npi);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
CREATE POLICY "Users can update own favorites" ON favorites
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_favorites_updated_at ON favorites;
CREATE TRIGGER update_favorites_updated_at
    BEFORE UPDATE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_favorites_updated_at();


-- ============================================================
-- 3. COMMUNITY FEATURES TABLES
-- Provider ratings, reviews, availability, and insurance info
-- ============================================================

-- Provider Ratings
CREATE TABLE IF NOT EXISTS provider_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_provider_rating UNIQUE (user_id, provider_npi)
);

-- Provider Reviews
CREATE TABLE IF NOT EXISTS provider_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  review_text TEXT NOT NULL,
  visit_date DATE,
  appointment_type VARCHAR(100),
  would_recommend BOOLEAN,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Availability Updates
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  accepting_new_patients BOOLEAN,
  next_available_appointment DATE,
  appointment_types TEXT[],
  office_hours JSONB,
  wait_time_estimate VARCHAR(50),
  notes TEXT,
  last_contacted_date DATE,
  contact_method VARCHAR(50),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  verified_by_office BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Insurance Information
CREATE TABLE IF NOT EXISTS provider_insurance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  insurance_name VARCHAR(200) NOT NULL,
  insurance_type VARCHAR(100),
  plan_specific_details TEXT,
  copay_amount DECIMAL(10,2),
  deductible_applies BOOLEAN,
  is_in_network BOOLEAN,
  verification_date DATE,
  notes TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  review_id UUID REFERENCES provider_reviews(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id)
);

-- Indexes for community tables
CREATE INDEX IF NOT EXISTS idx_provider_ratings_npi ON provider_ratings(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_user ON provider_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_npi ON provider_reviews(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_user ON provider_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_npi ON provider_availability(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_availability_user ON provider_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_insurance_npi ON provider_insurance(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_insurance_user ON provider_insurance(user_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- Enable RLS for community tables
ALTER TABLE provider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Ratings (public read, authenticated write)
DROP POLICY IF EXISTS "Anyone can view ratings" ON provider_ratings;
CREATE POLICY "Anyone can view ratings" ON provider_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert ratings" ON provider_ratings;
CREATE POLICY "Authenticated users can insert ratings" ON provider_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own ratings" ON provider_ratings;
CREATE POLICY "Users can update own ratings" ON provider_ratings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own ratings" ON provider_ratings;
CREATE POLICY "Users can delete own ratings" ON provider_ratings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON provider_reviews;
CREATE POLICY "Anyone can view reviews" ON provider_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON provider_reviews;
CREATE POLICY "Authenticated users can insert reviews" ON provider_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reviews" ON provider_reviews;
CREATE POLICY "Users can update own reviews" ON provider_reviews FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own reviews" ON provider_reviews;
CREATE POLICY "Users can delete own reviews" ON provider_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Availability
DROP POLICY IF EXISTS "Anyone can view availability" ON provider_availability;
CREATE POLICY "Anyone can view availability" ON provider_availability FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert availability" ON provider_availability;
CREATE POLICY "Authenticated users can insert availability" ON provider_availability FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own availability" ON provider_availability;
CREATE POLICY "Users can update own availability" ON provider_availability FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own availability" ON provider_availability;
CREATE POLICY "Users can delete own availability" ON provider_availability FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Insurance
DROP POLICY IF EXISTS "Anyone can view insurance" ON provider_insurance;
CREATE POLICY "Anyone can view insurance" ON provider_insurance FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert insurance" ON provider_insurance;
CREATE POLICY "Authenticated users can insert insurance" ON provider_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own insurance" ON provider_insurance;
CREATE POLICY "Users can update own insurance" ON provider_insurance FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own insurance" ON provider_insurance;
CREATE POLICY "Users can delete own insurance" ON provider_insurance FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Review Votes
DROP POLICY IF EXISTS "Anyone can view votes" ON review_votes;
CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can vote" ON review_votes;
CREATE POLICY "Authenticated users can vote" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own votes" ON review_votes;
CREATE POLICY "Users can update own votes" ON review_votes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own votes" ON review_votes;
CREATE POLICY "Users can delete own votes" ON review_votes FOR DELETE USING (auth.uid() = user_id);

-- Trigger functions for community tables
CREATE OR REPLACE FUNCTION update_provider_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_provider_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_provider_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_provider_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE provider_reviews
    SET helpful_count = (
      SELECT COUNT(*) FROM review_votes
      WHERE review_id = NEW.review_id AND is_helpful = true
    )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE provider_reviews
    SET helpful_count = (
      SELECT COUNT(*) FROM review_votes
      WHERE review_id = OLD.review_id AND is_helpful = true
    )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for community tables
DROP TRIGGER IF EXISTS update_provider_ratings_updated_at ON provider_ratings;
CREATE TRIGGER update_provider_ratings_updated_at
    BEFORE UPDATE ON provider_ratings
    FOR EACH ROW EXECUTE FUNCTION update_provider_ratings_updated_at();

DROP TRIGGER IF EXISTS update_provider_reviews_updated_at ON provider_reviews;
CREATE TRIGGER update_provider_reviews_updated_at
    BEFORE UPDATE ON provider_reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_reviews_updated_at();

DROP TRIGGER IF EXISTS update_provider_availability_updated_at ON provider_availability;
CREATE TRIGGER update_provider_availability_updated_at
    BEFORE UPDATE ON provider_availability
    FOR EACH ROW EXECUTE FUNCTION update_provider_availability_updated_at();

DROP TRIGGER IF EXISTS update_provider_insurance_updated_at ON provider_insurance;
CREATE TRIGGER update_provider_insurance_updated_at
    BEFORE UPDATE ON provider_insurance
    FOR EACH ROW EXECUTE FUNCTION update_provider_insurance_updated_at();

DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_votes;
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();


-- ============================================================
-- 4. PROVIDER SUMMARY VIEW
-- Aggregates community data for quick lookups
-- ============================================================

CREATE OR REPLACE VIEW provider_summary AS
SELECT
  p.provider_npi,
  ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
  COUNT(r.rating) as total_ratings,
  ROUND(AVG(r.wait_time_rating)::numeric, 1) as avg_wait_time_rating,
  ROUND(AVG(r.communication_rating)::numeric, 1) as avg_communication_rating,
  ROUND(AVG(r.facility_rating)::numeric, 1) as avg_facility_rating,
  COUNT(rev.id) as total_reviews,
  COUNT(CASE WHEN rev.would_recommend = true THEN 1 END) as recommend_count,
  (SELECT accepting_new_patients
   FROM provider_availability pa
   WHERE pa.provider_npi = p.provider_npi
   ORDER BY pa.updated_at DESC LIMIT 1) as latest_accepting_patients,
  (SELECT next_available_appointment
   FROM provider_availability pa
   WHERE pa.provider_npi = p.provider_npi
   ORDER BY pa.updated_at DESC LIMIT 1) as latest_next_appointment,
  (SELECT wait_time_estimate
   FROM provider_availability pa
   WHERE pa.provider_npi = p.provider_npi
   ORDER BY pa.updated_at DESC LIMIT 1) as latest_wait_time,
  COUNT(DISTINCT ins.insurance_name) as insurance_plans_count,
  GREATEST(
    MAX(r.updated_at),
    MAX(rev.updated_at),
    MAX(av.updated_at),
    MAX(ins.updated_at)
  ) as last_community_update
FROM (
  SELECT DISTINCT provider_npi FROM provider_ratings
  UNION SELECT DISTINCT provider_npi FROM provider_reviews
  UNION SELECT DISTINCT provider_npi FROM provider_availability
  UNION SELECT DISTINCT provider_npi FROM provider_insurance
) p
LEFT JOIN provider_ratings r ON p.provider_npi = r.provider_npi
LEFT JOIN provider_reviews rev ON p.provider_npi = rev.provider_npi
LEFT JOIN provider_availability av ON p.provider_npi = av.provider_npi
LEFT JOIN provider_insurance ins ON p.provider_npi = ins.provider_npi
GROUP BY p.provider_npi;


-- ============================================================
-- SETUP COMPLETE!
-- ============================================================
-- Your database is now ready with the following:
--
-- Tables:
--   - call_results      : AI call verification results
--   - favorites         : User favorite providers
--   - provider_ratings  : User ratings for providers
--   - provider_reviews  : User reviews for providers
--   - provider_availability : Community availability updates
--   - provider_insurance    : Community insurance info
--   - review_votes      : Helpful votes on reviews
--
-- Views:
--   - provider_summary  : Aggregated community data
--
-- All tables have:
--   - Row Level Security enabled
--   - Proper indexes for performance
--   - Auto-updating timestamps
--   - Appropriate RLS policies
-- ============================================================
