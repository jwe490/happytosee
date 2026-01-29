import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Type, 
  Layout, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSiteEditor } from "@/hooks/useSiteEditor";
import { ColorPicker, ColorPalettePicker } from "@/components/admin/editor/ColorPicker";
import { TypographyEditor } from "@/components/admin/editor/TypographyEditor";
import { SectionManager } from "@/components/admin/editor/SectionManager";

export function SiteEditorSection() {
  const {
    theme,
    layout,
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
  } = useSiteEditor();

  const [activeTab, setActiveTab] = useState("colors");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Site Editor</h2>
          <p className="text-muted-foreground text-sm">
            Customize your site's appearance and layout
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </Button>

          {/* Revert */}
          <Button
            variant="outline"
            size="sm"
            onClick={revertChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Revert
          </Button>

          {/* Save as draft */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveChanges(false)}
            disabled={!hasUnsavedChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </Button>

          {/* Publish */}
          <Button
            size="sm"
            onClick={() => saveChanges(true)}
            disabled={!hasUnsavedChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Unsaved changes alert */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                You have unsaved changes. Save as draft or publish to keep them.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customization</CardTitle>
              <CardDescription>
                Edit colors, typography, and layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="colors" className="gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    Fonts
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="gap-1.5">
                    <Layout className="w-3.5 h-3.5" />
                    Layout
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[500px] mt-4 pr-4">
                  {/* Colors tab */}
                  <TabsContent value="colors" className="mt-0 space-y-6">
                    {/* Quick palettes */}
                    <ColorPalettePicker
                      onApply={(primary, accent) => {
                        updateThemeColor("primary", primary);
                        updateThemeColor("accent", accent);
                      }}
                    />

                    <div className="border-t border-border pt-4 space-y-4">
                      <p className="text-sm font-medium">Custom Colors</p>
                      
                      {theme && (
                        <>
                          <ColorPicker
                            label="Primary"
                            value={theme.colors.primary}
                            onChange={(v) => updateThemeColor("primary", v)}
                            defaultValue="263 70% 58%"
                          />
                          <ColorPicker
                            label="Secondary"
                            value={theme.colors.secondary}
                            onChange={(v) => updateThemeColor("secondary", v)}
                            defaultValue="220 14% 96%"
                          />
                          <ColorPicker
                            label="Accent"
                            value={theme.colors.accent}
                            onChange={(v) => updateThemeColor("accent", v)}
                            defaultValue="339 90% 51%"
                          />
                          <ColorPicker
                            label="Background"
                            value={theme.colors.background}
                            onChange={(v) => updateThemeColor("background", v)}
                            defaultValue="0 0% 100%"
                          />
                          <ColorPicker
                            label="Foreground"
                            value={theme.colors.foreground}
                            onChange={(v) => updateThemeColor("foreground", v)}
                            defaultValue="224 71% 4%"
                          />
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* Typography tab */}
                  <TabsContent value="typography" className="mt-0">
                    {theme && (
                      <TypographyEditor
                        headingFont={theme.typography.headingFont}
                        bodyFont={theme.typography.bodyFont}
                        headingWeight={theme.typography.headingWeight}
                        bodyWeight={theme.typography.bodyWeight}
                        onHeadingFontChange={(v) => updateTypography("headingFont", v)}
                        onBodyFontChange={(v) => updateTypography("bodyFont", v)}
                        onHeadingWeightChange={(v) => updateTypography("headingWeight", v)}
                        onBodyWeightChange={(v) => updateTypography("bodyWeight", v)}
                      />
                    )}
                  </TabsContent>

                  {/* Layout tab */}
                  <TabsContent value="layout" className="mt-0">
                    {layout && (
                      <SectionManager
                        sections={layout.components}
                        onReorder={reorderSections}
                        onToggle={toggleSection}
                        onUpdateSettings={updateSectionSettings}
                      />
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live Preview</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Real-time
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 p-2 bg-card border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-muted rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                      what2play.lovable.app
                    </div>
                  </div>
                </div>

                {/* Preview content */}
                <div 
                  className="aspect-[16/10] p-4 overflow-hidden"
                  style={{
                    backgroundColor: theme ? `hsl(${theme.colors.background})` : undefined,
                    color: theme ? `hsl(${theme.colors.foreground})` : undefined,
                  }}
                >
                  {/* Mock header */}
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="font-bold text-lg"
                      style={{ 
                        fontFamily: theme?.typography.headingFont,
                        fontWeight: theme?.typography.headingWeight,
                      }}
                    >
                      MoodFlix
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: `hsl(${theme?.colors.primary})`, color: 'white' }}
                      >
                        Get Started
                      </div>
                    </div>
                  </div>

                  {/* Mock hero */}
                  <div className="text-center py-8">
                    <h1 
                      className="text-2xl mb-2"
                      style={{ 
                        fontFamily: theme?.typography.headingFont,
                        fontWeight: theme?.typography.headingWeight,
                      }}
                    >
                      What's Your Movie Mood?
                    </h1>
                    <p 
                      className="text-sm opacity-70"
                      style={{ 
                        fontFamily: theme?.typography.bodyFont,
                        fontWeight: theme?.typography.bodyWeight,
                      }}
                    >
                      Discover your perfect movie based on how you feel
                    </p>
                  </div>

                  {/* Mock mood buttons */}
                  <div className="flex justify-center gap-2 flex-wrap">
                    {["Happy", "Excited", "Chill", "Romantic"].map((mood) => (
                      <div
                        key={mood}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `hsl(${theme?.colors.secondary})`,
                          fontFamily: theme?.typography.bodyFont,
                        }}
                      >
                        {mood}
                      </div>
                    ))}
                  </div>

                  {/* Mock movie cards */}
                  <div className="grid grid-cols-4 gap-2 mt-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-1">
                        <div 
                          className="aspect-[2/3] rounded-lg"
                          style={{ backgroundColor: `hsl(${theme?.colors.muted})` }}
                        />
                        <div 
                          className="h-2 rounded"
                          style={{ 
                            backgroundColor: `hsl(${theme?.colors.muted})`,
                            width: `${60 + i * 10}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
