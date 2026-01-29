import { toast } from "@/hooks/use-toast";

/**
 * Navigation guard utilities to prevent silent redirects to homepage.
 * All movie/navigation helpers should use these guards.
 */

export interface MovieData {
  id: number;
  title?: string;
  [key: string]: unknown;
}

/**
 * Validates a movie object before navigation.
 * Returns true if valid, false if invalid (and shows toast).
 */
export function isValidMovieData(movie: unknown, context?: string): movie is MovieData {
  if (!movie || typeof movie !== "object") {
    console.warn(`[NavigationGuard] Invalid movie data (${context || "unknown"}):`, movie);
    toast({
      title: "Navigation Error",
      description: "Could not open movie - invalid data received.",
      variant: "destructive",
    });
    return false;
  }

  const m = movie as Record<string, unknown>;

  if (typeof m.id !== "number" || isNaN(m.id) || m.id <= 0) {
    console.warn(`[NavigationGuard] Invalid movie ID (${context || "unknown"}):`, m.id);
    toast({
      title: "Navigation Error",
      description: "Could not open movie - missing or invalid ID.",
      variant: "destructive",
    });
    return false;
  }

  return true;
}

/**
 * Guard wrapper for movie click handlers.
 * Prevents execution if movie data is invalid.
 */
export function guardedMovieClick<T extends MovieData>(
  handler: (movie: T) => void,
  context?: string
): (movie: unknown) => void {
  return (movie: unknown) => {
    if (isValidMovieData(movie, context)) {
      handler(movie as T);
    }
  };
}

/**
 * Validates a movie ID from URL/params.
 * Returns the parsed ID if valid, null if invalid.
 */
export function validateMovieId(id: string | null | undefined, context?: string): number | null {
  if (!id) return null;

  const parsed = parseInt(id, 10);

  if (isNaN(parsed) || parsed <= 0) {
    console.warn(`[NavigationGuard] Invalid movie ID from URL (${context || "unknown"}):`, id);
    return null;
  }

  return parsed;
}

/**
 * Prevents accidental navigation to homepage by validating destination.
 * Use this before any navigate("/") or navigate(path) calls.
 */
export function shouldAllowNavigation(
  destination: string,
  currentPath: string,
  reason?: string
): boolean {
  // Block silent redirects to homepage from other pages
  if (destination === "/" && currentPath !== "/" && !reason) {
    console.warn(
      `[NavigationGuard] Blocked silent redirect to homepage from ${currentPath}. Provide a reason if intentional.`
    );
    toast({
      title: "Navigation Issue",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    return false;
  }

  return true;
}
