// Supabase Edge Function for movie search

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// TMDb genre ID mapping
const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const langToName: Record<string, string> = {
  "en": "English",
  "hi": "Hindi",
  "ta": "Tamil",
  "te": "Telugu",
  "ko": "Korean",
  "ja": "Japanese",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "zh": "Chinese",
  "pt": "Portuguese",
  "it": "Italian",
};

const langToIndustry: Record<string, string> = {
  "hi": "Bollywood",
  "ta": "Kollywood",
  "te": "Tollywood",
  "ko": "Korean Cinema",
  "ja": "Japanese Cinema",
  "en": "Hollywood",
  "fr": "French Cinema",
  "es": "Spanish Cinema",
};

// Simple validation function
function validateSearchQuery(body: unknown): { valid: boolean; error?: string; query?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  
  const b = body as Record<string, unknown>;
  
  if (typeof b.query !== 'string') {
    return { valid: false, error: "Search query is required" };
  }
  
  const query = b.query.trim().slice(0, 100);
  
  if (query.length < 2) {
    return { valid: false, error: "Search query must be at least 2 characters" };
  }
  
  return { valid: true, query };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = validateSearchQuery(body);
    if (!validationResult.valid || !validationResult.query) {
      return new Response(JSON.stringify({ movies: [], message: validationResult.error || "Invalid input" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = validationResult.query;

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    console.log("Searching for:", query);

    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: query,
      language: "en-US",
      page: "1",
      include_adult: "false",
    });

    const searchUrl = `${TMDB_BASE_URL}/search/movie?${queryParams.toString()}`;
    console.log("TMDb search URL:", searchUrl.replace(TMDB_API_KEY, "***"));

    const tmdbResponse = await fetch(searchUrl);
    
    if (!tmdbResponse.ok) {
      const errorText = await tmdbResponse.text();
      console.error("TMDb API error:", tmdbResponse.status, errorText);
      throw new Error(`TMDb API error: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    const movies = (tmdbData.results || []).slice(0, 12);
    
    console.log(`Found ${movies.length} movies for query: ${query}`);

    // Format movies
    const formattedMovies = movies.map((movie: any) => {
      const genreNames = (movie.genre_ids || [])
        .slice(0, 2)
        .map((id: number) => genreMap[id] || "Drama")
        .join(", ");
      
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
      
      return {
        id: movie.id,
        title: movie.title,
        year,
        rating: Math.round((movie.vote_average || 0) * 10) / 10,
        genre: genreNames || "Drama",
        language: langToName[movie.original_language] || movie.original_language?.toUpperCase() || "Unknown",
        industry: langToIndustry[movie.original_language] || "International",
        posterUrl: movie.poster_path 
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`,
        moodMatch: movie.overview?.slice(0, 150) || "A great movie to watch.",
        overview: movie.overview || "",
      };
    });

    return new Response(JSON.stringify({ movies: formattedMovies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in search-movies function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search movies";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
