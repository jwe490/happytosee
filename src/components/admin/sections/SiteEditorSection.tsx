import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  GripVertical, 
  Save, 
  Upload, 
  History, 
  Undo2,
  Monitor,
  Smartphone,
  Tablet,
  Edit3,
  Type,
  Palette,
  Layout,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSiteEditor, PageComponent, SiteContent } from "@/hooks/useSiteEditor";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type PreviewMode = "desktop" | "tablet" | "mobile";

interface ComponentCardProps {
  component: PageComponent;
  onToggle: () => void;
}

function ComponentCard({ component, onToggle }: ComponentCardProps) {
  return (
    <Reorder.Item
      value={component}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
          component.enabled 
            ? "border-border" 
            : "border-dashed border-muted-foreground/30 opacity-60"
        )}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            !component.enabled && "line-through text-muted-foreground"
          )}>
            {component.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {component.enabled ? "Visible" : "Hidden"}
          </p>
        </div>
        
        <Switch
          checked={component.enabled}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${component.name}`}
        />
      </motion.div>
    </Reorder.Item>
  );
}

interface ContentEditorProps {
  content: SiteContent | null;
  onUpdate: (updates: Partial<SiteContent>) => void;
}

function ContentEditor({ content, onUpdate }: ContentEditorProps) {
  const [openSections, setOpenSections] = useState<string[]>(["hero"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!content) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hero Section Editor */}
      <Collapsible 
        open={openSections.includes("hero")}
        onOpenChange={() => toggleSection("hero")}
      >
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {openSections.includes("hero") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <CardTitle className="text-sm font-medium">Hero Section</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">Main</Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title" className="text-xs">Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero?.title || ""}
                  onChange={(e) => onUpdate({
                    hero: { ...content.hero!, title: e.target.value }
                  })}
                  placeholder="MoodFlix"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle" className="text-xs">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero?.subtitle || ""}
                  onChange={(e) => onUpdate({
                    hero: { ...content.hero!, subtitle: e.target.value }
                  })}
                  placeholder="Find the perfect movie..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hero-badge" className="text-xs">Badge Text</Label>
                  <Input
                    id="hero-badge"
                    value={content.hero?.badge || ""}
                    onChange={(e) => onUpdate({
                      hero: { ...content.hero!, badge: e.target.value }
                    })}
                    placeholder="AI-Powered"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-cta" className="text-xs">CTA Button</Label>
                  <Input
                    id="hero-cta"
                    value={content.hero?.cta || ""}
                    onChange={(e) => onUpdate({
                      hero: { ...content.hero!, cta: e.target.value }
                    })}
                    placeholder="Discover Now"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Stats Display</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Movies</Label>
                    <Input
                      value={content.hero?.stats?.movies || ""}
                      onChange={(e) => onUpdate({
                        hero: { 
                          ...content.hero!, 
                          stats: { ...content.hero!.stats, movies: e.target.value }
                        }
                      })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Moods</Label>
                    <Input
                      value={content.hero?.stats?.moods || ""}
                      onChange={(e) => onUpdate({
                        hero: { 
                          ...content.hero!, 
                          stats: { ...content.hero!.stats, moods: e.target.value }
                        }
                      })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Picks</Label>
                    <Input
                      value={content.hero?.stats?.picks || ""}
                      onChange={(e) => onUpdate({
                        hero: { 
                          ...content.hero!, 
                          stats: { ...content.hero!.stats, picks: e.target.value }
                        }
                      })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Mood Selector Editor */}
      <Collapsible 
        open={openSections.includes("mood")}
        onOpenChange={() => toggleSection("mood")}
      >
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                {openSections.includes("mood") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <CardTitle className="text-sm font-medium">Mood Selector</CardTitle>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood-title" className="text-xs">Section Title</Label>
                <Input
                  id="mood-title"
                  value={content.moodSelector?.title || ""}
                  onChange={(e) => onUpdate({
                    moodSelector: { ...content.moodSelector!, title: e.target.value }
                  })}
                  placeholder="How are you feeling?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood-reset" className="text-xs">Reset Button Text</Label>
                <Input
                  id="mood-reset"
                  value={content.moodSelector?.resetText || ""}
                  onChange={(e) => onUpdate({
                    moodSelector: { ...content.moodSelector!, resetText: e.target.value }
                  })}
                  placeholder="Reset mood"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Trending Section Editor */}
      <Collapsible 
        open={openSections.includes("trending")}
        onOpenChange={() => toggleSection("trending")}
      >
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                {openSections.includes("trending") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <CardTitle className="text-sm font-medium">Trending Section</CardTitle>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trending-title" className="text-xs">Section Title</Label>
                <Input
                  id="trending-title"
                  value={content.trending?.title || ""}
                  onChange={(e) => onUpdate({
                    trending: { ...content.trending!, title: e.target.value }
                  })}
                  placeholder="Discover"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

export function SiteEditorSection() {
  const {
    content,
    draftContent,
    components,
    draftComponents,
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
    refetch,
  } = useSiteEditor("home");

  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [activeTab, setActiveTab] = useState<"layout" | "content" | "history">("layout");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishDescription, setPublishDescription] = useState("");

  const previewSizes: Record<PreviewMode, string> = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  const handlePublish = async () => {
    const success = await publish(publishDescription);
    if (success) {
      setPublishDialogOpen(false);
      setPublishDescription("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            Site Editor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize layout, content, and appearance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              Unsaved changes
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={discardChanges}
            disabled={!hasChanges || isSaving}
            className="gap-1.5"
          >
            <Undo2 className="w-4 h-4" />
            Discard
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraft()}
            disabled={!hasChanges || isSaving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          
          <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={!hasChanges || isSaving}
                className="gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Publish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Changes</DialogTitle>
                <DialogDescription>
                  This will make your changes live on the website. Add an optional description for this update.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="publish-desc">Change Description (optional)</Label>
                  <Textarea
                    id="publish-desc"
                    value={publishDescription}
                    onChange={(e) => setPublishDescription(e.target.value)}
                    placeholder="e.g., Updated hero title and layout"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePublish} disabled={isSaving}>
                  {isSaving ? "Publishing..." : "Publish Now"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </CardTitle>
                
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={previewMode === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === "tablet" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("tablet")}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-muted/30">
              <div className={cn(
                "mx-auto transition-all duration-300 bg-background rounded-lg border shadow-sm overflow-hidden",
                previewSizes[previewMode]
              )}>
                {/* Simulated Browser Chrome */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 px-3 py-1 bg-background rounded text-xs text-muted-foreground truncate">
                    what2play.lovable.app
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <a href="/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
                
                {/* Preview Content */}
                <div className="h-[400px] overflow-auto">
                  <div className="p-4 space-y-4">
                    {/* Mini Hero Preview */}
                    <div className="text-center py-8 bg-gradient-to-b from-secondary/20 to-background rounded-lg">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-xs text-accent mb-3">
                        ✨ {draftContent?.hero?.badge || "AI-Powered Discovery"}
                      </div>
                      <h1 className="font-display text-2xl font-bold">
                        {draftContent?.hero?.title || "MoodFlix"}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        {draftContent?.hero?.subtitle || "Find the perfect movie for how you're feeling."}
                      </p>
                      <Button size="sm" className="mt-4 text-xs">
                        {draftContent?.hero?.cta || "Discover Now"}
                      </Button>
                      <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
                        <div><strong>{draftContent?.hero?.stats?.movies || "500k+"}</strong> Movies</div>
                        <div><strong>{draftContent?.hero?.stats?.moods || "7"}</strong> Moods</div>
                        <div><strong>{draftContent?.hero?.stats?.picks || "∞"}</strong> Picks</div>
                      </div>
                    </div>

                    {/* Component Order Preview */}
                    <div className="space-y-2">
                      {draftComponents
                        .sort((a, b) => a.order - b.order)
                        .map((comp) => (
                          <div
                            key={comp.id}
                            className={cn(
                              "p-3 rounded-lg border text-sm flex items-center gap-2",
                              comp.enabled 
                                ? "bg-card border-border" 
                                : "bg-muted/30 border-dashed border-muted-foreground/20 opacity-50"
                            )}
                          >
                            {comp.enabled ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className={cn(!comp.enabled && "line-through")}>
                              {comp.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="space-y-4">
          <Card>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <CardHeader className="py-0 px-0 border-b">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="layout"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    <Layout className="w-4 h-4 mr-1.5" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                  >
                    <History className="w-4 h-4 mr-1.5" />
                    History
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-4">
                <TabsContent value="layout" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Drag to reorder, toggle to show/hide
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={refetch}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Reorder.Group
                      axis="y"
                      values={draftComponents}
                      onReorder={reorderComponents}
                      className="space-y-2"
                    >
                      {draftComponents.map((component) => (
                        <ComponentCard
                          key={component.id}
                          component={component}
                          onToggle={() => toggleComponent(component.id)}
                        />
                      ))}
                    </Reorder.Group>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                  <ScrollArea className="h-[400px] pr-3">
                    <ContentEditor
                      content={draftContent}
                      onUpdate={updateDraftContent}
                    />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    {history.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {history.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  Version {item.version}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                                {item.change_description && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {item.change_description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreVersion(item)}
                                className="shrink-0 h-7 text-xs"
                              >
                                Restore
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
