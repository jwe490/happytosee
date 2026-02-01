import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface HistoryStateData {
  scrollPosition: number;
  movieId?: number;
  depth: number;
  previousPath: string;
  returnTo?: string;
  fromMovieTitle?: string;
}

export function useHistoryState() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollPositionRef = useRef<number>(0);
  const scrollRestoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save scroll position on scroll with debouncing
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
      // Clear any existing timeout
      if (scrollRestoreTimeoutRef.current) {
        clearTimeout(scrollRestoreTimeoutRef.current);
      }

      // Use multiple attempts to ensure scroll position is restored
      const scrollToPosition = (attempt = 0) => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: state.scrollPosition,
            behavior: "instant",
          });

          // Verify scroll position was set correctly (within 10px tolerance)
          if (attempt < 3 && Math.abs(window.scrollY - state.scrollPosition) > 10) {
            scrollRestoreTimeoutRef.current = setTimeout(() => scrollToPosition(attempt + 1), 100);
          }
        });
      };

      scrollToPosition();
    }

    return () => {
      if (scrollRestoreTimeoutRef.current) {
        clearTimeout(scrollRestoreTimeoutRef.current);
      }
    };
  }, [location.key]);

  const pushState = useCallback((movieId: number, path?: string, additionalState?: Partial<HistoryStateData>) => {
    const currentState = location.state as HistoryStateData | undefined;
    const currentDepth = currentState?.depth ?? 0;

    const newState: HistoryStateData = {
      scrollPosition: scrollPositionRef.current,
      movieId,
      depth: currentDepth + 1,
      previousPath: location.pathname + location.search,
      ...additionalState,
    };

    const targetPath = path || `${location.pathname}?movie=${movieId}`;

    navigate(targetPath, {
      state: newState,
      replace: false,
    });
  }, [navigate, location]);

  const goBack = useCallback(() => {
    const state = location.state as HistoryStateData | undefined;

    // Priority 1: Explicit return path
    if (state?.returnTo) {
      navigate(state.returnTo, {
        state: {
          scrollPosition: state.scrollPosition,
          depth: Math.max(0, (state.depth ?? 1) - 1),
        },
        replace: false, // Don't replace - allow forward navigation
      });
      return;
    }

    // Priority 2: Previous path from state
    if (state?.previousPath && state.depth && state.depth > 0) {
      navigate(state.previousPath, {
        state: {
          scrollPosition: state.scrollPosition,
          depth: Math.max(0, state.depth - 1),
        },
        replace: false,
      });
      return;
    }

    // Priority 3: Browser history if available and has depth
    const canGoBack = typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;
    if (state?.depth && state.depth > 0 && canGoBack) {
      window.history.back();
      return;
    }
    
    // Fallback: go to home
    navigate("/", { replace: true });
  }, [navigate, location.state]);

  const replaceState = useCallback((movieId: number, additionalState?: Partial<HistoryStateData>) => {
    const currentState = location.state as HistoryStateData | undefined;

    const newState: HistoryStateData = {
      scrollPosition: currentState?.scrollPosition ?? scrollPositionRef.current,
      movieId,
      depth: currentState?.depth ?? 0,
      previousPath: currentState?.previousPath ?? location.pathname,
      ...additionalState,
    };

    navigate(`${location.pathname}?movie=${movieId}`, {
      state: newState,
      replace: true,
    });
  }, [navigate, location]);

  const navigateToPersonWithReturn = useCallback((personId: number, movieTitle: string, movieId: number) => {
    const returnTo = `${location.pathname}${location.search}`;
    const currentState = location.state as HistoryStateData | undefined;

    navigate(`/person/${personId}`, {
      state: {
        returnTo,
        fromMovie: movieId,
        fromMovieTitle: movieTitle,
        depth: (currentState?.depth ?? 0) + 1,
        scrollPosition: scrollPositionRef.current,
      },
    });
  }, [navigate, location]);

  return {
    pushState,
    goBack,
    replaceState,
    navigateToPersonWithReturn,
    currentDepth: (location.state as HistoryStateData | undefined)?.depth ?? 0,
    currentMovieId: (location.state as HistoryStateData | undefined)?.movieId,
    returnTo: (location.state as HistoryStateData | undefined)?.returnTo,
  };
}
