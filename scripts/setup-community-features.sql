-- Community Features Setup Script
-- Run this in your Supabase SQL Editor to set up community features

-- First, check if tables exist and create them if they don't
DO $$
BEGIN
    -- Create provider_ratings table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_ratings') THEN
        CREATE TABLE provider_ratings (
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
        
        -- Enable RLS and create policies
        ALTER TABLE provider_ratings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view ratings" ON provider_ratings FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert ratings" ON provider_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own ratings" ON provider_ratings FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own ratings" ON provider_ratings FOR DELETE USING (auth.uid() = user_id);
        
        -- Add unique constraint
        ALTER TABLE provider_ratings ADD CONSTRAINT unique_user_provider_rating UNIQUE (user_id, provider_npi);
        
        -- Create indexes
        CREATE INDEX idx_provider_ratings_npi ON provider_ratings(provider_npi);
        CREATE INDEX idx_provider_ratings_user ON provider_ratings(user_id);
        
        RAISE NOTICE 'Created provider_ratings table';
    END IF;

    -- Create provider_reviews table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_reviews') THEN
        CREATE TABLE provider_reviews (
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
        
        -- Enable RLS and create policies
        ALTER TABLE provider_reviews ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view reviews" ON provider_reviews FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert reviews" ON provider_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own reviews" ON provider_reviews FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own reviews" ON provider_reviews FOR DELETE USING (auth.uid() = user_id);
        
        -- Create indexes
        CREATE INDEX idx_provider_reviews_npi ON provider_reviews(provider_npi);
        CREATE INDEX idx_provider_reviews_user ON provider_reviews(user_id);
        
        RAISE NOTICE 'Created provider_reviews table';
    END IF;

    -- Create provider_availability table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_availability') THEN
        CREATE TABLE provider_availability (
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
        
        -- Enable RLS and create policies
        ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view availability" ON provider_availability FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert availability" ON provider_availability FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own availability" ON provider_availability FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own availability" ON provider_availability FOR DELETE USING (auth.uid() = user_id);
        
        -- Create indexes
        CREATE INDEX idx_provider_availability_npi ON provider_availability(provider_npi);
        CREATE INDEX idx_provider_availability_user ON provider_availability(user_id);
        
        RAISE NOTICE 'Created provider_availability table';
    END IF;

    -- Create provider_insurance table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_insurance') THEN
        CREATE TABLE provider_insurance (
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
        
        -- Enable RLS and create policies
        ALTER TABLE provider_insurance ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view insurance" ON provider_insurance FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert insurance" ON provider_insurance FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own insurance" ON provider_insurance FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own insurance" ON provider_insurance FOR DELETE USING (auth.uid() = user_id);
        
        -- Create indexes
        CREATE INDEX idx_provider_insurance_npi ON provider_insurance(provider_npi);
        CREATE INDEX idx_provider_insurance_user ON provider_insurance(user_id);
        
        RAISE NOTICE 'Created provider_insurance table';
    END IF;

    -- Create review_votes table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'review_votes') THEN
        CREATE TABLE review_votes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            review_id UUID REFERENCES provider_reviews(id) ON DELETE CASCADE,
            is_helpful BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS and create policies
        ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view votes" ON review_votes FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can vote" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own votes" ON review_votes FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own votes" ON review_votes FOR DELETE USING (auth.uid() = user_id);
        
        -- Add unique constraint and indexes
        ALTER TABLE review_votes ADD CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id);
        CREATE INDEX idx_review_votes_review ON review_votes(review_id);
        CREATE INDEX idx_review_votes_user ON review_votes(user_id);
        
        RAISE NOTICE 'Created review_votes table';
    END IF;
END $$;

-- Create or replace the provider_summary view
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

-- Create helper functions for updating timestamps
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

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_provider_ratings_updated_at') THEN
        CREATE TRIGGER update_provider_ratings_updated_at
            BEFORE UPDATE ON provider_ratings
            FOR EACH ROW
            EXECUTE FUNCTION update_provider_ratings_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_provider_reviews_updated_at') THEN
        CREATE TRIGGER update_provider_reviews_updated_at
            BEFORE UPDATE ON provider_reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_provider_reviews_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_provider_availability_updated_at') THEN
        CREATE TRIGGER update_provider_availability_updated_at
            BEFORE UPDATE ON provider_availability
            FOR EACH ROW
            EXECUTE FUNCTION update_provider_availability_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_provider_insurance_updated_at') THEN
        CREATE TRIGGER update_provider_insurance_updated_at
            BEFORE UPDATE ON provider_insurance
            FOR EACH ROW
            EXECUTE FUNCTION update_provider_insurance_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_review_helpful_count_trigger') THEN
        CREATE TRIGGER update_review_helpful_count_trigger
            AFTER INSERT OR UPDATE OR DELETE ON review_votes
            FOR EACH ROW
            EXECUTE FUNCTION update_review_helpful_count();
    END IF;
END $$;

-- Create a simple function to test if community features are working
CREATE OR REPLACE FUNCTION test_community_features()
RETURNS TEXT AS $$
BEGIN
    -- Test if all tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_ratings') THEN
        RETURN 'ERROR: provider_ratings table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_reviews') THEN
        RETURN 'ERROR: provider_reviews table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_availability') THEN
        RETURN 'ERROR: provider_availability table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'provider_insurance') THEN
        RETURN 'ERROR: provider_insurance table does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'provider_summary') THEN
        RETURN 'ERROR: provider_summary view does not exist';
    END IF;
    
    RETURN 'SUCCESS: All community features are properly set up!';
END;
$$ language 'plpgsql';

-- Test the setup
SELECT test_community_features();