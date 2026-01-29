-- Create site_content table for storing editable page content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  draft_content JSONB
);

-- Create page_layouts table for storing component order and visibility
CREATE TABLE public.page_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  components JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  is_published BOOLEAN NOT NULL DEFAULT false,
  draft_components JSONB
);

-- Create site_themes table for storing color/typography settings
CREATE TABLE public.site_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_key TEXT NOT NULL UNIQUE DEFAULT 'default',
  colors JSONB NOT NULL DEFAULT '{}',
  typography JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- Create content_history table for version control
CREATE TABLE public.content_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  content JSONB NOT NULL,
  components JSONB,
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  change_description TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

-- Policies for site_content - Anyone can read published content
CREATE POLICY "Anyone can read published content"
  ON public.site_content FOR SELECT
  USING (is_published = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policies for page_layouts
CREATE POLICY "Anyone can read published layouts"
  ON public.page_layouts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage layouts"
  ON public.page_layouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policies for site_themes
CREATE POLICY "Anyone can read active themes"
  ON public.site_themes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage themes"
  ON public.site_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policies for content_history
CREATE POLICY "Admins can read content history"
  ON public.content_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert content history"
  ON public.content_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Insert default content for the home page
INSERT INTO public.site_content (page_key, content, is_published)
VALUES (
  'home',
  '{
    "hero": {
      "title": "MoodFlix",
      "subtitle": "Find the perfect movie for how you are feeling right now.",
      "badge": "AI-Powered Discovery",
      "cta": "Discover Now",
      "stats": {
        "movies": "500k+",
        "moods": "7",
        "picks": "∞"
      }
    },
    "moodSelector": {
      "title": "How are you feeling?",
      "resetText": "Reset mood"
    },
    "trending": {
      "title": "Discover",
      "tabs": ["Trending", "Top Rated", "Upcoming"]
    }
  }',
  true
);

-- Insert default layout for home page
INSERT INTO public.page_layouts (page_key, components, is_published)
VALUES (
  'home',
  '[
    {"id": "hero", "name": "Hero Section", "enabled": true, "order": 0},
    {"id": "carousel", "name": "Cinematic Carousel", "enabled": true, "order": 1},
    {"id": "tabs", "name": "Discovery Tabs", "enabled": true, "order": 2},
    {"id": "trending", "name": "Trending Section", "enabled": true, "order": 3},
    {"id": "moodSelector", "name": "Mood Selector", "enabled": true, "order": 4},
    {"id": "preferences", "name": "Preferences Form", "enabled": true, "order": 5},
    {"id": "recommendations", "name": "Movie Recommendations", "enabled": true, "order": 6}
  ]',
  true
);

-- Create function to save content with history
CREATE OR REPLACE FUNCTION public.save_site_content(
  p_page_key TEXT,
  p_content JSONB,
  p_user_id UUID,
  p_description TEXT DEFAULT NULL,
  p_publish BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_version INTEGER;
  v_result JSON;
BEGIN
  -- Get current version
  SELECT COALESCE(version, 0) INTO v_current_version
  FROM site_content
  WHERE page_key = p_page_key;

  IF v_current_version IS NULL THEN
    v_current_version := 0;
  END IF;

  -- Insert or update content
  INSERT INTO site_content (page_key, content, updated_by, version, is_published, draft_content)
  VALUES (
    p_page_key,
    CASE WHEN p_publish THEN p_content ELSE (SELECT content FROM site_content WHERE page_key = p_page_key) END,
    p_user_id,
    v_current_version + 1,
    COALESCE((SELECT is_published FROM site_content WHERE page_key = p_page_key), false) OR p_publish,
    CASE WHEN p_publish THEN NULL ELSE p_content END
  )
  ON CONFLICT (page_key) 
  DO UPDATE SET
    content = CASE WHEN p_publish THEN EXCLUDED.content ELSE site_content.content END,
    draft_content = CASE WHEN p_publish THEN NULL ELSE p_content END,
    updated_by = p_user_id,
    updated_at = now(),
    version = v_current_version + 1,
    is_published = site_content.is_published OR p_publish;

  -- Save to history
  INSERT INTO content_history (page_key, content, version, created_by, change_description)
  VALUES (p_page_key, p_content, v_current_version + 1, p_user_id, p_description);

  v_result := json_build_object(
    'success', true,
    'version', v_current_version + 1,
    'published', p_publish
  );

  RETURN v_result;
END;
$$;

-- Create function to save layout with history
CREATE OR REPLACE FUNCTION public.save_page_layout(
  p_page_key TEXT,
  p_components JSONB,
  p_user_id UUID,
  p_publish BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  INSERT INTO page_layouts (page_key, components, updated_by, is_published, draft_components)
  VALUES (
    p_page_key,
    CASE WHEN p_publish THEN p_components ELSE (SELECT components FROM page_layouts WHERE page_key = p_page_key) END,
    p_user_id,
    COALESCE((SELECT is_published FROM page_layouts WHERE page_key = p_page_key), false) OR p_publish,
    CASE WHEN p_publish THEN NULL ELSE p_components END
  )
  ON CONFLICT (page_key) 
  DO UPDATE SET
    components = CASE WHEN p_publish THEN EXCLUDED.components ELSE page_layouts.components END,
    draft_components = CASE WHEN p_publish THEN NULL ELSE p_components END,
    updated_by = p_user_id,
    updated_at = now(),
    is_published = page_layouts.is_published OR p_publish;

  -- Also save to content_history
  INSERT INTO content_history (page_key, components, version, created_by, change_description)
  VALUES (p_page_key, p_components, 1, p_user_id, 'Layout update');

  v_result := json_build_object('success', true, 'published', p_publish);
  RETURN v_result;
END;
$$;