import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useCollections } from "@/hooks/useCollections";
import { User, History, FolderHeart, Settings, Eye, Plus, Trash2, Globe, Lock, Sliders } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { ProfileStatCards } from "@/components/profile/ProfileStatCards";
import { ProfilePreferencesEditor } from "@/components/profile/ProfilePreferencesEditor";
import { ProfileIllustrationCard } from "@/components/profile/ProfileIllustrationCard";
import { GuestProfileView } from "@/components/profile/GuestProfileView";

const Profile = () => {
  const { profile, user, isLoading: profileLoading, authReady, updateProfile } = useProfile();
  const { history, isLoading: historyLoading, removeFromHistory } = useWatchHistory();
  const { collections, isLoading: collectionsLoading, createCollection, deleteCollection, toggleCollectionVisibility } = useCollections();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName, bio });
    setIsEditing(false);
  };

  const handleSavePreferences = async (genres: string[], languages: string[]) => {
    setIsSavingPrefs(true);
    await updateProfile({ 
      favorite_genres: genres, 
      preferred_languages: languages 
    });
    setIsSavingPrefs(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName);
    setNewCollectionName("");
    setIsCreateDialogOpen(false);
  };

  // Show loading while auth is initializing
  if (!authReady || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show guest view if not logged in (no redirect, just show CTA)
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <GuestProfileView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 md:p-8 border border-border"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-4 ring-accent/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-accent/20 to-primary/20">
                <User className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="max-w-sm"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>Save</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">
                      {profile?.display_name || "Anonymous User"}
                    </h1>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Edit
                    </Button>
                    <AccentColorPicker />
                  </div>
                  <p className="text-muted-foreground mt-1">{user?.email}</p>
                  {profile?.bio && (
                    <p className="text-sm mt-3 max-w-lg">{profile.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <ProfileStatCards 
          watchedCount={history.length}
          collectionsCount={collections.length}
          reviewsCount={0}
          accentColor={profile?.accent_color || "#8B5CF6"}
        />

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full max-w-lg grid grid-cols-3 mb-6">
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Watch History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <FolderHeart className="w-4 h-4" />
              <span className="hidden sm:inline">Collections</span>
              <span className="sm:hidden">Lists</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <ProfileIllustrationCard
              icon={History}
              title="Watch History"
              description="Movies you've marked as watched"
              gradient="from-blue-500/10 to-cyan-500/10"
            >
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No watch history yet</p>
                  <p className="text-sm">Movies you mark as watched will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mt-4">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group relative"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
                        <img
                          src={item.poster_path || "https://via.placeholder.com/300x450"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium text-xs line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.watched_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromHistory(item.movie_id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </ProfileIllustrationCard>
          </TabsContent>

          <TabsContent value="collections">
            <ProfileIllustrationCard
              icon={FolderHeart}
              title="Your Collections"
              description="Organize movies into custom lists"
              gradient="from-pink-500/10 to-rose-500/10"
            >
              <div className="flex justify-end mb-4">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Collection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Collection Name</Label>
                        <Input
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="My Favorites"
                        />
                      </div>
                      <Button onClick={handleCreateCollection} className="w-full">
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {collectionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto" />
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderHeart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No collections yet</p>
                  <p className="text-sm">Create a collection to organize your movies</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {collections.map((collection) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-background/50 rounded-xl p-4 border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{collection.name}</h3>
                            {collection.is_public ? (
                              <Globe className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {collection.movies?.length || 0} movies
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={collection.is_public}
                            onCheckedChange={() => toggleCollectionVisibility(collection.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCollection(collection.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {collection.movies && collection.movies.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                          {collection.movies.slice(0, 6).map((movie) => (
                            <div
                              key={movie.id}
                              className="shrink-0 w-14 aspect-[2/3] rounded-lg overflow-hidden"
                            >
                              <img
                                src={movie.poster_path || "https://via.placeholder.com/100x150"}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </ProfileIllustrationCard>
          </TabsContent>

          <TabsContent value="preferences">
            <ProfileIllustrationCard
              icon={Sliders}
              title="Your Preferences"
              description="Customize your movie recommendations"
              gradient="from-purple-500/10 to-violet-500/10"
            >
              <ProfilePreferencesEditor
                favoriteGenres={profile?.favorite_genres || []}
                preferredLanguages={profile?.preferred_languages || []}
                onSave={handleSavePreferences}
                isSaving={isSavingPrefs}
              />
            </ProfileIllustrationCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
