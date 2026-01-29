import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteTheme {
  id: string;
  theme_key: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    bodyWeight: number;
  };
  is_active: boolean;
}

export interface PageSection {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface PageLayout {
  id: string;
  page_key: string;
  components: PageSection[];
  is_published: boolean;
}

export interface SiteContent {
  id: string;
  page_key: string;
  content: {
    hero?: {
      title: string;
      subtitle: string;
      ctaText: string;
    };
    about?: {
      description: string;
    };
    [key: string]: any;
  };
  is_published: boolean;
  version: number;
}

export function useSiteEditor() {
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current theme and layout
  const fetchSiteData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch active theme
      const { data: themeData, error: themeError } = await supabase
        .from("site_themes")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (themeError && themeError.code !== "PGRST116") throw themeError;
      
      if (themeData) {
        setTheme(themeData as unknown as SiteTheme);
      } else {
        // Default theme
        setTheme({
          id: "default",
          theme_key: "default",
          colors: {
            primary: "263 70% 58%",
            secondary: "220 14% 96%",
            accent: "339 90% 51%",
            background: "0 0% 100%",
            foreground: "224 71% 4%",
            muted: "220 14% 96%",
            card: "0 0% 100%",
            border: "220 13% 91%",
          },
          typography: {
            headingFont: "Space Grotesk",
            bodyFont: "Plus Jakarta Sans",
            headingWeight: 700,
            bodyWeight: 400,
          },
          is_active: true,
        });
      }

      // Fetch page layout
      const { data: layoutData, error: layoutError } = await supabase
        .from("page_layouts")
        .select("*")
        .eq("page_key", "home")
        .maybeSingle();

      if (layoutError && layoutError.code !== "PGRST116") throw layoutError;
      
      if (layoutData) {
        setLayout(layoutData as unknown as PageLayout);
      } else {
        // Default layout
        setLayout({
          id: "default",
          page_key: "home",
          components: [
            { id: "hero", type: "hero", name: "Hero Section", enabled: true, order: 0, settings: {} },
            { id: "mood-selector", type: "mood-selector", name: "Mood Selector", enabled: true, order: 1, settings: {} },
            { id: "trending", type: "trending", name: "Trending Movies", enabled: true, order: 2, settings: {} },
            { id: "discovery", type: "discovery", name: "Discovery Section", enabled: true, order: 3, settings: {} },
          ],
          is_published: true,
        });
      }

      // Fetch site content
      const { data: contentData, error: contentError } = await supabase
        .from("site_content")
        .select("*")
        .eq("page_key", "home")
        .maybeSingle();

      if (contentError && contentError.code !== "PGRST116") throw contentError;
      
      if (contentData) {
        setContent(contentData as unknown as SiteContent);
      }

    } catch (error) {
      console.error("Error fetching site data:", error);
      toast.error("Failed to load site data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  // Update theme colors
  const updateThemeColor = useCallback((colorKey: string, value: string) => {
    if (!theme) return;
    
    setTheme(prev => ({
      ...prev!,
      colors: {
        ...prev!.colors,
        [colorKey]: value,
      },
    }));
    setHasUnsavedChanges(true);

    // Apply to CSS variables for live preview
    document.documentElement.style.setProperty(`--${colorKey}`, value);
  }, [theme]);

  // Update typography
  const updateTypography = useCallback((key: string, value: string | number) => {
    if (!theme) return;
    
    setTheme(prev => ({
      ...prev!,
      typography: {
        ...prev!.typography,
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  }, [theme]);

  // Reorder sections
  const reorderSections = useCallback((sections: PageSection[]) => {
    if (!layout) return;
    
    setLayout(prev => ({
      ...prev!,
      components: sections.map((s, i) => ({ ...s, order: i })),
    }));
    setHasUnsavedChanges(true);
  }, [layout]);

  // Toggle section visibility
  const toggleSection = useCallback((sectionId: string) => {
    if (!layout) return;
    
    setLayout(prev => ({
      ...prev!,
      components: prev!.components.map(c =>
        c.id === sectionId ? { ...c, enabled: !c.enabled } : c
      ),
    }));
    setHasUnsavedChanges(true);
  }, [layout]);

  // Update section settings
  const updateSectionSettings = useCallback((sectionId: string, settings: Record<string, any>) => {
    if (!layout) return;
    
    setLayout(prev => ({
      ...prev!,
      components: prev!.components.map(c =>
        c.id === sectionId ? { ...c, settings: { ...c.settings, ...settings } } : c
      ),
    }));
    setHasUnsavedChanges(true);
  }, [layout]);

  // Save all changes
  const saveChanges = useCallback(async (publish = false) => {
    setIsSaving(true);
    try {
      // Save theme
      if (theme && theme.id !== "default") {
        const { error: themeError } = await supabase
          .from("site_themes")
          .upsert({
            ...theme,
            updated_at: new Date().toISOString(),
          });

        if (themeError) throw themeError;
      } else if (theme) {
        // Insert new theme
        const { data: newTheme, error: insertError } = await supabase
          .from("site_themes")
          .insert({
            theme_key: "custom",
            colors: theme.colors,
            typography: theme.typography,
            is_active: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newTheme) setTheme(newTheme as unknown as SiteTheme);
      }

      // Save layout
      if (layout) {
        const { error: layoutError } = await supabase.rpc("save_page_layout", {
          p_page_key: layout.page_key,
          p_components: layout.components as unknown as Record<string, any>,
          p_publish: publish,
          p_user_id: "admin",
        });

        if (layoutError) throw layoutError;
      }

      setHasUnsavedChanges(false);
      toast.success(publish ? "Changes published!" : "Draft saved!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [theme, layout]);

  // Revert changes
  const revertChanges = useCallback(() => {
    fetchSiteData();
    setHasUnsavedChanges(false);
    
    // Reset CSS variables
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--secondary");
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--foreground");
    
    toast.info("Changes reverted");
  }, [fetchSiteData]);

  return {
    theme,
    layout,
    content,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    previewMode,
    setPreviewMode,
    updateThemeColor,
    updateTypography,
    reorderSections,
    toggleSection,
    updateSectionSettings,
    saveChanges,
    revertChanges,
    refetch: fetchSiteData,
  };
}
