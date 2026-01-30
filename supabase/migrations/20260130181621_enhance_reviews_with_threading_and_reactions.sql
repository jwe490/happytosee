/*
  # Enhanced Review System with Threading and Reactions

  ## Overview
  This migration enhances the reviews system to support threaded conversations,
  social interactions, and better engagement features.

  ## New Tables
  
  ### `review_replies`
  - Enables threaded discussions on reviews
  - Supports nested conversations (replies to replies)
  - Tracks reply hierarchy and timestamps
  - Columns:
    - `id` (uuid, primary key) - Unique identifier for each reply
    - `review_id` (uuid) - Parent review being replied to
    - `parent_reply_id` (uuid, nullable) - Parent reply for nested conversations
    - `user_id` (uuid) - User who wrote the reply
    - `reply_text` (text) - Content of the reply
    - `created_at` (timestamptz) - When reply was created
    - `updated_at` (timestamptz) - When reply was last updated
    - `is_edited` (boolean) - Flag if reply has been edited

  ### `review_reactions`
  - Tracks user reactions to reviews (helpful, insightful, funny, etc.)
  - Prevents duplicate reactions from same user
  - Columns:
    - `id` (uuid, primary key) - Unique identifier
    - `review_id` (uuid) - Review being reacted to
    - `user_id` (uuid) - User giving the reaction
    - `reaction_type` (text) - Type of reaction (helpful, insightful, funny, agree, disagree)
    - `created_at` (timestamptz) - When reaction was given

  ### `reply_reactions`
  - Similar to review_reactions but for replies
  - Enables users to react to individual replies
  - Same structure as review_reactions

  ## Modified Tables
  
  ### `reviews`
  - Added `is_spoiler` (boolean) - Mark reviews containing spoilers
  - Added `helpful_count` (integer) - Cached count of helpful reactions
  - Added `reply_count` (integer) - Cached count of replies
  - Added `is_edited` (boolean) - Track if review was edited after posting

  ## Security
  - All tables have RLS enabled
  - Users can:
    - Create their own reviews, replies, and reactions
    - Read all public reviews and replies
    - Update/delete only their own content
    - React once per review/reply
  - Authenticated users only can create content

  ## Performance
  - Indexes on foreign keys for fast lookups
  - Indexes on user_id for user-specific queries
  - Cached counts to avoid expensive aggregations
  - Composite unique constraints to prevent duplicate reactions
*/

-- Add new columns to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'is_spoiler'
  ) THEN
    ALTER TABLE reviews ADD COLUMN is_spoiler boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'helpful_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN helpful_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'reply_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN reply_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'is_edited'
  ) THEN
    ALTER TABLE reviews ADD COLUMN is_edited boolean DEFAULT false;
  END IF;
END $$;

-- Create review_replies table
CREATE TABLE IF NOT EXISTS review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES review_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_edited boolean DEFAULT false
);

ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

-- Create review_reactions table
CREATE TABLE IF NOT EXISTS review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('helpful', 'insightful', 'funny', 'agree', 'disagree')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id, reaction_type)
);

ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;

-- Create reply_reactions table
CREATE TABLE IF NOT EXISTS reply_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid NOT NULL REFERENCES review_replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'insightful')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(reply_id, user_id, reaction_type)
);

ALTER TABLE reply_reactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_parent_reply_id ON review_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_user_id ON review_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_review_id ON review_reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user_id ON review_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_reactions_reply_id ON reply_reactions(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_reactions_user_id ON reply_reactions(user_id);

-- RLS Policies for review_replies

-- Anyone can read replies
CREATE POLICY "Anyone can read review replies"
  ON review_replies FOR SELECT
  USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies"
  ON review_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own replies
CREATE POLICY "Users can update own replies"
  ON review_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete own replies"
  ON review_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for review_reactions

-- Anyone can read reactions
CREATE POLICY "Anyone can read review reactions"
  ON review_reactions FOR SELECT
  USING (true);

-- Authenticated users can create reactions
CREATE POLICY "Authenticated users can create review reactions"
  ON review_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own review reactions"
  ON review_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reply_reactions

-- Anyone can read reply reactions
CREATE POLICY "Anyone can read reply reactions"
  ON reply_reactions FOR SELECT
  USING (true);

-- Authenticated users can create reply reactions
CREATE POLICY "Authenticated users can create reply reactions"
  ON reply_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reply reactions
CREATE POLICY "Users can delete own reply reactions"
  ON reply_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update reply count on reviews
CREATE OR REPLACE FUNCTION update_review_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE reviews
    SET reply_count = reply_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE reviews
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reply count
DROP TRIGGER IF EXISTS trigger_update_review_reply_count ON review_replies;
CREATE TRIGGER trigger_update_review_reply_count
AFTER INSERT OR DELETE ON review_replies
FOR EACH ROW EXECUTE FUNCTION update_review_reply_count();

-- Function to update helpful count on reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.reaction_type = 'helpful') THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.reaction_type = 'helpful') THEN
    UPDATE reviews
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_reactions;
CREATE TRIGGER trigger_update_review_helpful_count
AFTER INSERT OR DELETE ON review_reactions
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();