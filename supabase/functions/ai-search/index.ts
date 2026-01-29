// Supabase Edge Function for AI-powered movie search

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Simple validation function
function validateAISearchInput(body: unknown): {
  valid: boolean;
  error?: string;
  data?: {
    description?: string;
    type: 'describe' | 'summary' | 'surprise';
    movieTitle?: string;
    movieOverview?: string;
    mood?: string;
    excludeIds?: number[];
  }
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  const type = b.type;
  if (type !== 'describe' && type !== 'summary' && type !== 'surprise') {
    return { valid: false, error: "Type must be 'describe', 'summary', or 'surprise'" };
  }

  const description = typeof b.description === 'string' ? b.description.slice(0, 500) : undefined;
  const movieTitle = typeof b.movieTitle === 'string' ? b.movieTitle.slice(0, 200) : undefined;
  const movieOverview = typeof b.movieOverview === 'string' ? b.movieOverview.slice(0, 1000) : undefined;
  const mood = typeof b.mood === 'string' ? b.mood.slice(0, 50) : undefined;
  const excludeIds = Array.isArray(b.excludeIds)
    ? b.excludeIds.filter(id => typeof id === 'number' && Number.isInteger(id) && id > 0).slice(0, 100)
    : [];

  return { valid: true, data: { description, type, movieTitle, movieOverview, mood, excludeIds } };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validationResult = validateAISearchInput(body);
    if (!validationResult.valid || !validationResult.data) {
      return new Response(JSON.stringify({ error: validationResult.error || "Invalid input", movies: [], movie: null }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description, type, movieTitle, movieOverview, mood, excludeIds } = validationResult.data;

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!TMDB_API_KEY) {
      return new Response(JSON.stringify({
        error: "Movie service is not configured.",
        movies: []
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("AI search request:", { description, type, hasGeminiKey: !!GEMINI_API_KEY });

    // Handle "describe" type - use AI to parse natural language
    if (type === "describe") {
      if (!description) {
        return new Response(JSON.stringify({
          movies: [],
          message: "Please provide a description of the movie you're looking for."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let searchTerms: string[] = [];
      let aiConfidence = "low";

      // Use Gemini API directly to extract movie titles from description
      if (GEMINI_API_KEY) {
        try {
          console.log("Calling Gemini API...");
          const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a movie identification expert. Given a user's description of a movie (which may include plot details, actor names, character names, themes, or partial/misspelled titles), identify the most likely movie(s) they're looking for.

Return ONLY a valid JSON object in this exact format, nothing else:
{"movies": ["Movie Title 1", "Movie Title 2"], "confidence": "high"}

Rules:
- Return 1-5 movie titles, most likely first
- Use correct official English titles
- If user mentions actor names, identify their movies matching the description
- If description is vague, provide best guesses
- confidence must be "high", "medium", or "low"
- Return ONLY the JSON, no markdown, no explanation

User description: ${description}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 300,
              }
            }),
          });

          console.log("Gemini response status:", aiResponse.status);

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            console.log("Gemini raw response:", content);

            // Parse JSON from AI response - handle potential markdown wrapper
            try {
              // Remove any markdown code blocks
              let cleanContent = content.trim();
              if (cleanContent.startsWith("```json")) {
                cleanContent = cleanContent.slice(7);
              } else if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent.slice(3);
              }
              if (cleanContent.endsWith("```")) {
                cleanContent = cleanContent.slice(0, -3);
              }
              cleanContent = cleanContent.trim();

              const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed.movies) && parsed.movies.length > 0) {
                  searchTerms = parsed.movies.filter((m: unknown) => typeof m === 'string');
                  aiConfidence = parsed.confidence || "medium";
                  console.log("Parsed movies from AI:", searchTerms);
                }
              }
            } catch (parseErr) {
              console.log("Couldn't parse AI JSON:", parseErr);
            }
          } else {
            const errorText = await aiResponse.text();
            console.error("Gemini API error:", aiResponse.status, errorText);
          }
        } catch (aiErr) {
          console.error("AI error:", aiErr);
        }
      } else {
        console.log("No Gemini API key configured");
      }

      // Smart fallback: extract likely movie-related terms
      if (searchTerms.length === 0) {
        console.log("Using fallback: extracting keywords from description");
        // Extract actor names, titles, and key phrases
        const lowerDesc = description.toLowerCase();
        
        // Common patterns to extract
        const actorPatterns = /(?:with|starring|featuring)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi;
        const actorMatch = description.match(actorPatterns);
        
        // Use the full description but also try shorter key phrases
        searchTerms = [description.slice(0, 100)];
        
        // If description mentions an actor, also search by actor name
        if (actorMatch) {
          const actorName = actorMatch[0].replace(/(?:with|starring|featuring)\s+/i, '');
          searchTerms.unshift(actorName); // Search actor first
        }
      }

      // Search TMDB for each identified title
      const allMovies: any[] = [];
      const seenIds = new Set<number>();

      for (const term of searchTerms.slice(0, 5)) {
        try {
          const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`;
          console.log("Searching TMDb for:", term);
          const searchResponse = await fetch(searchUrl);

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const results = searchData.results || [];
            console.log(`Found ${results.length} results for "${term}"`);
            
            for (const movie of results.slice(0, 5)) {
              if (!seenIds.has(movie.id)) {
                seenIds.add(movie.id);
                allMovies.push({
                  id: movie.id,
                  title: movie.title,
                  year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                  rating: Math.round(movie.vote_average * 10) / 10,
                  posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                  overview: movie.overview,
                  confidence: searchTerms.indexOf(term) === 0 ? "high" : searchTerms.indexOf(term) === 1 ? "medium" : "low",
                  matchReason: `Matches: "${term}"`,
                });
              }
            }
          }
        } catch (err) {
          console.error("Search error for term:", term, err);
        }
      }

      console.log(`Returning ${allMovies.length} movies total`);

      return new Response(JSON.stringify({
        movies: allMovies.slice(0, 10),
        searchTerms,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle "summary" type
    if (type === "summary") {
      if (!movieTitle) {
        return new Response(JSON.stringify({ error: "Movie title is required for summary" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        summary: movieOverview || "No summary available for this movie."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle "surprise" type - get truly random fresh results
    if (type === "surprise") {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const randomYear = 1990 + Math.floor(Math.random() * 35); // 1990-2025
      const excludeSet = new Set(excludeIds || []);

      // Build discover URL with randomization
      let discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=200&page=${randomPage}&primary_release_year=${randomYear}`;

      // Add mood-based genre
      if (mood) {
        const moodToGenre: Record<string, string> = {
          "happy": "35,10751", // Comedy, Family
          "sad": "18", // Drama
          "romantic": "10749", // Romance
          "excited": "28,12", // Action, Adventure
          "bored": "53,9648", // Thriller, Mystery
          "nostalgic": "18,10751", // Drama, Family
          "relaxed": "35,16", // Comedy, Animation
          "adventurous": "12,14", // Adventure, Fantasy
        };
        const genreId = moodToGenre[mood.toLowerCase()];
        if (genreId) {
          discoverUrl += `&with_genres=${genreId}`;
        }
      }

      const discoverResponse = await fetch(discoverUrl);

      if (!discoverResponse.ok) {
        throw new Error(`TMDb discover error: ${discoverResponse.status}`);
      }

      const discoverData = await discoverResponse.json();
      let results = (discoverData.results || []).filter((m: any) => !excludeSet.has(m.id));

      if (results.length === 0) {
        // Fallback to popular movies
        const fallbackUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${Math.floor(Math.random() * 10) + 1}`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          results = (fallbackData.results || []).filter((m: any) => !excludeSet.has(m.id));
        }
      }

      if (results.length === 0) {
        return new Response(JSON.stringify({
          movie: null,
          message: "Couldn't find a surprise recommendation. Try again!"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const randomIndex = Math.floor(Math.random() * Math.min(results.length, 10));
      const tmdbMovie = results[randomIndex];

      const surpriseReasons = [
        "A hidden gem you might love!",
        "Critics loved this one!",
        "Underrated masterpiece",
        "Perfect for your mood",
        "You won't regret this pick",
        "A fan favorite",
      ];

      return new Response(JSON.stringify({
        movie: {
          id: tmdbMovie.id,
          title: tmdbMovie.title,
          year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
          rating: Math.round(tmdbMovie.vote_average * 10) / 10,
          posterUrl: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}` : null,
          overview: tmdbMovie.overview,
          surpriseReason: surpriseReasons[Math.floor(Math.random() * surpriseReasons.length)],
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type. Use 'describe', 'summary', or 'surprise'." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-search function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return new Response(JSON.stringify({
      error: errorMessage,
      movies: [],
      movie: null
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});