import { useState, useMemo } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useCollections, Collection } from "@/hooks/useCollections";
import { 
  Bookmark, 
  Trash2, 
  Star, 
  ArrowLeft, 
  Film, 
  Sparkles, 
  Search,
  SortAsc,
  Grid3X3,
  List,
  Calendar,
  Clock,
  FolderPlus,
  Folder,
  Plus,
  MoreHorizontal,
  Eye,
  Share2,
  Edit,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortBy = "date" | "rating" | "title";

const Watchlist = () => {
  const { watchlist, isLoading, removeFromWatchlist, user } = useWatchlist();
  const { collections, isLoading: collectionsLoading, createCollection, deleteCollection, getCollectionMovies } = useCollections();
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("watchlist");
  
  // Collection dialog state
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  
  // Selected collection for viewing
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionMovies, setCollectionMovies] = useState<any[]>([]);
  
  const navigate = useNavigate();

  // Filter and sort watchlist
  const filteredWatchlist = useMemo(() => {
    let result = [...watchlist];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "date":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return result;
  }, [watchlist, searchQuery, sortBy]);

  const handleMovieClick = (watchlistItem: WatchlistItem) => {
    const movie: Movie = {
      id: watchlistItem.movie_id,
      title: watchlistItem.title,
      rating: watchlistItem.rating || 0,
      year: watchlistItem.release_year ? parseInt(watchlistItem.release_year) : 0,
      genre: "",
      posterUrl: watchlistItem.poster_path ? `https://image.tmdb.org/t/p/w500${watchlistItem.poster_path}` : "",
      moodMatch: watchlistItem.overview || "",
    };
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setSelectedMovie(null), 400);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection({
      name: newCollectionName,
      description: newCollectionDesc,
    });
    setNewCollectionName("");
    setNewCollectionDesc("");
    setIsCreateCollectionOpen(false);
  };

  const handleViewCollection = async (collection: Collection) => {
    setSelectedCollection(collection);
    const movies = await getCollectionMovies(collection.id);
    setCollectionMovies(movies);
  };

  const stats = {
    total: watchlist.length,
    avgRating: watchlist.length > 0 
      ? (watchlist.reduce((acc, m) => acc + (m.rating || 0), 0) / watchlist.length).toFixed(1) 
      : "0.0",
    thisWeek: watchlist.filter(m => {
      const added = new Date(m.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return added > weekAgo;
    }).length,
    collections: collections.length,
  };

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-background pt-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          {/* Back button */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <Bookmark className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    My Library
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {user ? "Your personal movie collection" : "Save movies to watch later"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Film className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">In Watchlist</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Folder className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.collections}</p>
                    <p className="text-xs text-muted-foreground">Collections</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="watchlist" className="gap-2 data-[state=active]:bg-background">
                  <Bookmark className="w-4 h-4" />
                  Watchlist
                </TabsTrigger>
                <TabsTrigger value="collections" className="gap-2 data-[state=active]:bg-background">
                  <Folder className="w-4 h-4" />
                  Collections
                </TabsTrigger>
              </TabsList>

              {activeTab === "watchlist" && (
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-full bg-muted/50"
                    />
                  </div>

                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                        <SortAsc className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date")} className={sortBy === "date" ? "bg-accent" : ""}>
                        <Clock className="w-4 h-4 mr-2" />
                        Date Added
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("rating")} className={sortBy === "rating" ? "bg-accent" : ""}>
                        <Star className="w-4 h-4 mr-2" />
                        Rating
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("title")} className={sortBy === "title" ? "bg-accent" : ""}>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Title
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View mode */}
                  <div className="flex bg-muted/50 rounded-full p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                      )}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/50"
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "collections" && (
                <Button 
                  onClick={() => setIsCreateCollectionOpen(true)}
                  className="gap-2 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                  New Collection
                </Button>
              )}
            </div>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist" className="mt-6">
              {isLoading ? (
                <div className={cn(
                  viewMode === "grid" 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    : "space-y-3"
                )}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "bg-muted animate-pulse rounded-xl",
                        viewMode === "grid" ? "aspect-[2/3]" : "h-24"
                      )}
                    />
                  ))}
                </div>
              ) : filteredWatchlist.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <Bookmark className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {searchQuery ? "No movies found" : "Your watchlist is empty"}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? "Try a different search term" 
                      : "Start adding movies to keep track of what you want to watch next"
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => navigate("/")} className="rounded-full gap-2">
                      <Sparkles className="w-4 h-4" />
                      Discover Movies
                    </Button>
                  )}
                </motion.div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredWatchlist.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: Math.min(index * 0.02, 0.2) }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative cursor-pointer"
                        onClick={() => handleMovieClick(movie)}
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-200 ring-1 ring-border/30 group-hover:ring-primary/50">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                              <Film className="w-10 h-10" />
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          
                          {/* Title on hover */}
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <h3 className="font-semibold text-sm text-white line-clamp-2">
                              {movie.title}
                            </h3>
                            <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
                              {movie.release_year && <span>{movie.release_year}</span>}
                              {movie.rating && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {movie.rating.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(movie.movie_id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredWatchlist.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: Math.min(index * 0.02, 0.2) }}
                        className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleMovieClick(movie)}
                      >
                        <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{movie.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {movie.release_year && <span>{movie.release_year}</span>}
                            {movie.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                {movie.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {movie.overview && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {movie.overview}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(movie.movie_id);
                          }}
                          className="shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections" className="mt-6">
              {collectionsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <Folder className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    No collections yet
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Organize your movies into custom collections
                  </p>
                  <Button 
                    onClick={() => setIsCreateCollectionOpen(true)} 
                    className="rounded-full gap-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create Collection
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {collections.map((collection, index) => (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <Card 
                          className="p-5 h-full bg-gradient-to-br from-card to-muted/10 border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => handleViewCollection(collection)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                              <Folder className="w-5 h-5 text-primary" />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCollection(collection.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {collection.is_public && (
                              <Badge variant="secondary" className="text-xs">
                                <Share2 className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              View collection
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <Footer />

        {/* Movie Expanded View */}
        <ExpandedMovieView
          movie={selectedMovie}
          isOpen={isExpanded}
          onClose={handleClose}
        />

        {/* Create Collection Dialog */}
        <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Create Collection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="My Favorites"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="desc">Description (optional)</Label>
                <Textarea
                  id="desc"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="A collection of my favorite movies..."
                  rows={3}
                  className="mt-1.5 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateCollectionOpen(false)}
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
            </div>
          </DialogContent>
        </Dialog>

        {/* View Collection Dialog */}
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            {selectedCollection && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    {selectedCollection.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {collectionMovies.length === 0 ? (
                    <div className="text-center py-12">
                      <Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No movies in this collection yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
                      {collectionMovies.map((movie) => (
                        <div key={movie.id} className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutGroup>
  );
};

export default Watchlist;
