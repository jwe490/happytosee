// Supabase Edge Function for movie recommendations

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  overview: string;
}

const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const genreNameToId: Record<string, number> = {
  "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
  "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
  "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749, "sci-fi": 878,
  "science fiction": 878, "tv movie": 10770, "thriller": 53, "war": 10752, "western": 37
};

const languageToCode: Record<string, string> = {
  "english": "en", "hindi": "hi", "spanish": "es", "french": "fr",
  "korean": "ko", "japanese": "ja", "tamil": "ta", "telugu": "te",
  "german": "de", "italian": "it", "chinese": "zh", "portuguese": "pt",
};

const industryMapping: Record<string, { language: string; region?: string }> = {
  "bollywood": { language: "hi", region: "IN" },
  "hollywood": { language: "en", region: "US" },
  "korean cinema": { language: "ko", region: "KR" },
  "japanese cinema": { language: "ja", region: "JP" },
  "tollywood": { language: "te", region: "IN" },
  "kollywood": { language: "ta", region: "IN" },
};

const moodGenreMapping: Record<string, number[]> = {
  happy: [35, 10751, 16],
  sad: [18, 10749],
  romantic: [10749, 35],
  relaxed: [18, 35],
  excited: [28, 12, 878],
  bored: [28, 12, 53],
  nostalgic: [18, 10751],
};

const moodTemplates: Record<string, string[]> = {
  happy: [
    "This uplifting film will brighten your mood",
    "Perfect feel-good entertainment for joyful moments",
    "A heartwarming story that celebrates life",
    "Guaranteed to put a smile on your face",
  ],
  sad: [
    "A touching drama that resonates emotionally",
    "This poignant story offers comfort and understanding",
    "An emotional journey that connects with your feelings",
    "A beautifully crafted tale of human emotion",
  ],
  romantic: [
    "A beautiful love story that warms the heart",
    "Romance at its finest in this enchanting film",
    "This charming tale of love will sweep you away",
    "Perfect for those seeking heartfelt romance",
  ],
  relaxed: [
    "A laid-back film perfect for unwinding",
    "Easy-going entertainment for a chill evening",
    "Sit back and enjoy this comfortable watch",
    "The perfect movie for a relaxed viewing",
  ],
  excited: [
    "Non-stop thrills that keep you on the edge",
    "High-octane entertainment packed with action",
    "An adrenaline-pumping adventure awaits",
    "Explosive action that delivers excitement",
  ],
  bored: [
    "This captivating film will grab your attention",
    "An engaging story that breaks the monotony",
    "Surprising twists that keep you hooked",
    "Fresh entertainment to spark your interest",
  ],
  nostalgic: [
    "A timeless classic that brings back memories",
    "This film captures the essence of bygone eras",
    "A journey back to simpler, cherished times",
    "Reminiscent of the movies you grew up loving",
  ],
};

// Simple validation function (no external dependencies)
function validateInput(body: unknown): { 
  valid: boolean; 
  error?: string; 
  data?: { 
    mood?: string; 
    languages?: string[]; 
    genres?: string[]; 
    industries?: string[]; 
    duration?: string; 
    previouslyRecommended?: string[];
    hiddenGems?: boolean;
    maxRuntime?: number;
  } 
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  
  const b = body as Record<string, unknown>;
  
  const mood = typeof b.mood === 'string' ? b.mood.slice(0, 50) : undefined;
  const languages = Array.isArray(b.languages) ? b.languages.filter(l => typeof l === 'string').slice(0, 5).map(l => String(l).slice(0, 30)) : [];
  const genres = Array.isArray(b.genres) ? b.genres.filter(g => typeof g === 'string').slice(0, 5).map(g => String(g).slice(0, 50)) : [];
  const industries = Array.isArray(b.industries) ? b.industries.filter(i => typeof i === 'string').slice(0, 3).map(i => String(i).slice(0, 50)) : [];
  const duration = typeof b.duration === 'string' ? b.duration.slice(0, 20) : undefined;
  const previouslyRecommended = Array.isArray(b.previouslyRecommended) ? b.previouslyRecommended.filter(p => typeof p === 'string').slice(0, 100).map(p => String(p).slice(0, 200)) : [];
  const hiddenGems = typeof b.hiddenGems === 'boolean' ? b.hiddenGems : false;
  const maxRuntime = typeof b.maxRuntime === 'number' ? Math.min(Math.max(b.maxRuntime, 60), 300) : 240;
  
  return { valid: true, data: { mood, languages, genres, industries, duration, previouslyRecommended, hiddenGems, maxRuntime } };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validationResult = validateInput(body);
    if (!validationResult.valid || !validationResult.data) {
      return new Response(JSON.stringify({ error: validationResult.error || "Invalid input", movies: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mood, languages, genres, industries, duration, previouslyRecommended, hiddenGems, maxRuntime } = validationResult.data;

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");

    if (!TMDB_API_KEY) {
      return new Response(JSON.stringify({
        error: "Movie service is not configured. Please contact support.",
        movies: []
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Request params:", { mood, languages, genres, industries, duration, hiddenGems, maxRuntime });

    let targetLanguage: string | null = null;
    let targetRegion: string | null = null;

    if (industries && industries.length > 0) {
      const industry = industries[0].toLowerCase();
      const industryConfig = industryMapping[industry];
      if (industryConfig) {
        targetLanguage = industryConfig.language;
        targetRegion = industryConfig.region || null;
      }
    }

    if (!targetLanguage && languages && languages.length > 0) {
      const lang = languages[0].toLowerCase();
      targetLanguage = languageToCode[lang] || lang;
    }

    let targetGenreIds: number[] = [];

    if (genres && genres.length > 0) {
      targetGenreIds = genres
        .map((g: string) => genreNameToId[g.toLowerCase()])
        .filter((id: number | undefined): id is number => id !== undefined);
    }

    if (targetGenreIds.length === 0 && mood) {
      targetGenreIds = moodGenreMapping[mood.toLowerCase()] || [28, 35, 18];
    }

    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      sort_by: "vote_average.desc",
      page: String(Math.floor(Math.random() * 5) + 1),
      language: "en-US",
    });

    // Hidden Gems Mode - highly rated but not blockbusters
    if (hiddenGems) {
      queryParams.set("vote_average.gte", "7.0");
      queryParams.set("vote_count.gte", "200");
      queryParams.set("vote_count.lte", "5000");
    } else {
      queryParams.set("vote_count.gte", "100");
    }

    // Runtime filter
    if (maxRuntime && maxRuntime < 240) {
      queryParams.set("with_runtime.lte", String(maxRuntime));
    }

    if (targetGenreIds.length > 0) {
      queryParams.set("with_genres", targetGenreIds.join(","));
    }

    if (targetLanguage) {
      queryParams.set("with_original_language", targetLanguage);
    }

    if (targetRegion) {
      queryParams.set("region", targetRegion);
    }

    const tmdbUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    console.log("Fetching from TMDb...");

    const tmdbResponse = await fetch(tmdbUrl);

    if (!tmdbResponse.ok) {
      throw new Error(`TMDb API error: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    let movies: TMDbMovie[] = tmdbData.results || [];

    console.log(`Fetched ${movies.length} movies from TMDb`);

    if (movies.length < 5 && targetGenreIds.length > 1) {
      queryParams.set("with_genres", targetGenreIds[0].toString());
      const relaxedUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
      const relaxedResponse = await fetch(relaxedUrl);
      if (relaxedResponse.ok) {
        const relaxedData = await relaxedResponse.json();
        if (relaxedData.results && relaxedData.results.length > movies.length) {
          movies = relaxedData.results;
        }
      }
    }

    if (previouslyRecommended && previouslyRecommended.length > 0) {
      movies = movies.filter(m => !previouslyRecommended.includes(m.title));
    }

    const selectedMovies = movies.slice(0, 12);

    if (selectedMovies.length === 0) {
      return new Response(JSON.stringify({
        movies: [],
        message: "No movies found. Try different filters."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const templates = moodTemplates[mood?.toLowerCase() || ""] || [
      "A great movie matching your current mood",
      "Perfect entertainment for right now",
      "This film fits your vibe perfectly",
      "Exactly what you're looking for",
    ];

    const formattedMovies = selectedMovies.map((movie, index) => {
      const genreNames = movie.genre_ids
        .slice(0, 2)
        .map(id => genreMap[id] || "Drama")
        .join(", ");

      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

      const langToIndustry: Record<string, string> = {
        "hi": "Bollywood", "ta": "Kollywood", "te": "Tollywood",
        "ko": "Korean Cinema", "ja": "Japanese Cinema", "en": "Hollywood",
        "fr": "French Cinema", "es": "Spanish Cinema",
      };

      const langToName: Record<string, string> = {
        "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
        "ko": "Korean", "ja": "Japanese", "es": "Spanish", "fr": "French",
        "de": "German", "zh": "Chinese", "pt": "Portuguese", "it": "Italian",
      };

      const template = templates[index % templates.length];

      return {
        id: movie.id,
        title: movie.title,
        year,
        rating: Math.round(movie.vote_average * 10) / 10,
        genre: genreNames,
        language: langToName[movie.original_language] || movie.original_language.toUpperCase(),
        industry: langToIndustry[movie.original_language] || "International",
        posterUrl: movie.poster_path
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : `https://via.placeholder.com/400x600/1a1a1a/ffffff?text=${encodeURIComponent(movie.title)}`,
        moodMatch: template,
        overview: movie.overview,
      };
    });

    console.log(`Returning ${formattedMovies.length} movies`);

    return new Response(JSON.stringify({ movies: formattedMovies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get recommendations";
    return new Response(JSON.stringify({
      error: errorMessage,
      movies: []
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
