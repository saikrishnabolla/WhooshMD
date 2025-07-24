-- Community Contributions Schema for Provider Information
-- This schema enables users to share ratings, reviews, availability, and insurance info

-- Provider Ratings Table
CREATE TABLE IF NOT EXISTS provider_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  wait_time_rating INTEGER CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Reviews Table
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

-- Provider Availability Updates Table
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  accepting_new_patients BOOLEAN,
  next_available_appointment DATE,
  appointment_types TEXT[], -- Array of appointment types available
  office_hours JSONB, -- Store flexible office hours data
  wait_time_estimate VARCHAR(50), -- e.g., "1-2 weeks", "same day", etc.
  notes TEXT,
  last_contacted_date DATE,
  contact_method VARCHAR(50), -- phone, website, in-person, etc.
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  verified_by_office BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Insurance Information Table
CREATE TABLE IF NOT EXISTS provider_insurance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_npi VARCHAR(10) NOT NULL,
  insurance_name VARCHAR(200) NOT NULL,
  insurance_type VARCHAR(100), -- medicaid, medicare, private, etc.
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

-- Review Helpfulness Votes Table
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  review_id UUID REFERENCES provider_reviews(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Contribution Summary View
CREATE OR REPLACE VIEW provider_summary AS
SELECT 
  p.provider_npi,
  -- Rating Statistics
  ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
  COUNT(r.rating) as total_ratings,
  ROUND(AVG(r.wait_time_rating)::numeric, 1) as avg_wait_time_rating,
  ROUND(AVG(r.communication_rating)::numeric, 1) as avg_communication_rating,
  ROUND(AVG(r.facility_rating)::numeric, 1) as avg_facility_rating,
  
  -- Review Statistics  
  COUNT(rev.id) as total_reviews,
  COUNT(CASE WHEN rev.would_recommend = true THEN 1 END) as recommend_count,
  
  -- Latest Availability Info
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
   
  -- Insurance Count
  COUNT(DISTINCT ins.insurance_name) as insurance_plans_count,
  
  -- Last Updated
  GREATEST(
    MAX(r.updated_at),
    MAX(rev.updated_at),
    MAX(av.updated_at),
    MAX(ins.updated_at)
  ) as last_community_update

FROM (SELECT DISTINCT provider_npi FROM provider_ratings 
      UNION SELECT DISTINCT provider_npi FROM provider_reviews
      UNION SELECT DISTINCT provider_npi FROM provider_availability  
      UNION SELECT DISTINCT provider_npi FROM provider_insurance) p
LEFT JOIN provider_ratings r ON p.provider_npi = r.provider_npi
LEFT JOIN provider_reviews rev ON p.provider_npi = rev.provider_npi
LEFT JOIN provider_availability av ON p.provider_npi = av.provider_npi
LEFT JOIN provider_insurance ins ON p.provider_npi = ins.provider_npi
GROUP BY p.provider_npi;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_provider_ratings_npi ON provider_ratings(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_user ON provider_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_rating ON provider_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_npi ON provider_reviews(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_user ON provider_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_date ON provider_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_reviews_recommend ON provider_reviews(would_recommend);

CREATE INDEX IF NOT EXISTS idx_provider_availability_npi ON provider_availability(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_availability_user ON provider_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_accepting ON provider_availability(accepting_new_patients);
CREATE INDEX IF NOT EXISTS idx_provider_availability_date ON provider_availability(updated_at);

CREATE INDEX IF NOT EXISTS idx_provider_insurance_npi ON provider_insurance(provider_npi);
CREATE INDEX IF NOT EXISTS idx_provider_insurance_user ON provider_insurance(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_insurance_name ON provider_insurance(insurance_name);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- Enable Row Level Security
ALTER TABLE provider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Ratings
CREATE POLICY "Anyone can view ratings" ON provider_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ratings" ON provider_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON provider_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON provider_ratings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reviews
CREATE POLICY "Anyone can view reviews" ON provider_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON provider_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON provider_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON provider_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Availability
CREATE POLICY "Anyone can view availability" ON provider_availability FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert availability" ON provider_availability FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own availability" ON provider_availability FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own availability" ON provider_availability FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Insurance
CREATE POLICY "Anyone can view insurance" ON provider_insurance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert insurance" ON provider_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insurance" ON provider_insurance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insurance" ON provider_insurance FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Review Votes
CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON review_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON review_votes FOR DELETE USING (auth.uid() = user_id);

-- Unique Constraints
ALTER TABLE provider_ratings ADD CONSTRAINT unique_user_provider_rating UNIQUE (user_id, provider_npi);
ALTER TABLE review_votes ADD CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id);

-- Functions for updating timestamps
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
      SELECT COUNT(*) 
      FROM review_votes 
      WHERE review_id = NEW.review_id AND is_helpful = true
    )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE provider_reviews 
    SET helpful_count = (
      SELECT COUNT(*) 
      FROM review_votes 
      WHERE review_id = OLD.review_id AND is_helpful = true
    )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_provider_ratings_updated_at
    BEFORE UPDATE ON provider_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_ratings_updated_at();

CREATE TRIGGER update_provider_reviews_updated_at
    BEFORE UPDATE ON provider_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_reviews_updated_at();

CREATE TRIGGER update_provider_availability_updated_at
    BEFORE UPDATE ON provider_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_availability_updated_at();

CREATE TRIGGER update_provider_insurance_updated_at
    BEFORE UPDATE ON provider_insurance
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_insurance_updated_at();

CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- Sample data insertion examples (commented out)
/*
-- Example rating
INSERT INTO provider_ratings (user_id, provider_npi, rating, wait_time_rating, communication_rating, facility_rating)
VALUES (auth.uid(), '1234567890', 5, 4, 5, 4);

-- Example review
INSERT INTO provider_reviews (user_id, provider_npi, review_text, visit_date, appointment_type, would_recommend)
VALUES (auth.uid(), '1234567890', 'Excellent doctor, very thorough and caring.', '2024-01-15', 'Annual Checkup', true);

-- Example availability
INSERT INTO provider_availability (user_id, provider_npi, accepting_new_patients, next_available_appointment, wait_time_estimate, last_contacted_date, contact_method, confidence_level)
VALUES (auth.uid(), '1234567890', true, '2024-02-15', '2-3 weeks', '2024-01-20', 'phone', 5);

-- Example insurance
INSERT INTO provider_insurance (user_id, provider_npi, insurance_name, insurance_type, is_in_network, verification_date, confidence_level)
VALUES (auth.uid(), '1234567890', 'Blue Cross Blue Shield', 'private', true, '2024-01-20', 5);
*/