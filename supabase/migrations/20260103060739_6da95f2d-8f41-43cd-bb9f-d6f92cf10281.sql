-- Add mood column to collections table for sharing mood context
ALTER TABLE public.collections 
ADD COLUMN IF NOT EXISTS mood TEXT DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN public.collections.mood IS 'User mood when creating/updating collection (happy, sad, romantic, etc.)';