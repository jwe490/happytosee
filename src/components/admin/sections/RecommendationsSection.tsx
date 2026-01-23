import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sliders, Save, RotateCcw, TrendingUp, Film, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecommendationsSectionProps {
  userRole: string;
}

interface MoodWeights {
  [key: string]: number;
}

interface RecommendationSettings {
  mood_weights: MoodWeights;
  mood_recommendations_enabled: boolean;
  actor_recommendations_enabled: boolean;
  trending_override: {
    enabled: boolean;
    movies: number[];
  };
}

const defaultMoods = ["happy", "sad", "romantic", "action", "scary", "thoughtful", "adventurous", "relaxed"];

export function RecommendationsSection({ userRole }: RecommendationsSectionProps) {
  const [settings, setSettings] = useState<RecommendationSettings>({
    mood_weights: defaultMoods.reduce((acc, mood) => ({ ...acc, [mood]: 1.0 }), {}),
    mood_recommendations_enabled: true,
    actor_recommendations_enabled: true,
    trending_override: { enabled: false, movies: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [overrideMovieId, setOverrideMovieId] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("recommendation_settings")
        .select("*");

      if (error) throw error;

      if (data) {
        const settingsMap: any = {};
        data.forEach((row: any) => {
          settingsMap[row.setting_key] = row.setting_value;
        });

        setSettings({
          mood_weights: settingsMap.mood_weights || settings.mood_weights,
          mood_recommendations_enabled: settingsMap.mood_recommendations_enabled === true || settingsMap.mood_recommendations_enabled === "true",
          actor_recommendations_enabled: settingsMap.actor_recommendations_enabled === true || settingsMap.actor_recommendations_enabled === "true",
          trending_override: settingsMap.trending_override || settings.trending_override,
        });
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc("update_recommendation_setting", {
        p_setting_key: key,
        p_setting_value: value,
        p_updated_by: null,
      });

      if (error) throw error;
      toast.success("Setting saved successfully");
    } catch (err: any) {
      console.error("Error saving setting:", err);
      toast.error("Failed to save setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoodWeightChange = (mood: string, value: number[]) => {
    const newWeights = { ...settings.mood_weights, [mood]: value[0] };
    setSettings({ ...settings, mood_weights: newWeights });
  };

  const saveAllMoodWeights = () => {
    saveSetting("mood_weights", settings.mood_weights);
  };

  const resetMoodWeights = () => {
    const reset = defaultMoods.reduce((acc, mood) => ({ ...acc, [mood]: 1.0 }), {});
    setSettings({ ...settings, mood_weights: reset });
    saveSetting("mood_weights", reset);
  };

  const toggleMoodRecommendations = (enabled: boolean) => {
    setSettings({ ...settings, mood_recommendations_enabled: enabled });
    saveSetting("mood_recommendations_enabled", enabled);
  };

  const toggleActorRecommendations = (enabled: boolean) => {
    setSettings({ ...settings, actor_recommendations_enabled: enabled });
    saveSetting("actor_recommendations_enabled", enabled);
  };

  const toggleTrendingOverride = (enabled: boolean) => {
    const newOverride = { ...settings.trending_override, enabled };
    setSettings({ ...settings, trending_override: newOverride });
    saveSetting("trending_override", newOverride);
  };

  const addOverrideMovie = () => {
    if (!overrideMovieId) return;
    const movieId = parseInt(overrideMovieId);
    if (isNaN(movieId)) {
      toast.error("Please enter a valid movie ID");
      return;
    }
    const newMovies = [...settings.trending_override.movies, movieId];
    const newOverride = { ...settings.trending_override, movies: newMovies };
    setSettings({ ...settings, trending_override: newOverride });
    saveSetting("trending_override", newOverride);
    setOverrideMovieId("");
    toast.success("Movie added to trending override");
  };

  const removeOverrideMovie = (movieId: number) => {
    const newMovies = settings.trending_override.movies.filter((id) => id !== movieId);
    const newOverride = { ...settings.trending_override, movies: newMovies };
    setSettings({ ...settings, trending_override: newOverride });
    saveSetting("trending_override", newOverride);
  };

  const canEdit = userRole === "admin" || userRole === "super_admin";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="w-6 h-6 text-accent" />
            Recommendation Engine
          </h2>
          <p className="text-muted-foreground">
            Configure how recommendations are generated
          </p>
        </div>
        {!canEdit && (
          <Badge variant="destructive">View Only</Badge>
        )}
      </div>

      <Tabs defaultValue="toggles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="toggles">Feature Toggles</TabsTrigger>
          <TabsTrigger value="weights">Mood Weights</TabsTrigger>
          <TabsTrigger value="trending">Trending Override</TabsTrigger>
        </TabsList>

        <TabsContent value="toggles">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Features</CardTitle>
              <CardDescription>Enable or disable recommendation features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <Smile className="w-8 h-8 text-accent" />
                  <div>
                    <p className="font-medium">Mood-Based Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Recommend movies based on user's current mood
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.mood_recommendations_enabled}
                  onCheckedChange={toggleMoodRecommendations}
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <Film className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Actor-Based Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Recommend movies featuring favorite actors
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.actor_recommendations_enabled}
                  onCheckedChange={toggleActorRecommendations}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle>Mood Weight Configuration</CardTitle>
              <CardDescription>
                Adjust how much each mood influences recommendations (0.5 = less, 2.0 = more)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.mood_weights).map(([mood, weight]) => (
                <div key={mood} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{mood}</Label>
                    <span className="text-sm text-muted-foreground">{weight.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[weight]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(v) => handleMoodWeightChange(mood, v)}
                    disabled={!canEdit}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveAllMoodWeights} disabled={!canEdit || isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Weights
                </Button>
                <Button variant="outline" onClick={resetMoodWeights} disabled={!canEdit}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Manual Trending Override</CardTitle>
              <CardDescription>
                Manually set movies to appear in trending regardless of actual metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <div>
                    <p className="font-medium">Enable Trending Override</p>
                    <p className="text-sm text-muted-foreground">
                      Manually control which movies appear as trending
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.trending_override.enabled}
                  onCheckedChange={toggleTrendingOverride}
                  disabled={!canEdit}
                />
              </div>

              {settings.trending_override.enabled && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter TMDB Movie ID"
                      value={overrideMovieId}
                      onChange={(e) => setOverrideMovieId(e.target.value)}
                      disabled={!canEdit}
                    />
                    <Button onClick={addOverrideMovie} disabled={!canEdit}>
                      Add Movie
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {settings.trending_override.movies.map((movieId) => (
                      <Badge
                        key={movieId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => canEdit && removeOverrideMovie(movieId)}
                      >
                        Movie #{movieId} ×
                      </Badge>
                    ))}
                    {settings.trending_override.movies.length === 0 && (
                      <p className="text-sm text-muted-foreground">No movies in override list</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
