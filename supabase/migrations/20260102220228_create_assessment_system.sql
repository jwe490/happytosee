/*
  # Movie Mood Board Assessment System

  ## New Tables
  
  ### `personality_archetypes`
  - Stores the 8 personality archetype definitions
  - Fields: id, name, description, color_scheme, traits, icon, animation_config
  
  ### `assessment_questions`
  - Stores assessment questions with branching logic
  - Fields: id, question_text, question_type, options, dimension_weights, order_index
  
  ### `user_assessments`
  - Stores completed assessments and results
  - Fields: id, user_id, archetype_id, dimension_scores, completed_at, share_count
  
  ### `assessment_responses`
  - Stores individual question responses
  - Fields: id, assessment_id, question_id, selected_option, response_time
  
  ### `mood_board_shares`
  - Tracks sharing events
  - Fields: id, assessment_id, platform, shared_at, unique_share_id, views
  
  ### `referrals`
  - Tracks referral conversions
  - Fields: id, referrer_user_id, referred_user_id, share_id, converted_at, status
  
  ### `achievements`
  - Stores achievement badges
  - Fields: id, user_id, achievement_type, unlocked_at, metadata
  
  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Users can create their own assessments
  - Public read access for shared mood boards
*/

-- Personality Archetypes Table
CREATE TABLE IF NOT EXISTS personality_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  color_scheme jsonb NOT NULL DEFAULT '[]',
  traits jsonb NOT NULL DEFAULT '[]',
  icon text,
  animation_config jsonb DEFAULT '{}',
  dimension_ranges jsonb NOT NULL DEFAULT '{}',
  random_thoughts jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]',
  dimension_weights jsonb NOT NULL DEFAULT '{}',
  visual_content jsonb DEFAULT '{}',
  branching_logic jsonb DEFAULT '{}',
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Assessments Table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_id uuid REFERENCES personality_archetypes(id),
  dimension_scores jsonb NOT NULL DEFAULT '{}',
  stats jsonb DEFAULT '{}',
  random_thought text,
  badges jsonb DEFAULT '[]',
  completed_at timestamptz DEFAULT now(),
  share_count integer DEFAULT 0,
  retake_count integer DEFAULT 0
);

-- Assessment Responses Table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES user_assessments(id) ON DELETE CASCADE,
  question_id uuid REFERENCES assessment_questions(id),
  selected_option text NOT NULL,
  response_time integer,
  created_at timestamptz DEFAULT now()
);

-- Mood Board Shares Table
CREATE TABLE IF NOT EXISTS mood_board_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES user_assessments(id) ON DELETE CASCADE,
  platform text NOT NULL,
  shared_at timestamptz DEFAULT now(),
  unique_share_id text UNIQUE NOT NULL,
  views integer DEFAULT 0,
  conversions integer DEFAULT 0
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  share_id uuid REFERENCES mood_board_shares(id),
  converted_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  icon text,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE personality_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_board_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personality_archetypes (public read)
CREATE POLICY "Anyone can view archetypes"
  ON personality_archetypes
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for assessment_questions (public read active questions)
CREATE POLICY "Anyone can view active questions"
  ON assessment_questions
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for user_assessments
CREATE POLICY "Users can view own assessments"
  ON user_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON user_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON user_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for assessment_responses
CREATE POLICY "Users can view own responses"
  ON assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = assessment_responses.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own responses"
  ON assessment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = assessment_responses.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- RLS Policies for mood_board_shares
CREATE POLICY "Users can view own shares"
  ON mood_board_shares
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = mood_board_shares.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view shares by share_id"
  ON mood_board_shares
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create shares"
  ON mood_board_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = mood_board_shares.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shares"
  ON mood_board_shares
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = mood_board_shares.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = mood_board_shares.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = referrer_user_id OR auth.uid() = referred_user_id
  );

CREATE POLICY "System can create referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_archetype_id ON user_assessments(archetype_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_mood_board_shares_assessment_id ON mood_board_shares(assessment_id);
CREATE INDEX IF NOT EXISTS idx_mood_board_shares_unique_share_id ON mood_board_shares(unique_share_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
