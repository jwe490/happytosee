import { useState, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExpandedMovieView from "@/components/ExpandedMovieView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useCollections, Collection } from "@/hooks/useCollections";
import {
  Bookmark, Trash2, Star, ArrowLeft, Film, Sparkles, Search,
  SortAsc, Grid3X3, List, Clock, FolderPlus, Folder, Plus,
  MoreHorizontal, Share2, Edit, ChevronRight, GripVertical,
} from "lucide-react";
import { Movie } from "@/hooks/useMovieRecommendations";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortBy = "date" | "rating" | "title" | "custom";

const Watchlist = () => {
  const { watchlist, isLoading, removeFromWatchlist, user } = useWatchlist();
  const { collections, isLoading: collectionsLoading, createCollection, deleteCollection, getCollectionMovies } = useCollections();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("watchlist");
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionMovies, setCollectionMovies] = useState<any[]>([]);
  const [reorderedList, setReorderedList] = useState<WatchlistItem[]>([]);
  const [isDragMode, setIsDragMode] = useState(false);

  const navigate = useNavigate();

  const filteredWatchlist = useMemo(() => {
    let result = [...watchlist];
    if (searchQuery) {
      result = result.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (sortBy === "custom" && reorderedList.length > 0) return reorderedList;
    switch (sortBy) {
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "title": result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "date": default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [watchlist, searchQuery, sortBy, reorderedList]);

  const handleMovieClick = (item: WatchlistItem) => {
    const movie: Movie = {
      id: item.movie_id, title: item.title,
      rating: item.rating || 0, year: item.release_year ? parseInt(item.release_year) : 0,
      genre: "", posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
      moodMatch: item.overview || "",
    };
    setSelectedMovie(movie);
    setIsExpanded(true);
  };

  const handleClose = () => { setIsExpanded(false); setTimeout(() => setSelectedMovie(null), 400); };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection({ name: newCollectionName, description: newCollectionDesc });
    setNewCollectionName(""); setNewCollectionDesc(""); setIsCreateCollectionOpen(false);
  };

  const handleViewCollection = async (collection: Collection) => {
    setSelectedCollection(collection);
    const movies = await getCollectionMovies(collection.id);
    setCollectionMovies(movies);
  };

  const handleReorder = (newOrder: WatchlistItem[]) => {
    setReorderedList(newOrder);
    setSortBy("custom");
  };

  const stats = {
    total: watchlist.length,
    avgRating: watchlist.length > 0
      ? (watchlist.reduce((a, m) => a + (m.rating || 0), 0) / watchlist.length).toFixed(1)
      : "—",
    thisWeek: watchlist.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 86400000)).length,
    collections: collections.length,
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </motion.div>

        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">My Library</h1>
          <p className="text-muted-foreground mt-2 text-base">{user ? "Your personal movie vault" : "Save movies to watch later"}</p>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">{stats.total}</span>
              <span className="text-sm text-muted-foreground">saved</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-semibold">{stats.avgRating}</span>
              <span className="text-sm text-muted-foreground">avg</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary">{stats.thisWeek}</span>
              <span className="text-sm text-muted-foreground">this week</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{stats.collections}</span>
              <span className="text-sm text-muted-foreground">collections</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="watchlist" className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Bookmark className="w-4 h-4" /> Watchlist
              </TabsTrigger>
              <TabsTrigger value="collections" className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Folder className="w-4 h-4" /> Collections
              </TabsTrigger>
            </TabsList>

            {activeTab === "watchlist" && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 rounded-full bg-muted/50 h-9 text-sm" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 rounded-full h-9 w-9"><SortAsc className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("date")} className={sortBy === "date" ? "bg-accent" : ""}><Clock className="w-4 h-4 mr-2" />Date Added</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("rating")} className={sortBy === "rating" ? "bg-accent" : ""}><Star className="w-4 h-4 mr-2" />Rating</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")} className={sortBy === "title" ? "bg-accent" : ""}><SortAsc className="w-4 h-4 mr-2" />Title</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setSortBy("custom"); setIsDragMode(!isDragMode); }}>
                      <GripVertical className="w-4 h-4 mr-2" />{isDragMode ? "Exit Reorder" : "Drag to Reorder"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex bg-muted/50 rounded-full p-0.5">
                  <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-full transition-colors", viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50")}><Grid3X3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-full transition-colors", viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/50")}><List className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {activeTab === "collections" && (
              <Button onClick={() => setIsCreateCollectionOpen(true)} className="gap-2 rounded-full h-9 text-sm">
                <Plus className="w-4 h-4" /> New Collection
              </Button>
            )}
          </div>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="mt-6">
            {isLoading ? (
              <div className={cn(viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-3")}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn("bg-muted animate-pulse rounded-xl", viewMode === "grid" ? "aspect-[2/3]" : "h-20")} />
                ))}
              </div>
            ) : filteredWatchlist.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Bookmark className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {searchQuery ? "No movies found" : "Start building your list"}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
                  {searchQuery ? "Try a different search term" : "Discover movies and add them to your watchlist"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate("/")} className="rounded-full gap-2"><Sparkles className="w-4 h-4" />Discover Movies</Button>
                )}
              </motion.div>
            ) : viewMode === "grid" ? (
              isDragMode ? (
                <Reorder.Group axis="x" values={filteredWatchlist} onReorder={handleReorder} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredWatchlist.map(movie => (
                    <Reorder.Item key={movie.id} value={movie} className="group relative cursor-grab active:cursor-grabbing">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm ring-1 ring-border/30 group-hover:ring-primary/50 transition-all">
                        {movie.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted"><Film className="w-10 h-10" /></div>
                        )}
                        <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                          <GripVertical className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs font-medium mt-2 line-clamp-1 text-foreground">{movie.title}</p>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredWatchlist.map((movie, index) => (
                      <motion.div key={movie.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: Math.min(index * 0.02, 0.2) }} whileHover={{ y: -6 }} className="group relative cursor-pointer" onClick={() => handleMovieClick(movie)}>
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-border/20 group-hover:ring-primary/40">
                          {movie.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted"><Film className="w-10 h-10" /></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <h3 className="font-semibold text-sm text-white line-clamp-2">{movie.title}</h3>
                            <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
                              {movie.release_year && <span>{movie.release_year}</span>}
                              {movie.rating ? <><span>•</span><span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{movie.rating.toFixed(1)}</span></> : null}
                            </div>
                          </div>
                        </div>
                        <motion.button onClick={e => { e.stopPropagation(); removeFromWatchlist(movie.movie_id); }} whileTap={{ scale: 0.85 }} className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <div className="space-y-2">
                {isDragMode ? (
                  <Reorder.Group axis="y" values={filteredWatchlist} onReorder={handleReorder} className="space-y-2">
                    {filteredWatchlist.map(movie => (
                      <Reorder.Item key={movie.id} value={movie} className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all">
                        <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          {movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate text-base">{movie.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            {movie.release_year && <span>{movie.release_year}</span>}
                            {movie.rating ? <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{movie.rating.toFixed(1)}</span> : null}
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredWatchlist.map((movie, index) => (
                      <motion.div key={movie.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: Math.min(index * 0.02, 0.2) }} className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer" onClick={() => handleMovieClick(movie)}>
                        <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          {movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate text-base">{movie.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            {movie.release_year && <span>{movie.release_year}</span>}
                            {movie.rating ? <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{movie.rating.toFixed(1)}</span> : null}
                          </div>
                          {movie.overview && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{movie.overview}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); removeFromWatchlist(movie.movie_id); }} className="shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            {collectionsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-muted animate-pulse rounded-2xl" />)}
              </div>
            ) : collections.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Folder className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">No collections yet</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">Organize your movies into themed collections</p>
                <Button onClick={() => setIsCreateCollectionOpen(true)} className="rounded-full gap-2"><FolderPlus className="w-4 h-4" />Create Collection</Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {collections.map((collection, index) => (
                    <motion.div key={collection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }} className="group relative">
                      <div className="p-5 h-full bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleViewCollection(collection)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 rounded-xl bg-primary/10"><Folder className="w-5 h-5 text-primary" /></div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); deleteCollection(collection.id); }}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Movie poster strip */}
                        {collection.movies && collection.movies.length > 0 && (
                          <div className="flex -space-x-3 mb-4">
                            {collection.movies.slice(0, 4).map((m: any) => (
                              <div key={m.id} className="w-10 h-14 rounded-lg overflow-hidden border-2 border-card bg-muted shrink-0">
                                {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                              </div>
                            ))}
                            {collection.movies.length > 4 && (
                              <div className="w-10 h-14 rounded-lg border-2 border-card bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">+{collection.movies.length - 4}</div>
                            )}
                          </div>
                        )}

                        <h3 className="font-semibold text-lg text-foreground mb-1">{collection.name}</h3>
                        {collection.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{collection.description}</p>}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">{collection.movies?.length || 0} movies</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <ExpandedMovieView movie={selectedMovie} isOpen={isExpanded} onClose={handleClose} />

      {/* Create Collection Dialog */}
      <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FolderPlus className="w-5 h-5" />Create Collection</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} placeholder="Weekend Favorites" className="mt-1.5 rounded-xl" /></div>
            <div><Label htmlFor="desc">Description</Label><Textarea id="desc" value={newCollectionDesc} onChange={e => setNewCollectionDesc(e.target.value)} placeholder="A curated list of..." rows={3} className="mt-1.5 resize-none rounded-xl" /></div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateCollectionOpen(false)} className="flex-1 rounded-full">Cancel</Button>
              <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()} className="flex-1 rounded-full">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Collection Dialog */}
      <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {selectedCollection && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Folder className="w-5 h-5 text-primary" />{selectedCollection.name}</DialogTitle></DialogHeader>
              <div className="mt-4">
                {collectionMovies.length === 0 ? (
                  <div className="text-center py-12"><Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No movies yet — add some from any movie page</p></div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
                    {collectionMovies.map(movie => (
                      <div key={movie.id} className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                        {movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-muted-foreground" /></div>}
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
  );
};

export default Watchlist;
