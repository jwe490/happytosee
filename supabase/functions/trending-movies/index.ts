import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { category } = await req.json();

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");

    const cat = (category || "trending") as "trending" | "top_rated" | "upcoming";
    const endpointByCat: Record<typeof cat, string> = {
      trending: `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
      top_rated: `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`,
      upcoming: `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`,
    };

    const url = endpointByCat[cat] ?? endpointByCat.trending;
    console.log("Trending movies:", { category: cat, url: url.replace(TMDB_API_KEY, "***") });

    const response = await fetch(url);
    if (!response.ok) {
      const t = await response.text();
      console.error("TMDb error:", response.status, t);
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();

    const movies = (data.results || []).slice(0, 10).map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? new Date(m.release_date).getFullYear() : null,
      rating: Math.round((m.vote_average || 0) * 10) / 10,
      posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
      genre:
        m.genre_ids?.slice(0, 2).map((id: number) => genreMap[id] || "").filter(Boolean).join(", ") ||
        "Drama",
    }));

    return new Response(JSON.stringify({ movies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in trending-movies function:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch trending movies";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});