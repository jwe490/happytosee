/*
  # Enhanced Collections System with Sharing

  ## Overview
  This migration enhances the collections system to support sharing,
  collaboration, and better organization of watchlists.

  ## New Tables
  
  ### `collection_shares`
  - Enables sharing collections with other users or publicly
  - Supports different permission levels
  - Tracks share analytics
  - Columns:
    - `id` (uuid, primary key) - Unique identifier
    - `collection_id` (uuid) - Collection being shared
    - `share_token` (text, unique) - Public share token for URL sharing
    - `shared_by` (uuid) - User who created the share
    - `shared_with` (uuid, nullable) - Specific user shared with (null for public)
    - `permission_level` (text) - view, copy, collaborate
    - `expires_at` (timestamptz, nullable) - Optional expiration date
    - `view_count` (integer) - Number of times shared link was viewed
    - `copy_count` (integer) - Number of times collection was copied
    - `created_at` (timestamptz) - When share was created

  ### `collection_collaborators`
  - Tracks users who can edit a shared collection
  - Different from shares - these are persistent collaborators
  - Columns:
    - `id` (uuid, primary key) - Unique identifier
    - `collection_id` (uuid) - Collection being collaborated on
    - `user_id` (uuid) - Collaborator user
    - `permission` (text) - can_add, can_remove, can_edit (metadata)
    - `added_by` (uuid) - User who added this collaborator
    - `added_at` (timestamptz) - When collaborator was added

  ### `collection_activities`
  - Activity log for collections
  - Tracks adds, removes, and edits
  - Columns:
    - `id` (uuid, primary key) - Unique identifier
    - `collection_id` (uuid) - Collection where activity occurred
    - `user_id` (uuid) - User who performed the action
    - `action_type` (text) - added_movie, removed_movie, updated_collection
    - `movie_id` (integer, nullable) - Movie involved in action
    - `movie_title` (text, nullable) - Movie title for reference
    - `details` (jsonb) - Additional action details
    - `created_at` (timestamptz) - When action occurred

  ## Modified Tables
  
  ### `collections`
  - Added `cover_image` (text) - Custom cover image URL
  - Added `color_theme` (text) - Color theme for collection
  - Added `movie_count` (integer) - Cached count of movies
  - Added `share_count` (integer) - Number of times shared
  - Added `is_collaborative` (boolean) - Allow multiple editors

  ### `collection_movies`
  - Added `added_by` (uuid) - User who added the movie
  - Added `notes` (text) - Personal notes about why movie was added
  - Added `priority` (integer) - Priority/order within collection

  ## Security
  - All tables have RLS enabled
  - Users can:
    - Create and manage their own collections
    - View public collections
    - View collections shared with them
    - Collaborate on collections they have permission for
  - Share tokens are unique and used for public access

  ## Performance
  - Indexes on foreign keys
  - Indexes on share_token for fast public lookups
  - Cached counts to avoid expensive queries
*/

-- Add new columns to collections table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE collections ADD COLUMN cover_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'color_theme'
  ) THEN
    ALTER TABLE collections ADD COLUMN color_theme text DEFAULT '#8B5CF6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'movie_count'
  ) THEN
    ALTER TABLE collections ADD COLUMN movie_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'share_count'
  ) THEN
    ALTER TABLE collections ADD COLUMN share_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'is_collaborative'
  ) THEN
    ALTER TABLE collections ADD COLUMN is_collaborative boolean DEFAULT false;
  END IF;
END $$;

-- Add new columns to collection_movies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collection_movies' AND column_name = 'added_by'
  ) THEN
    ALTER TABLE collection_movies ADD COLUMN added_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collection_movies' AND column_name = 'notes'
  ) THEN
    ALTER TABLE collection_movies ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collection_movies' AND column_name = 'priority'
  ) THEN
    ALTER TABLE collection_movies ADD COLUMN priority integer DEFAULT 0;
  END IF;
END $$;

-- Create collection_shares table
CREATE TABLE IF NOT EXISTS collection_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level text NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'copy', 'collaborate')),
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  copy_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collection_shares ENABLE ROW LEVEL SECURITY;

-- Create collection_collaborators table
CREATE TABLE IF NOT EXISTS collection_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL DEFAULT 'can_add' CHECK (permission IN ('can_add', 'can_remove', 'can_edit')),
  added_by uuid NOT NULL REFERENCES auth.users(id),
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, user_id)
);

ALTER TABLE collection_collaborators ENABLE ROW LEVEL SECURITY;

-- Create collection_activities table
CREATE TABLE IF NOT EXISTS collection_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('added_movie', 'removed_movie', 'updated_collection', 'added_collaborator', 'removed_collaborator')),
  movie_id integer,
  movie_title text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collection_shares_collection_id ON collection_shares(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_shares_share_token ON collection_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_collection_shares_shared_with ON collection_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_collection_collaborators_collection_id ON collection_collaborators(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_collaborators_user_id ON collection_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_activities_collection_id ON collection_activities(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_movies_added_by ON collection_movies(added_by);

-- RLS Policies for collection_shares

-- Users can read shares they created or shares shared with them or public shares
CREATE POLICY "Users can read relevant shares"
  ON collection_shares FOR SELECT
  USING (
    auth.uid() = shared_by OR
    auth.uid() = shared_with OR
    (shared_with IS NULL AND (expires_at IS NULL OR expires_at > now()))
  );

-- Users can create shares for their own collections
CREATE POLICY "Users can create shares for own collections"
  ON collection_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM collections WHERE id = collection_id
    )
  );

-- Users can update their own shares
CREATE POLICY "Users can update own shares"
  ON collection_shares FOR UPDATE
  TO authenticated
  USING (auth.uid() = shared_by)
  WITH CHECK (auth.uid() = shared_by);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON collection_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = shared_by);

-- RLS Policies for collection_collaborators

-- Users can read collaborators for collections they own or collaborate on
CREATE POLICY "Users can read relevant collaborators"
  ON collection_collaborators FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM collections WHERE id = collection_id
      UNION
      SELECT user_id FROM collection_collaborators WHERE collection_id = collection_collaborators.collection_id
    )
  );

-- Collection owners can add collaborators
CREATE POLICY "Owners can add collaborators"
  ON collection_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM collections WHERE id = collection_id
    )
  );

-- Collection owners can remove collaborators
CREATE POLICY "Owners can remove collaborators"
  ON collection_collaborators FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM collections WHERE id = collection_id
    )
  );

-- RLS Policies for collection_activities

-- Users can read activities for collections they have access to
CREATE POLICY "Users can read accessible collection activities"
  ON collection_activities FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM collections WHERE id = collection_id
      UNION
      SELECT user_id FROM collection_collaborators WHERE collection_id = collection_activities.collection_id
    ) OR
    EXISTS (
      SELECT 1 FROM collections WHERE id = collection_id AND is_public = true
    )
  );

-- System can create activities (via triggers)
CREATE POLICY "System can create activities"
  ON collection_activities FOR INSERT
  WITH CHECK (true);

-- Function to update movie count on collections
CREATE OR REPLACE FUNCTION update_collection_movie_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE collections
    SET movie_count = movie_count + 1
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE collections
    SET movie_count = GREATEST(0, movie_count - 1)
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for movie count
DROP TRIGGER IF EXISTS trigger_update_collection_movie_count ON collection_movies;
CREATE TRIGGER trigger_update_collection_movie_count
AFTER INSERT OR DELETE ON collection_movies
FOR EACH ROW EXECUTE FUNCTION update_collection_movie_count();

-- Function to log collection activities
CREATE OR REPLACE FUNCTION log_collection_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO collection_activities (collection_id, user_id, action_type, movie_id, movie_title)
    VALUES (NEW.collection_id, COALESCE(NEW.added_by, auth.uid()), 'added_movie', NEW.movie_id, NEW.title);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO collection_activities (collection_id, user_id, action_type, movie_id, movie_title)
    VALUES (OLD.collection_id, auth.uid(), 'removed_movie', OLD.movie_id, OLD.title);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for activity logging
DROP TRIGGER IF EXISTS trigger_log_collection_activity ON collection_movies;
CREATE TRIGGER trigger_log_collection_activity
AFTER INSERT OR DELETE ON collection_movies
FOR EACH ROW EXECUTE FUNCTION log_collection_activity();

-- Update existing collections to have default values
UPDATE collections
SET movie_count = (
  SELECT COUNT(*)
  FROM collection_movies
  WHERE collection_movies.collection_id = collections.id
)
WHERE movie_count = 0;