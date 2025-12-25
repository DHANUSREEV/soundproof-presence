-- Create urban type enum for DIGIPIN profiles
CREATE TYPE public.urban_type AS ENUM (
  'market', 'temple', 'residential', 'transport', 'hospital', 'school', 'commercial', 'quiet'
);

-- Create match type enum for validation logs
CREATE TYPE public.match_type AS ENUM ('exact', 'strong', 'weak', 'home_verified', 'candidates');

-- Create scene type enum
CREATE TYPE public.scene_type AS ENUM (
  'market', 'temple', 'residential', 'transport', 'hospital', 'school', 'commercial', 'quiet', 'unknown'
);

-- Table 1: Tamil Nadu DIGIPIN Profiles
CREATE TABLE public.tn_digipin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digipin_id VARCHAR(50) UNIQUE NOT NULL,
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(11,6) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  urban_type public.urban_type DEFAULT 'residential',
  characteristic_sounds TEXT[],
  embedding_512d FLOAT[],
  street VARCHAR(255),
  area VARCHAR(255),
  pincode VARCHAR(10),
  verification_count INT DEFAULT 0,
  avg_confidence FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tn_digipin_profiles
ALTER TABLE public.tn_digipin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for DIGIPIN profiles (reference data)
CREATE POLICY "Anyone can view DIGIPIN profiles"
ON public.tn_digipin_profiles
FOR SELECT
USING (true);

-- Table 2: User Home Profiles
CREATE TABLE public.user_home_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  home_digipin_id VARCHAR(50),
  raw_address TEXT NOT NULL,
  canonical_address TEXT,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  home_embeddings FLOAT[][],
  gps_lat DECIMAL(10,6),
  gps_lon DECIMAL(11,6),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_home_profiles
ALTER TABLE public.user_home_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own home profiles
CREATE POLICY "Users can view their own home profiles"
ON public.user_home_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own home profiles
CREATE POLICY "Users can insert their own home profiles"
ON public.user_home_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own home profiles
CREATE POLICY "Users can update their own home profiles"
ON public.user_home_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow anonymous verification (for unauthenticated users)
CREATE POLICY "Allow anonymous insert for verification"
ON public.user_home_profiles
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Table 3: Validation Logs (DHRUVA compliant)
CREATE TABLE public.validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  digipin_id VARCHAR(50),
  raw_address TEXT NOT NULL,
  verified_address TEXT,
  confidence FLOAT,
  match_type public.match_type,
  scene_type public.scene_type,
  audio_hash VARCHAR(64),
  validation_token VARCHAR(20) UNIQUE,
  device_id VARCHAR(100),
  ip_hash VARCHAR(64),
  processing_time_ms INT,
  candidates JSONB,
  selected_candidate_index INT,
  is_home_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on validation_logs
ALTER TABLE public.validation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own validation logs
CREATE POLICY "Users can view their own validation logs"
ON public.validation_logs
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow inserts for verification (both authenticated and anonymous)
CREATE POLICY "Allow verification log inserts"
ON public.validation_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_digipin_city ON public.tn_digipin_profiles(city);
CREATE INDEX idx_digipin_location ON public.tn_digipin_profiles(latitude, longitude);
CREATE INDEX idx_validation_token ON public.validation_logs(validation_token);
CREATE INDEX idx_validation_user ON public.validation_logs(user_id);
CREATE INDEX idx_home_user ON public.user_home_profiles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_tn_digipin_profiles_updated_at
BEFORE UPDATE ON public.tn_digipin_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_home_profiles_updated_at
BEFORE UPDATE ON public.user_home_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();