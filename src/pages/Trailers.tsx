import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Bookmark, Info, Share2, Play, Pause, Volume2, VolumeX, X, Star, ChevronDown, Lock, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWatchlist } from "@/hooks/useWatchlist";
import { toast } from "sonner";
import logoSvg from "@/assets/logo.svg";

interface Trailer {
  id: number;
  title: string;
  year: number | null;
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  genres: string[];
  trailerKey: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Trailers = () => {
  const navigate = useNavigate();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [showMuteFlash, setShowMuteFlash] = useState(false);
  const [showEdgeHint, setShowEdgeHint] = useState(true);
  const [is2x, setIs2x] = useState(false);
  const [is2xLocked, setIs2xLocked] = useState(false);
  const [showSpeedFlash, setShowSpeedFlash] = useState<string | null>(null);
  const [ytReady, setYtReady] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<any>(null);
  const dragStartY = useRef(0);
  const holdingEdge = useRef(false);

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Load YT API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
    return () => { window.onYouTubeIframeAPIReady = () => {}; };
  }, []);

  // Load saved behavior
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mf_trailer_behavior");
      if (saved) {
        const data = JSON.parse(saved);
        setLikedIds(new Set(data.likedIds || []));
      }
    } catch {}
  }, []);

  // Save behavior
  const saveBehavior = useCallback(() => {
    localStorage.setItem("mf_trailer_behavior", JSON.stringify({
      likedIds: [...likedIds],
    }));
  }, [likedIds]);

  useEffect(() => { saveBehavior(); }, [likedIds, saveBehavior]);

  // Fetch trailers
  const fetchTrailers = useCallback(async (pg: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-trailers", {
        body: { page: pg },
      });
      if (error) throw error;
      if (data?.trailers) {
        setTrailers(prev => pg === 1 ? data.trailers : [...prev, ...data.trailers]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch trailers:", err);
      toast.error("Failed to load trailers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrailers(1); }, [fetchTrailers]);

  // Load more when approaching end
  useEffect(() => {
    if (currentIdx >= trailers.length - 3 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrailers(nextPage);
    }
  }, [currentIdx, trailers.length, hasMore, loading, page, fetchTrailers]);

  // Hide edge hint after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowEdgeHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Create/update YT player
  useEffect(() => {
    if (!ytReady || trailers.length === 0) return;
    const trailer = trailers[currentIdx];
    if (!trailer) return;

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
    }

    playerRef.current = new window.YT.Player("yt-player", {
      videoId: trailer.trailerKey,
      playerVars: {
        autoplay: 1,
        mute: isMuted ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        loop: 1,
        playlist: trailer.trailerKey,
      },
      events: {
        onReady: (e: any) => {
          if (isMuted) e.target.mute(); else e.target.unMute();
          e.target.playVideo();
        },
        onStateChange: (e: any) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
        },
      },
    });
  }, [currentIdx, ytReady, trailers]);

  // Mute sync
  useEffect(() => {
    if (!playerRef.current?.isMuted) return;
    try {
      if (isMuted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {}
  }, [isMuted]);

  // 2x speed
  useEffect(() => {
    if (!playerRef.current?.setPlaybackRate) return;
    try {
      playerRef.current.setPlaybackRate(is2x ? 2 : 1);
    } catch {}
  }, [is2x]);

  const current = trailers[currentIdx];

  const handleScroll = useCallback((dir: "up" | "down") => {
    if (dir === "up" && currentIdx < trailers.length - 1) {
      setCurrentIdx(i => i + 1);
      setShowInfo(false);
    } else if (dir === "down" && currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setShowInfo(false);
    }
  }, [currentIdx, trailers.length]);

  // Touch/scroll handling
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    dragStartY.current = e.touches[0].clientY;

    // Edge detection for 2x speed
    const x = e.touches[0].clientX;
    const w = window.innerWidth;
    if (x < w * 0.15 || x > w * 0.85) {
      holdingEdge.current = true;
      holdTimerRef.current = setTimeout(() => {
        if (holdingEdge.current) {
          setIs2x(true);
          if (navigator.vibrate) navigator.vibrate(30);
        }
      }, 180);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = dragStartY.current - e.touches[0].clientY;
    if (is2x && !is2xLocked && dy > 50) {
      setIs2xLocked(true);
      setShowSpeedFlash("locked");
      setTimeout(() => setShowSpeedFlash(null), 1500);
      if (navigator.vibrate) navigator.vibrate(50);
    }
    if (is2xLocked && dy < -50) {
      setIs2xLocked(false);
      setIs2x(false);
      setShowSpeedFlash("unlocked");
      setTimeout(() => setShowSpeedFlash(null), 1500);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(holdTimerRef.current);
    holdingEdge.current = false;
    if (is2x && !is2xLocked) setIs2x(false);

    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 60) {
      handleScroll(dy > 0 ? "up" : "down");
    } else {
      // Single tap = toggle mute
      setIsMuted(m => !m);
      setShowMuteFlash(true);
      setTimeout(() => setShowMuteFlash(false), 1500);
    }
  };

  // Wheel scroll for desktop
  const wheelTimeout = useRef<any>(null);
  const handleWheel = (e: React.WheelEvent) => {
    clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
      if (e.deltaY > 30) handleScroll("up");
      else if (e.deltaY < -30) handleScroll("down");
    }, 100);
  };

  const toggleLike = () => {
    if (!current) return;
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const toggleSave = async () => {
    if (!current) return;
    if (isInWatchlist(current.id)) {
      await removeFromWatchlist(current.id);
      toast.success("Removed from watchlist");
    } else {
      await addToWatchlist({
        id: current.id,
        title: current.title,
        poster_path: current.posterUrl?.replace("https://image.tmdb.org/t/p/w500", "") || undefined,
        vote_average: current.rating,
        overview: current.overview,
      });
      toast.success("Added to watchlist!");
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch {}
  };

  if (loading && trailers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-white/70 text-sm">Loading trailers...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10 h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img src={logoSvg} alt="MoodFlix" className="h-7 invert" draggable={false} />
        <div className="w-10" />
      </div>

      {/* Edge hint */}
      <AnimatePresence>
        {showEdgeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-0 right-0 z-30 text-center"
          >
            <span className="text-white/50 text-xs bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              hold edges for 2× speed
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2x speed badge */}
      <AnimatePresence>
        {is2x && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30"
          >
            <span className="flex items-center gap-1 text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              2× {is2xLocked && <Lock className="w-3 h-3" />}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed flash */}
      <AnimatePresence>
        {showSpeedFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2">
              {showSpeedFlash === "locked" ? (
                <Lock className="w-16 h-16 text-white" />
              ) : (
                <Unlock className="w-16 h-16 text-white" />
              )}
              <span className="text-white text-lg font-bold">
                {showSpeedFlash === "locked" ? "2× Locked" : "Unlocked"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute flash (Instagram-style) */}
      <AnimatePresence>
        {showMuteFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            {isMuted ? (
              <VolumeX className="w-20 h-20 text-white/70" />
            ) : (
              <Volume2 className="w-20 h-20 text-white/70" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge glow hints */}
      {showEdgeHint && (
        <>
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[15%] z-20 pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: 2 }}
          />
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-[15%] z-20 pointer-events-none"
            style={{ background: "linear-gradient(to left, rgba(255,255,255,0.08), transparent)" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: 2 }}
          />
        </>
      )}

      {/* YouTube Player */}
      <div className="absolute inset-0 z-10">
        {current?.backdropUrl && (
          <img
            src={current.backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(20px) brightness(0.3)", transform: "scale(1.1)" }}
          />
        )}
        <div
          id="yt-player"
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        />
      </div>

      {/* Right action rail */}
      {!showInfo && current && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-5"
        >
          <button onClick={toggleLike} className="flex flex-col items-center gap-1">
            <Heart
              className={`w-7 h-7 ${likedIds.has(current.id) ? "fill-red-500 text-red-500" : "text-white"}`}
            />
            <span className="text-white/70 text-[10px]">Like</span>
          </button>
          <button onClick={toggleSave} className="flex flex-col items-center gap-1">
            <Bookmark
              className={`w-7 h-7 ${isInWatchlist(current.id) ? "fill-white text-white" : "text-white"}`}
            />
            <span className="text-white/70 text-[10px]">Save</span>
          </button>
          <button onClick={() => setShowInfo(true)} className="flex flex-col items-center gap-1">
            <Info className="w-7 h-7 text-white" />
            <span className="text-white/70 text-[10px]">Info</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: current.title,
                  url: `https://www.youtube.com/watch?v=${current.trailerKey}`,
                });
              } else {
                navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${current.trailerKey}`);
                toast.success("Link copied!");
              }
            }}
            className="flex flex-col items-center gap-1"
          >
            <Share2 className="w-7 h-7 text-white" />
            <span className="text-white/70 text-[10px]">Share</span>
          </button>
        </motion.div>
      )}

      {/* Bottom bar */}
      {current && !showInfo && (
        <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {current.posterUrl && (
                <img
                  src={current.posterUrl}
                  alt={current.title}
                  className="w-10 h-14 rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{current.title}</p>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {current.rating}
                  </span>
                  {current.year && <span>{current.year}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/10 h-9 w-9"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(m => !m)}
                className="text-white hover:bg-white/10 h-9 w-9"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {trailers.slice(Math.max(0, currentIdx - 3), currentIdx + 4).map((_, i) => {
              const actualIdx = Math.max(0, currentIdx - 3) + i;
              return (
                <div
                  key={actualIdx}
                  className={`rounded-full transition-all ${
                    actualIdx === currentIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Info pane (30dvh) */}
      <AnimatePresence>
        {showInfo && current && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg rounded-t-2xl"
            style={{ height: "30dvh", minHeight: 220 }}
          >
            <div className="p-4 h-full flex flex-col">
              {/* Drag handle + close */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(false)}
                  className="absolute right-3 top-3 text-white hover:bg-white/10 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-3 flex-1 min-h-0">
                {current.posterUrl && (
                  <img
                    src={current.posterUrl}
                    alt={current.title}
                    className="w-20 h-28 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base truncate">{current.title}</h3>
                  <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {current.rating}
                    </span>
                    {current.year && <span>{current.year}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {current.genres.slice(0, 3).map(g => (
                      <span key={g} className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/60 text-xs mt-2 line-clamp-2">{current.overview}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSave}
                  className="flex-1 text-white border border-white/20 hover:bg-white/10 h-9 text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: current.title, url: `https://www.youtube.com/watch?v=${current.trailerKey}` });
                    }
                  }}
                  className="flex-1 text-white border border-white/20 hover:bg-white/10 h-9 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trailers;
