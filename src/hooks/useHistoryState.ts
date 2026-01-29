import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface HistoryStateData {
  scrollPosition: number;
  movieId?: number;
  depth: number;
  previousPath: string;
}

export function useHistoryState() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollPositionRef = useRef<number>(0);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore scroll position when navigating back
  useEffect(() => {
    const state = location.state as HistoryStateData | undefined;
    
    if (state?.scrollPosition !== undefined) {
      // Use requestAnimationFrame for smooth scroll restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: "instant",
        });
      });
    }
  }, [location.key]);

  const pushState = useCallback((movieId: number, path?: string) => {
    const currentState = location.state as HistoryStateData | undefined;
    const currentDepth = currentState?.depth ?? 0;
    
    const newState: HistoryStateData = {
      scrollPosition: scrollPositionRef.current,
      movieId,
      depth: currentDepth + 1,
      previousPath: location.pathname + location.search,
    };

    const targetPath = path || `${location.pathname}?movie=${movieId}`;
    
    navigate(targetPath, {
      state: newState,
      replace: false,
    });
  }, [navigate, location]);

  const goBack = useCallback(() => {
    const state = location.state as HistoryStateData | undefined;
    
    if (state?.depth && state.depth > 0) {
      // Navigate back in history
      window.history.back();
    } else {
      // No history state, go to home
      navigate("/", { replace: true });
    }
  }, [navigate, location.state]);

  const replaceState = useCallback((movieId: number) => {
    const currentState = location.state as HistoryStateData | undefined;
    
    const newState: HistoryStateData = {
      scrollPosition: currentState?.scrollPosition ?? scrollPositionRef.current,
      movieId,
      depth: currentState?.depth ?? 0,
      previousPath: currentState?.previousPath ?? location.pathname,
    };

    navigate(`${location.pathname}?movie=${movieId}`, {
      state: newState,
      replace: true,
    });
  }, [navigate, location]);

  return {
    pushState,
    goBack,
    replaceState,
    currentDepth: (location.state as HistoryStateData | undefined)?.depth ?? 0,
    currentMovieId: (location.state as HistoryStateData | undefined)?.movieId,
  };
}
