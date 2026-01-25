// Supabase Edge Function for trending movies with language/type filtering

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

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

const languageToCode: Record<string, string> = {
  "english": "en", "hindi": "hi", "spanish": "es", "french": "fr",
  "korean": "ko", "japanese": "ja", "tamil": "ta", "telugu": "te",
  "german": "de", "italian": "it", "chinese": "zh", "portuguese": "pt",
};

const industryMapping: Record<string, { language: string; region?: string }> = {
  "bollywood": { language: "hi", region: "IN" },
  "hollywood": { language: "en", region: "US" },
  "korean": { language: "ko", region: "KR" },
  "korean cinema": { language: "ko", region: "KR" },
  "japanese cinema": { language: "ja", region: "JP" },
  "tollywood": { language: "te", region: "IN" },
  "kollywood": { language: "ta", region: "IN" },
};

type TrendingCategory = 'trending' | 'top_rated' | 'upcoming';

interface RequestBody {
  category?: TrendingCategory;
  language?: string;
  movieType?: string;
}

// Simple validation function
function validateInput(body: unknown): { valid: boolean; error?: string; data?: RequestBody } {
  if (!body || typeof body !== 'object') {
    return { valid: true, data: { category: 'trending' } };
  }
  
  const b = body as Record<string, unknown>;
  
  const category = b.category as TrendingCategory | undefined;
  if (category !== undefined && category !== 'trending' && category !== 'top_rated' && category !== 'upcoming') {
    return { valid: false, error: "Category must be 'trending', 'top_rated', or 'upcoming'" };
  }
  
  const language = typeof b.language === 'string' ? b.language.slice(0, 30) : undefined;
  const movieType = typeof b.movieType === 'string' ? b.movieType.slice(0, 50) : undefined;
  
  return { 
    valid: true, 
    data: { 
      category: category || 'trending',
      language,
      movieType,
    } 
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validationResult = validateInput(body);
    if (!validationResult.valid || !validationResult.data) {
      return new Response(JSON.stringify({ error: validationResult.error || "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { category = 'trending', language, movieType } = validationResult.data;

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");

    // Determine target language and region from movieType or language
    let targetLanguage: string | null = null;
    let targetRegion: string | null = null;

    if (movieType && movieType !== 'any') {
      const industryConfig = industryMapping[movieType.toLowerCase()];
      if (industryConfig) {
        targetLanguage = industryConfig.language;
        targetRegion = industryConfig.region || null;
      }
    }

    if (!targetLanguage && language && language !== 'any') {
      targetLanguage = languageToCode[language.toLowerCase()] || language;
    }

    // Build URL based on whether we need filtering
    let url: string;
    
    if (targetLanguage) {
      // Use discover endpoint for filtered results
      const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        sort_by: category === 'top_rated' ? 'vote_average.desc' : 'popularity.desc',
        'vote_count.gte': '100',
        with_original_language: targetLanguage,
      });
      
      if (targetRegion) {
        queryParams.set('region', targetRegion);
      }
      
      if (category === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        queryParams.set('primary_release_date.gte', today);
        queryParams.set('primary_release_date.lte', nextMonth);
      }
      
      url = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    } else {
      // Use default endpoints for unfiltered results
      const endpointByCat: Record<TrendingCategory, string> = {
        trending: `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
        top_rated: `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`,
        upcoming: `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`,
      };
      url = endpointByCat[category];
    }

    console.log("Trending movies:", { category, language, movieType, targetLanguage, url: url.replace(TMDB_API_KEY, "***") });

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
      backdropUrl: m.backdrop_path ? `${TMDB_BACKDROP_BASE}${m.backdrop_path}` : null,
      overview: m.overview,
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
