import { useState } from "react";
import { FolderPlus, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollections } from "@/hooks/useCollections";

interface AddToCollectionButtonProps {
  movie: {
    id: number;
    title: string;
    poster_path?: string | null;
  };
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCollectionButton({ movie, variant = "outline", size = "lg" }: AddToCollectionButtonProps) {
  const { collections, user, addMovieToCollection, createCollection } = useCollections();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  if (!user) return null;

  const isInCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.movies?.some(m => m.movie_id === movie.id) || false;
  };

  const handleAddToCollection = async (collectionId: string) => {
    await addMovieToCollection(collectionId, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || undefined,
    });
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    const newCollection = await createCollection(newName);
    if (newCollection) {
      await addMovieToCollection(newCollection.id, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || undefined,
      });
    }
    setNewName("");
    setIsCreateOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2 rounded-full active:scale-95 transition-transform">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Collection</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          {collections.length === 0 ? (
            <div className="px-2 py-3 text-sm text-center text-muted-foreground">
              No collections yet
            </div>
          ) : (
            collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={isInCollection(collection.id)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{collection.name}</span>
                {isInCollection(collection.id) && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create & Add</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Collection Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Favorites"
              />
            </div>
            <Button onClick={handleCreateAndAdd} className="w-full">
              Create & Add Movie
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}