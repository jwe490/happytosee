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

// More comprehensive language mappings
const languageToCode: Record<string, string> = {
  "english": "en", "hindi": "hi", "spanish": "es", "french": "fr",
  "korean": "ko", "japanese": "ja", "tamil": "ta", "telugu": "te",
  "german": "de", "italian": "it", "chinese": "zh", "portuguese": "pt",
  "malayalam": "ml", "kannada": "kn", "bengali": "bn", "marathi": "mr",
  "punjabi": "pa", "gujarati": "gu",
};

// Industry mapping - key is lowercase, includes language codes for TMDb filtering
const industryMapping: Record<string, { language: string; region?: string; name: string }> = {
  "bollywood": { language: "hi", region: "IN", name: "Bollywood" },
  "hollywood": { language: "en", region: "US", name: "Hollywood" },
  "korean cinema": { language: "ko", region: "KR", name: "Korean Cinema" },
  "korean": { language: "ko", region: "KR", name: "Korean Cinema" },
  "japanese cinema": { language: "ja", region: "JP", name: "Japanese Cinema" },
  "japanese": { language: "ja", region: "JP", name: "Japanese Cinema" },
  "tollywood": { language: "te", region: "IN", name: "Tollywood" },
  "kollywood": { language: "ta", region: "IN", name: "Kollywood" },
  "mollywood": { language: "ml", region: "IN", name: "Mollywood" },
  "sandalwood": { language: "kn", region: "IN", name: "Sandalwood" },
  "french cinema": { language: "fr", region: "FR", name: "French Cinema" },
  "spanish cinema": { language: "es", region: "ES", name: "Spanish Cinema" },
  "chinese cinema": { language: "zh", region: "CN", name: "Chinese Cinema" },
};

const moodGenreMapping: Record<string, number[]> = {
  happy: [35, 10751, 16],
  sad: [18, 10749],
  romantic: [10749, 35, 18],
  bored: [28, 12, 53],
  relaxed: [18, 35, 10402],
  nostalgic: [18, 10751, 36],
  motivated: [18, 36, 99],
  angry: [28, 53, 80],
  anxiety: [35, 10751, 16],
  tired: [35, 16, 10402],
  inspired: [18, 99, 36],
  confused: [9648, 878, 35],
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
  bored: [
    "This captivating film will grab your attention",
    "An engaging story that breaks the monotony",
    "Surprising twists that keep you hooked",
    "Fresh entertainment to spark your interest",
  ],
  relaxed: [
    "A laid-back film perfect for unwinding",
    "Easy-going entertainment for a chill evening",
    "Sit back and enjoy this comfortable watch",
    "The perfect movie for a relaxed viewing",
  ],
  nostalgic: [
    "A timeless classic that brings back memories",
    "This film captures the essence of bygone eras",
    "A journey back to simpler, cherished times",
    "Reminiscent of the movies you grew up loving",
  ],
  motivated: [
    "An inspiring story of triumph and success",
    "Fuel your drive with this motivational film",
    "Stories of perseverance that push you forward",
    "Get inspired by these incredible journeys",
  ],
  angry: [
    "Channel that energy with this intense film",
    "Action-packed thrills to match your fire",
    "Let it out with this gripping experience",
    "High-stakes drama for when you need release",
  ],
  anxiety: [
    "A calming watch to ease your mind",
    "Light-hearted comfort for anxious moments",
    "Feel-good entertainment to help you relax",
    "A gentle story to soothe your nerves",
  ],
  tired: [
    "Easy watching for when you need to unwind",
    "A comfortable film that requires no effort",
    "Perfect for tired eyes and weary minds",
    "Gentle entertainment for a restful evening",
  ],
  inspired: [
    "A thought-provoking film that sparks creativity",
    "Stories that ignite your imagination",
    "Beautiful narratives that inspire change",
    "Visionary filmmaking that opens new perspectives",
  ],
  confused: [
    "A clear and engaging story to follow",
    "Entertainment that makes perfect sense",
    "A straightforward yet captivating watch",
    "Simple pleasures in this well-crafted film",
  ],
};

// Mood to genre ID mapping for Date Night Mixer
const moodToGenreId: Record<string, number> = {
  romantic: 10749,
  comedy: 35,
  action: 28,
  drama: 18,
  horror: 27,
  thriller: 53,
  adventure: 12,
  animation: 16,
  documentary: 99,
  scifi: 878,
  mystery: 9648,
  fantasy: 14,
  family: 10751,
  war: 10752,
  crime: 80,
  music: 10402,
  history: 36,
  western: 37,
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
    dateNightMoods?: [string, string] | null;
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
  
  // Date Night Moods - array of two mood strings
  let dateNightMoods: [string, string] | null = null;
  if (Array.isArray(b.dateNightMoods) && b.dateNightMoods.length === 2) {
    const mood1 = typeof b.dateNightMoods[0] === 'string' ? b.dateNightMoods[0].slice(0, 50) : null;
    const mood2 = typeof b.dateNightMoods[1] === 'string' ? b.dateNightMoods[1].slice(0, 50) : null;
    if (mood1 && mood2) {
      dateNightMoods = [mood1, mood2];
    }
  }
  
  return { valid: true, data: { mood, languages, genres, industries, duration, previouslyRecommended, hiddenGems, maxRuntime, dateNightMoods } };
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

    const { mood, languages, genres, industries, duration, previouslyRecommended, hiddenGems, maxRuntime, dateNightMoods } = validationResult.data;

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

    console.log("Request params:", JSON.stringify({ mood, languages, genres, industries, duration, hiddenGems, maxRuntime, dateNightMoods }));

    // Check if Date Night Mixer is active
    const isDateNightMode = dateNightMoods && dateNightMoods.length === 2;

    let targetLanguage: string | null = null;
    let targetRegion: string | null = null;
    let industryName: string | null = null;

    // Process industries first (highest priority for language filtering)
    if (industries && industries.length > 0) {
      const industry = industries[0].toLowerCase();
      const industryConfig = industryMapping[industry];
      if (industryConfig) {
        targetLanguage = industryConfig.language;
        targetRegion = industryConfig.region || null;
        industryName = industryConfig.name;
        console.log(`Industry filter: ${industryName} -> language: ${targetLanguage}, region: ${targetRegion}`);
      }
    }

    // Process languages if no industry set
    if (!targetLanguage && languages && languages.length > 0) {
      const lang = languages[0].toLowerCase();
      targetLanguage = languageToCode[lang] || lang;
      console.log(`Language filter: ${lang} -> ${targetLanguage}`);
    }

    let targetGenreIds: number[] = [];

    // Date Night Mixer: Use combined genres from two moods
    if (isDateNightMode && dateNightMoods) {
      const genre1 = moodToGenreId[dateNightMoods[0].toLowerCase()];
      const genre2 = moodToGenreId[dateNightMoods[1].toLowerCase()];
      if (genre1) targetGenreIds.push(genre1);
      if (genre2) targetGenreIds.push(genre2);
      console.log(`Date Night Mode: Combining ${dateNightMoods[0]} (${genre1}) + ${dateNightMoods[1]} (${genre2})`);
    } else if (genres && genres.length > 0) {
      // User-selected genres take priority
      targetGenreIds = genres
        .map((g: string) => genreNameToId[g.toLowerCase()])
        .filter((id: number | undefined): id is number => id !== undefined);
      console.log(`User genre filter: ${genres.join(", ")} -> ${targetGenreIds.join(", ")}`);
    }

    // Only add mood-based genres if no explicit genres selected
    if (targetGenreIds.length === 0 && mood) {
      targetGenreIds = moodGenreMapping[mood.toLowerCase()] || [];
      console.log(`Mood genre mapping: ${mood} -> ${targetGenreIds.join(", ")}`);
    }

    // Build the TMDb discover URL
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      sort_by: "popularity.desc", // Changed from vote_average to get more relevant results
      page: String(Math.floor(Math.random() * 3) + 1), // Reduced random pages for better results
      language: "en-US",
    });

    // Hidden Gems Mode - highly rated but not blockbusters
    if (hiddenGems) {
      queryParams.set("vote_average.gte", "7.0");
      queryParams.set("vote_count.gte", "100");
      queryParams.set("vote_count.lte", "5000");
      queryParams.set("sort_by", "vote_average.desc");
    } else {
      queryParams.set("vote_count.gte", "50"); // Lower threshold for regional cinema
    }

    // Runtime filter
    if (maxRuntime && maxRuntime < 240) {
      queryParams.set("with_runtime.lte", String(maxRuntime));
    }

    // Genre filter - use OR logic (|) for mood-based, AND logic (,) for user-selected
    if (targetGenreIds.length > 0) {
      // Use OR logic for better results with regional cinema
      queryParams.set("with_genres", targetGenreIds.join("|"));
    }

    // Language filter - critical for regional cinema accuracy
    if (targetLanguage) {
      queryParams.set("with_original_language", targetLanguage);
    }

    // Region filter
    if (targetRegion) {
      queryParams.set("region", targetRegion);
    }

    const tmdbUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    console.log("Fetching from TMDb:", tmdbUrl.replace(TMDB_API_KEY, "***"));

    const tmdbResponse = await fetch(tmdbUrl);

    if (!tmdbResponse.ok) {
      throw new Error(`TMDb API error: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    let movies: TMDbMovie[] = tmdbData.results || [];

    console.log(`Fetched ${movies.length} movies from TMDb`);

    // If we got too few results, try relaxing the filters
    if (movies.length < 10 && targetLanguage) {
      console.log("Trying to fetch more movies with relaxed filters...");
      
      // Try without genre filter
      const relaxedParams = new URLSearchParams(queryParams);
      relaxedParams.delete("with_genres");
      relaxedParams.set("page", "1");
      
      const relaxedUrl = `${TMDB_BASE_URL}/discover/movie?${relaxedParams.toString()}`;
      const relaxedResponse = await fetch(relaxedUrl);
      
      if (relaxedResponse.ok) {
        const relaxedData = await relaxedResponse.json();
        const relaxedMovies = relaxedData.results || [];
        console.log(`Relaxed filter found ${relaxedMovies.length} movies`);
        
        // Add non-duplicate movies
        const existingIds = new Set(movies.map(m => m.id));
        for (const movie of relaxedMovies) {
          if (!existingIds.has(movie.id)) {
            movies.push(movie);
            existingIds.add(movie.id);
          }
        }
      }
    }

    // Date Night Mixer fallback: Try OR logic if AND returns few results
    if (isDateNightMode && movies.length < 5 && targetGenreIds.length === 2) {
      console.log("Date Night: Too few results, trying relaxed query...");
      queryParams.set("with_genres", targetGenreIds.join("|")); // OR operator
      queryParams.delete("with_original_language"); // Remove language filter
      const orUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
      const orResponse = await fetch(orUrl);
      if (orResponse.ok) {
        const orData = await orResponse.json();
        if (orData.results && orData.results.length > movies.length) {
          movies = orData.results;
          console.log(`Date Night fallback: Found ${movies.length} movies`);
        }
      }
    }

    // Filter out previously recommended
    if (previouslyRecommended && previouslyRecommended.length > 0) {
      const prevSet = new Set(previouslyRecommended.map(t => t.toLowerCase()));
      movies = movies.filter(m => !prevSet.has(m.title.toLowerCase()));
    }

    const selectedMovies = movies.slice(0, 20);

    if (selectedMovies.length === 0) {
      return new Response(JSON.stringify({
        movies: [],
        message: "No movies found. Try different filters."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Special templates for Date Night mode
    const dateNightTemplates = [
      "Perfect for a cozy date night together 💕",
      "A romantic pick for two 🎬",
      "Great choice for couples movie night",
      "Ideal blend of both your moods",
      "This one will make you both happy!",
    ];

    const templates = isDateNightMode 
      ? dateNightTemplates
      : moodTemplates[mood?.toLowerCase() || ""] || [
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
        "ml": "Mollywood", "kn": "Sandalwood", "bn": "Tollywood",
        "ko": "Korean Cinema", "ja": "Japanese Cinema", "en": "Hollywood",
        "fr": "French Cinema", "es": "Spanish Cinema", "zh": "Chinese Cinema",
      };

      const langToName: Record<string, string> = {
        "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
        "ml": "Malayalam", "kn": "Kannada", "bn": "Bengali", "mr": "Marathi",
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
        industry: industryName || langToIndustry[movie.original_language] || "International",
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