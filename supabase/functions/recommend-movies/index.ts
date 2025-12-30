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

interface TMDbGenre {
  id: number;
  name: string;
}

// TMDb genre ID mapping
const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// Mood to genre mapping
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

    console.log("Fetching movies for mood:", mood);

    // Get genres based on mood
    const moodGenres = moodGenreMapping[mood.toLowerCase()] || [28, 35, 18];
    const selectedGenre = moodGenres[Math.floor(Math.random() * moodGenres.length)];
    
    // Language mapping
    const languageCode = languages?.[0] === "Hindi" ? "hi" : 
                         languages?.[0] === "Spanish" ? "es" :
                         languages?.[0] === "French" ? "fr" :
                         languages?.[0] === "Korean" ? "ko" :
                         languages?.[0] === "Japanese" ? "ja" : "en";

    // Fetch movies from TMDb with varied pages for diversity
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const tmdbUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre}&sort_by=vote_average.desc&vote_count.gte=500&page=${randomPage}&language=en-US`;
    
    console.log("Fetching from TMDb...");
    const tmdbResponse = await fetch(tmdbUrl);
    
    if (!tmdbResponse.ok) {
      const errorText = await tmdbResponse.text();
      console.error("TMDb API error:", tmdbResponse.status, errorText);
      throw new Error(`TMDb API error: ${tmdbResponse.status}`);
    }

    const tmdbData = await tmdbResponse.json();
    let movies: TMDbMovie[] = tmdbData.results || [];
    
    console.log(`Fetched ${movies.length} movies from TMDb`);

    // Filter out previously recommended movies
    if (previouslyRecommended?.length > 0) {
      movies = movies.filter(m => !previouslyRecommended.includes(m.title));
    }

    // Take 10-12 movies
    const selectedMovies = movies.slice(0, 12);

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
    const formattedMovies = selectedMovies.map((movie, index) => {
      const genreNames = movie.genre_ids
        .slice(0, 2)
        .map(id => genreMap[id] || "Drama")
        .join(", ");
      
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
      
      return {
        id: movie.id,
        title: movie.title,
        year,
        rating: Math.round(movie.vote_average * 10) / 10,
        genre: genreNames,
        language: movie.original_language === "en" ? "English" : 
                  movie.original_language === "hi" ? "Hindi" :
                  movie.original_language === "es" ? "Spanish" :
                  movie.original_language === "fr" ? "French" :
                  movie.original_language === "ko" ? "Korean" :
                  movie.original_language === "ja" ? "Japanese" : 
                  movie.original_language.toUpperCase(),
        industry: movie.original_language === "hi" ? "Bollywood" : 
                  movie.original_language === "ko" ? "Korean Cinema" :
                  movie.original_language === "ja" ? "Japanese Cinema" : "Hollywood",
        posterUrl: movie.poster_path 
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
          : `https://picsum.photos/seed/${encodeURIComponent(movie.title.replace(/\s+/g, ''))}/400/600`,
        moodMatch: moodExplanations[movie.title] || `Perfect for your ${mood} mood with its engaging storyline.`,
        overview: movie.overview,
      };
    });

    console.log(`Returning ${formattedMovies.length} formatted movies`);

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
