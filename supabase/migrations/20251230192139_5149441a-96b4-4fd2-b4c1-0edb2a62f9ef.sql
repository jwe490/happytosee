-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  accent_color TEXT DEFAULT '#8B5CF6',
  favorite_genres TEXT[],
  preferred_languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create watch history table
CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rating NUMERIC,
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watch history" 
ON public.watch_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watch history" 
ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history" 
ON public.watch_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their watch history" 
ON public.watch_history FOR DELETE USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections are viewable by everyone" 
ON public.collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" 
ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Create collection_movies table
CREATE TABLE public.collection_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, movie_id)
);

ALTER TABLE public.collection_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection movies viewable if collection is viewable" 
ON public.collection_movies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.collections c 
    WHERE c.id = collection_id 
    AND (c.is_public = true OR c.user_id = auth.uid())
  )
);

CREATE POLICY "Users can add movies to their collections" 
ON public.collection_movies FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collections c 
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove movies from their collections" 
ON public.collection_movies FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.collections c 
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  )
);

-- Update watchlist to support public sharing
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create policy for public watchlists
CREATE POLICY "Public watchlists are viewable by everyone" 
ON public.watchlist FOR SELECT USING (is_public = true);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();