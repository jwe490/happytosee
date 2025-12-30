import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// TMDb genre ID mapping
const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// Reverse mapping: genre name to TMDb ID
const genreNameToId: Record<string, number> = {
  "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
  "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
  "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749, "sci-fi": 878,
  "science fiction": 878, "tv movie": 10770, "thriller": 53, "war": 10752, "western": 37
};

// Language name to ISO code mapping
const languageToCode: Record<string, string> = {
  "english": "en",
  "hindi": "hi",
  "spanish": "es",
  "french": "fr",
  "korean": "ko",
  "japanese": "ja",
  "tamil": "ta",
  "telugu": "te",
  "german": "de",
  "italian": "it",
  "chinese": "zh",
  "portuguese": "pt",
};

// Industry to language/region mapping
const industryMapping: Record<string, { language: string; region?: string }> = {
  "bollywood": { language: "hi", region: "IN" },
  "hollywood": { language: "en", region: "US" },
  "korean cinema": { language: "ko", region: "KR" },
  "japanese cinema": { language: "ja", region: "JP" },
  "tollywood": { language: "te", region: "IN" },
  "kollywood": { language: "ta", region: "IN" },
  "french cinema": { language: "fr", region: "FR" },
  "spanish cinema": { language: "es", region: "ES" },
};

// Mood to genre mapping (used as fallback when no genres selected)
const moodGenreMapping: Record<string, number[]> = {
  happy: [35, 10751, 16, 10402], // Comedy, Family, Animation, Music
  sad: [18, 10749], // Drama, Romance
  romantic: [10749, 35, 18], // Romance, Comedy, Drama
  stressed: [35, 16, 10751], // Comedy, Animation, Family
  excited: [28, 12, 878, 53], // Action, Adventure, Sci-Fi, Thriller
  bored: [28, 12, 53, 9648], // Action, Adventure, Thriller, Mystery
  nostalgic: [18, 10751, 14], // Drama, Family, Fantasy
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, languages, genres, industries, duration, previouslyRecommended } = await req.json();
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Request params:", { mood, languages, genres, industries, duration });

    // PRIORITY 1: Determine language filter from industry or explicit language selection
    let targetLanguage: string | null = null;
    let targetRegion: string | null = null;

    // Industry takes priority (e.g., Bollywood = Hindi movies)
    if (industries && industries.length > 0) {
      const industry = industries[0].toLowerCase();
      const industryConfig = industryMapping[industry];
      if (industryConfig) {
        targetLanguage = industryConfig.language;
        targetRegion = industryConfig.region || null;
        console.log(`Industry filter applied: ${industry} -> language: ${targetLanguage}, region: ${targetRegion}`);
      }
    }

    // If no industry, use explicit language selection
    if (!targetLanguage && languages && languages.length > 0) {
      const lang = languages[0].toLowerCase();
      targetLanguage = languageToCode[lang] || lang;
      console.log(`Language filter applied: ${languages[0]} -> ${targetLanguage}`);
    }

    // PRIORITY 2: Determine genre filter - user-selected genres take priority over mood
    let targetGenreIds: number[] = [];
    
    if (genres && genres.length > 0) {
      // Use user-selected genres
      targetGenreIds = genres
        .map((g: string) => genreNameToId[g.toLowerCase()])
        .filter((id: number | undefined): id is number => id !== undefined);
      console.log(`User genres applied: ${genres.join(", ")} -> IDs: ${targetGenreIds.join(", ")}`);
    }
    
    // If no user genres, use mood-based genres as fallback
    if (targetGenreIds.length === 0 && mood) {
      targetGenreIds = moodGenreMapping[mood.toLowerCase()] || [28, 35, 18];
      console.log(`Mood genres fallback: ${mood} -> IDs: ${targetGenreIds.join(", ")}`);
    }

    // Build TMDb query with proper filters
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      sort_by: "vote_average.desc",
      "vote_count.gte": "100",
      page: String(Math.floor(Math.random() * 3) + 1), // Random page 1-3 for variety
      language: "en-US", // For response language, not filter
    });

    // Apply genre filter (use all selected genres with AND logic via with_genres)
    if (targetGenreIds.length > 0) {
      // TMDb: comma = AND, pipe = OR. Using comma for strict matching
      queryParams.set("with_genres", targetGenreIds.join(","));
    }

    // Apply language filter (this is the critical filter for Bollywood/regional content)
    if (targetLanguage) {
      queryParams.set("with_original_language", targetLanguage);
    }

    // Apply region filter if available
    if (targetRegion) {
      queryParams.set("region", targetRegion);
    }

    const tmdbUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
    console.log("TMDb query URL:", tmdbUrl.replace(TMDB_API_KEY, "***"));

    const tmdbResponse = await fetch(tmdbUrl);
    
    if (!tmdbResponse.ok) {
      const errorText = await tmdbResponse.text();
      console.error("TMDb API error:", tmdbResponse.status, errorText);
      throw new Error(`TMDb API error: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    let movies: TMDbMovie[] = tmdbData.results || [];
    
    console.log(`Fetched ${movies.length} movies from TMDb`);

    // If we got too few results with strict filters, try relaxing genre filter
    if (movies.length < 5 && targetGenreIds.length > 1) {
      console.log("Too few results, trying with OR logic for genres...");
      queryParams.set("with_genres", targetGenreIds.join("|")); // Use OR instead of AND
      const relaxedUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`;
      const relaxedResponse = await fetch(relaxedUrl);
      if (relaxedResponse.ok) {
        const relaxedData = await relaxedResponse.json();
        if (relaxedData.results && relaxedData.results.length > movies.length) {
          movies = relaxedData.results;
          console.log(`Relaxed query returned ${movies.length} movies`);
        }
      }
    }

    // Filter out previously recommended movies
    if (previouslyRecommended?.length > 0) {
      movies = movies.filter(m => !previouslyRecommended.includes(m.title));
      console.log(`After filtering previously recommended: ${movies.length} movies`);
    }

    // Take 10-12 movies
    const selectedMovies = movies.slice(0, 12);

    if (selectedMovies.length === 0) {
      console.log("No movies found with current filters");
      return new Response(JSON.stringify({ 
        movies: [],
        message: "No movies found matching your criteria. Try adjusting your filters."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to generate mood-matching explanations
    const movieTitles = selectedMovies.map(m => m.title).join(", ");
    
    const aiPrompt = `For each of these movies, provide a short 1-sentence explanation of why it matches a "${mood}" mood. Movies: ${movieTitles}. 

Return ONLY a JSON object where keys are movie titles and values are the mood match explanations. Example:
{"Movie Title": "This uplifting story will boost your spirits with its heartwarming journey."}`;

    console.log("Getting AI mood explanations...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: aiPrompt }
        ],
      }),
    });

    let moodExplanations: Record<string, string> = {};
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          moodExplanations = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log("Could not parse AI explanations, using defaults");
      }
    }

    // Format movies with TMDb data
    const formattedMovies = selectedMovies.map((movie) => {
      const genreNames = movie.genre_ids
        .slice(0, 2)
        .map(id => genreMap[id] || "Drama")
        .join(", ");
      
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
      
      // Determine industry based on language
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
          : `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`,
        moodMatch: moodExplanations[movie.title] || `Perfect for your ${mood} mood with its engaging storyline.`,
        overview: movie.overview,
      };
    });

    console.log(`Returning ${formattedMovies.length} formatted movies`);
    console.log("Sample movie languages:", formattedMovies.slice(0, 3).map(m => `${m.title}: ${m.language}`));

    return new Response(JSON.stringify({ movies: formattedMovies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in recommend-movies function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get recommendations";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
