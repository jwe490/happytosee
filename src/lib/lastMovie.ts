/**
 * Persist last-opened movie info in sessionStorage so breadcrumbs can link back
 * even after the modal is closed.
 */

const STORAGE_KEY = "moodflix_last_movie";

export interface LastMovieInfo {
  id: number;
  title: string;
  returnTo: string; // e.g. "/?movie=123"
}

export function saveLastMovie(info: LastMovieInfo) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Ignore storage errors
  }
}

export function getLastMovie(): LastMovieInfo | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastMovieInfo;
  } catch {
    return null;
  }
}

export function clearLastMovie() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
