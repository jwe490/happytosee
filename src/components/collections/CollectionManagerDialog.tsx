import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Folder, Share2, Trash2, Edit2, Check, Grid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCollections } from "@/hooks/useCollections";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CollectionManagerDialogProps {
  movieToAdd?: {
    id: number;
    title: string;
    poster_path?: string;
  };
  trigger?: React.ReactNode;
  onCollectionSelected?: (collectionId: string) => void;
}

export function CollectionManagerDialog({
  movieToAdd,
  trigger,
  onCollectionSelected,
}: CollectionManagerDialogProps) {
  const { collections, createCollection, addMovieToCollection, getCollectionMovies } =
    useCollections();

  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  const colors = [
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];

  useEffect(() => {
    if (open) {
      collections.forEach(async (collection) => {
        const movies = await getCollectionMovies(collection.id);
        setMovieCounts((prev) => ({ ...prev, [collection.id]: movies.length }));
      });
    }
  }, [open, collections, getCollectionMovies]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const newCollection = await createCollection({
      name: newCollectionName,
      description: newCollectionDescription,
      color_theme: selectedColor,
    });

    setNewCollectionName("");
    setNewCollectionDescription("");
    setIsCreating(false);

    if (newCollection && movieToAdd) {
      await handleAddToCollection(newCollection.id);
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!movieToAdd) return;

    const success = await addMovieToCollection(collectionId, movieToAdd);
    if (success) {
      setAddedTo((prev) => new Set([...prev, collectionId]));
      onCollectionSelected?.(collectionId);

      setTimeout(() => {
        setAddedTo((prev) => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add to Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            {movieToAdd ? `Add "${movieToAdd.title}" to Collection` : "Manage Collections"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {collections.map((collection) => {
              const isAdded = addedTo.has(collection.id);

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleAddToCollection(collection.id)}
                    disabled={!movieToAdd || isAdded}
                    className="w-full p-3 rounded-lg border border-border hover:border-foreground/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      borderLeft: `4px solid ${collection.color_theme}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Folder
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: collection.color_theme }}
                          />
                          <h4 className="font-semibold text-sm truncate">{collection.name}</h4>
                        </div>
                        {collection.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Grid className="w-3 h-3 mr-1" />
                            {movieCounts[collection.id] || collection.movie_count || 0} movies
                          </Badge>
                          {collection.is_public && (
                            <Badge variant="outline" className="text-xs">
                              <Share2 className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isAdded && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            Create New Collection
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-3 border-t"
          >
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Collection Name
              </Label>
              <Input
                id="name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="My Favorites"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Movies that inspire me..."
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Color Theme</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewCollectionName("");
                  setNewCollectionDescription("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1"
              >
                Create
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
