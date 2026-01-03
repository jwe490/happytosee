import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useCollections } from "@/hooks/useCollections";
import { User, History, FolderHeart, Eye, Plus, Trash2, Globe, Lock, Edit3, ChevronRight, Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GuestProfileView } from "@/components/profile/GuestProfileView";
import { ProfileSkeleton, CollectionSkeleton } from "@/components/ui/loading-skeleton";

const Profile = () => {
  const { profile, user, isLoading: profileLoading, authReady, updateProfile } = useProfile();
  const { history, isLoading: historyLoading, removeFromHistory } = useWatchHistory();
  const { collections, isLoading: collectionsLoading, createCollection, deleteCollection, toggleCollectionVisibility, removeMovieFromCollection } = useCollections();

  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName });
    setIsEditing(false);
  };

  const handleTogglePrivacy = async () => {
    await updateProfile({ is_public: !profile?.is_public });
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName);
    setNewCollectionName("");
    setIsCreateDialogOpen(false);
  };

  // Loading state
  if (!authReady || profileLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  // Guest view
  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Header />
        <GuestProfileView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Minimal Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="w-14 h-14 ring-2 ring-border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-muted">
              <User className="w-5 h-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-8 max-w-[180px] text-sm"
                  placeholder="Your name"
                  autoFocus
                />
                <Button size="sm" className="h-8" onClick={handleSaveProfile}>Save</Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold truncate">
                  {profile?.display_name || "Anonymous"}
                </h1>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-muted rounded transition-colors">
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>

          {/* Privacy Toggle Inline */}
          <div className="flex items-center gap-2">
            {profile?.is_public ? (
              <Globe className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <Switch
              checked={profile?.is_public || false}
              onCheckedChange={handleTogglePrivacy}
            />
          </div>
        </motion.div>

        {/* Collections Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-primary" />
              <h2 className="font-medium text-sm">Collections</h2>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs">
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-sm">Name</Label>
                    <Input
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="e.g., Favorites, To Watch..."
                      className="mt-1"
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
            <CollectionSkeleton />
          ) : collections.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center"
            >
              <FolderHeart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No collections yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Create one and add movies from any movie page</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {collections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Collection Header */}
                    <button
                      onClick={() => setExpandedCollection(expandedCollection === collection.id ? null : collection.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Film className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{collection.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {collection.movies?.length || 0} movies
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {collection.is_public ? (
                          <Globe className="w-3 h-3 text-primary" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCollection === collection.id ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedCollection === collection.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border overflow-hidden"
                        >
                          <div className="p-3 space-y-3">
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>Visibility:</span>
                                <Switch
                                  checked={collection.is_public}
                                  onCheckedChange={() => toggleCollectionVisibility(collection.id)}
                                  className="scale-75"
                                />
                                <span>{collection.is_public ? "Public" : "Private"}</span>
                              </div>
                              <div className="flex-1" />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteCollection(collection.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>

                            {/* Movies Grid */}
                            {collection.movies && collection.movies.length > 0 ? (
                              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                {collection.movies.map((movie) => (
                                  <div key={movie.id} className="relative group">
                                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                                      <img
                                        src={movie.poster_path || "/placeholder.svg"}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <button
                                      onClick={() => removeMovieFromCollection(collection.id, movie.movie_id)}
                                      className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 text-white" />
                                    </button>
                                    <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1">{movie.title}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No movies yet • Add from any movie page
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Watch History Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="font-medium text-sm">Watch History</h2>
          </div>

          {historyLoading ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center"
            >
              <Eye className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No watch history</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Mark movies as watched to track them here</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {history.slice(0, 16).map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm">
                    <img
                      src={item.poster_path || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromHistory(item.movie_id)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;