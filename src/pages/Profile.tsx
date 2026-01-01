import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useCollections } from "@/hooks/useCollections";
import { User, History, FolderHeart, Settings, Eye, Plus, Trash2, Globe, Lock, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GuestProfileView } from "@/components/profile/GuestProfileView";

const Profile = () => {
  const { profile, user, isLoading: profileLoading, authReady, updateProfile } = useProfile();
  const { history, isLoading: historyLoading, removeFromHistory } = useWatchHistory();
  const { collections, isLoading: collectionsLoading, createCollection, deleteCollection, toggleCollectionVisibility, removeMovieFromCollection } = useCollections();

  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Guest view
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
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Minimal Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="w-16 h-16 ring-2 ring-border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-muted">
              <User className="w-6 h-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-9 max-w-[200px]"
                  placeholder="Your name"
                />
                <Button size="sm" onClick={handleSaveProfile}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-semibold truncate">
                  {profile?.display_name || "Anonymous"}
                </h1>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-muted rounded">
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </motion.div>

        {/* Privacy Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            {profile?.is_public ? (
              <Globe className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {profile?.is_public ? "Public Profile" : "Private Profile"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.is_public ? "Others can see your activity" : "Your activity is hidden"}
              </p>
            </div>
          </div>
          <Switch
            checked={profile?.is_public || false}
            onCheckedChange={handleTogglePrivacy}
          />
        </motion.div>

        {/* Collections Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-primary" />
              <h2 className="font-medium">Collections</h2>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1 h-8">
                  <Plus className="w-3.5 h-3.5" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Create Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="e.g., Favorites, To Watch..."
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
            <div className="py-8 flex justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <FolderHeart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No collections yet</p>
              <p className="text-xs mt-1">Create one to organize movies</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="p-3 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{collection.name}</span>
                      {collection.is_public ? (
                        <Globe className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={collection.is_public}
                        onCheckedChange={() => toggleCollectionVisibility(collection.id)}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteCollection(collection.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {collection.movies && collection.movies.length > 0 ? (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {collection.movies.map((movie) => (
                        <div key={movie.id} className="relative group shrink-0">
                          <div className="w-10 aspect-[2/3] rounded overflow-hidden bg-muted">
                            <img
                              src={movie.poster_path || "https://via.placeholder.com/80x120"}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeMovieFromCollection(collection.id, movie.movie_id)}
                            className="absolute -top-1 -right-1 p-0.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Empty • Add movies from any movie page
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Watch History Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="font-medium">Watch History</h2>
          </div>

          {historyLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No watch history</p>
              <p className="text-xs mt-1">Mark movies as watched to track them</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {history.slice(0, 16).map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={item.poster_path || "https://via.placeholder.com/100x150"}
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
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;