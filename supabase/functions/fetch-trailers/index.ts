const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
  10752: "War", 37: "Western",
};

interface TrailerMovie {
  id: number;
  title: string;
  year: number | null;
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  genres: string[];
  trailerKey: string | null;
}

async function getTrailerKey(movieId: number, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${apiKey}`);
    if (!res.ok) { await res.text(); return null; }
    const data = await res.json();
    const trailer = (data.results || []).find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    ) || (data.results || []).find(
      (v: any) => v.site === "YouTube"
    );
    return trailer?.key || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");

    const body = await req.json().catch(() => ({}));
    const page = Math.min(Math.max(Number(body.page) || 1, 1), 10);
    const topGenres: string[] = Array.isArray(body.topGenres) ? body.topGenres.slice(0, 5) : [];

    // Fetch trending movies
    let url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`;
    
    // If user has genre preferences, use discover for personalization
    if (topGenres.length > 0) {
      const genreIds = Object.entries(genreMap)
        .filter(([_, name]) => topGenres.some(g => g.toLowerCase() === name.toLowerCase()))
        .map(([id]) => id);
      if (genreIds.length > 0) {
        url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&vote_count.gte=50&with_genres=${genreIds.join(",")}&page=${page}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      const t = await response.text();
      console.error("TMDB error:", response.status, t);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.results || []).slice(0, 10);

    // Fetch trailers in parallel
    const trailerPromises = results.map((m: any) => getTrailerKey(m.id, TMDB_API_KEY));
    const trailerKeys = await Promise.all(trailerPromises);

    const trailers: TrailerMovie[] = results
      .map((m: any, i: number) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? new Date(m.release_date).getFullYear() : null,
        rating: Math.round((m.vote_average || 0) * 10) / 10,
        posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
        backdropUrl: m.backdrop_path ? `${TMDB_BACKDROP_BASE}${m.backdrop_path}` : null,
        overview: m.overview || "",
        genres: (m.genre_ids || []).map((id: number) => genreMap[id] || "").filter(Boolean),
        trailerKey: trailerKeys[i],
      }))
      .filter((t: TrailerMovie) => t.trailerKey !== null);

    return new Response(JSON.stringify({ trailers, page, hasMore: page < (data.total_pages || 1) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-trailers:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch trailers";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
