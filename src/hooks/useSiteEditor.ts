import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useKeyAuth } from "./useKeyAuth";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface PageComponent {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface SiteContent {
  hero?: {
    title: string;
    subtitle: string;
    badge: string;
    cta: string;
    stats: {
      movies: string;
      moods: string;
      picks: string;
    };
  };
  moodSelector?: {
    title: string;
    resetText: string;
  };
  trending?: {
    title: string;
    tabs: string[];
  };
  [key: string]: unknown; // Index signature for Json compatibility
}

export interface ContentHistory {
  id: string;
  page_key: string;
  content: SiteContent;
  components?: PageComponent[];
  version: number;
  created_at: string;
  created_by: string | null;
  change_description: string | null;
}

export function useSiteEditor(pageKey: string = "home") {
  const { user } = useKeyAuth();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [draftContent, setDraftContent] = useState<SiteContent | null>(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [draftComponents, setDraftComponents] = useState<PageComponent[] | null>(null);
  const [history, setHistory] = useState<ContentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch content and layout
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch content
      const { data: contentData, error: contentError } = await supabase
        .from("site_content")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (contentError && contentError.code !== "PGRST116") {
        console.error("Error fetching content:", contentError);
      }

      if (contentData) {
        setContent(contentData.content as unknown as SiteContent);
        setDraftContent((contentData.draft_content || contentData.content) as unknown as SiteContent);
      }

      // Fetch layout
      const { data: layoutData, error: layoutError } = await supabase
        .from("page_layouts")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();

      if (layoutError && layoutError.code !== "PGRST116") {
        console.error("Error fetching layout:", layoutError);
      }

      if (layoutData) {
        const comps = layoutData.components as unknown as PageComponent[];
        setComponents(comps);
        setDraftComponents((layoutData.draft_components || layoutData.components) as unknown as PageComponent[]);
      }

      // Fetch history
      const { data: historyData } = await supabase
        .from("content_history")
        .select("*")
        .eq("page_key", pageKey)
        .order("created_at", { ascending: false })
        .limit(20);

      if (historyData) {
        setHistory(historyData.map(item => ({
          ...item,
          content: item.content as unknown as SiteContent,
          components: item.components as unknown as PageComponent[] | undefined,
        })));
      }
    } catch (error) {
      console.error("Error in fetchContent:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Update draft content
  const updateDraftContent = useCallback((updates: Partial<SiteContent>) => {
    setDraftContent(prev => {
      const newContent = { ...prev, ...updates };
      setHasChanges(true);
      return newContent;
    });
  }, []);

  // Update component order
  const reorderComponents = useCallback((newOrder: PageComponent[]) => {
    setDraftComponents(newOrder.map((c, i) => ({ ...c, order: i })));
    setHasChanges(true);
  }, []);

  // Toggle component visibility
  const toggleComponent = useCallback((componentId: string) => {
    setDraftComponents(prev => {
      if (!prev) return prev;
      return prev.map(c => 
        c.id === componentId ? { ...c, enabled: !c.enabled } : c
      );
    });
    setHasChanges(true);
  }, []);

  // Save as draft
  const saveDraft = useCallback(async (description?: string) => {
    if (!user) {
      toast.error("You must be logged in to save");
      return false;
    }

    setIsSaving(true);
    try {
      // Save content draft
      if (draftContent) {
        const { error: contentError } = await supabase.rpc("save_site_content", {
          p_page_key: pageKey,
          p_content: draftContent as unknown as Json,
          p_user_id: user.id,
          p_description: description || "Draft saved",
          p_publish: false,
        });

        if (contentError) {
          console.error("Error saving content:", contentError);
          throw contentError;
        }
      }

      // Save layout draft
      if (draftComponents) {
        const { error: layoutError } = await supabase.rpc("save_page_layout", {
          p_page_key: pageKey,
          p_components: draftComponents as unknown as Json,
          p_user_id: user.id,
          p_publish: false,
        });

        if (layoutError) {
          console.error("Error saving layout:", layoutError);
          throw layoutError;
        }
      }

      toast.success("Draft saved");
      setHasChanges(false);
      await fetchContent();
      return true;
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, pageKey, draftContent, draftComponents, fetchContent]);

  // Publish changes
  const publish = useCallback(async (description?: string) => {
    if (!user) {
      toast.error("You must be logged in to publish");
      return false;
    }

    setIsSaving(true);
    try {
      // Publish content
      if (draftContent) {
        const { error: contentError } = await supabase.rpc("save_site_content", {
          p_page_key: pageKey,
          p_content: draftContent as unknown as Json,
          p_user_id: user.id,
          p_description: description || "Published",
          p_publish: true,
        });

        if (contentError) throw contentError;
      }

      // Publish layout
      if (draftComponents) {
        const { error: layoutError } = await supabase.rpc("save_page_layout", {
          p_page_key: pageKey,
          p_components: draftComponents as unknown as Json,
          p_user_id: user.id,
          p_publish: true,
        });

        if (layoutError) throw layoutError;
      }

      toast.success("Changes published!");
      setHasChanges(false);
      await fetchContent();
      return true;
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish changes");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, pageKey, draftContent, draftComponents, fetchContent]);

  // Restore from history
  const restoreVersion = useCallback(async (historyItem: ContentHistory) => {
    setDraftContent(historyItem.content);
    if (historyItem.components) {
      setDraftComponents(historyItem.components);
    }
    setHasChanges(true);
    toast.success(`Restored to version ${historyItem.version}`);
  }, []);

  // Discard changes
  const discardChanges = useCallback(() => {
    setDraftContent(content);
    setDraftComponents(components);
    setHasChanges(false);
    toast.info("Changes discarded");
  }, [content, components]);

  return {
    content,
    draftContent,
    components,
    draftComponents: draftComponents || components,
    history,
    isLoading,
    isSaving,
    hasChanges,
    updateDraftContent,
    reorderComponents,
    toggleComponent,
    saveDraft,
    publish,
    restoreVersion,
    discardChanges,
    refetch: fetchContent,
  };
}
