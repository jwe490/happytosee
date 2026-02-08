// Supabase Edge Function for AI-powered movie search using Lovable AI (Gemini)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

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

// Use Gemini AI via Lovable AI Gateway to extract search terms
async function aiExtractSearchTerms(description: string): Promise<{ titles: string[]; actors: string[]; keywords: string[] }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.log("No LOVABLE_API_KEY, falling back to keyword extraction");
    return fallbackExtract(description);
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a movie identification expert. Extract search terms from user descriptions to find movies on TMDb. Be thorough and identify all possible movie titles, actor names, director names, and meaningful keywords."
          },
          {
            role: "user",
            content: `From this movie description, extract search terms:\n\n"${description}"\n\nRespond with a JSON object containing:\n- titles: array of possible movie titles mentioned or implied\n- actors: array of actor/director names mentioned\n- keywords: array of key descriptive terms (genre, theme, plot elements)\n\nOnly respond with valid JSON, no markdown.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_search_terms",
              description: "Extract movie search terms from a description",
              parameters: {
                type: "object",
                properties: {
                  titles: { type: "array", items: { type: "string" }, description: "Possible movie titles" },
                  actors: { type: "array", items: { type: "string" }, description: "Actor or director names" },
                  keywords: { type: "array", items: { type: "string" }, description: "Key descriptive terms" }
                },
                required: ["titles", "actors", "keywords"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_search_terms" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      return fallbackExtract(description);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      console.log("AI extracted terms:", parsed);
      return {
        titles: parsed.titles || [],
        actors: parsed.actors || [],
        keywords: parsed.keywords || [],
      };
    }

    return fallbackExtract(description);
  } catch (err) {
    console.error("AI extraction error:", err);
    return fallbackExtract(description);
  }
}

// Fallback keyword extraction without AI
function fallbackExtract(description: string): { titles: string[]; actors: string[]; keywords: string[] } {
  const titles: string[] = [];
  const actors: string[] = [];
  const keywords: string[] = [];

  // Extract quoted titles
  const quotedMatches = description.match(/["'「」]([^"'「」]+)["'「」]/g);
  if (quotedMatches) {
    quotedMatches.forEach(m => titles.push(m.replace(/["'「」]/g, '').trim()));
  }

  // Extract actor/director names (capitalized word pairs)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  const names = description.match(namePattern);
  if (names) {
    const skipWords = ['The Movie', 'The Film', 'The One', 'This Movie', 'Blue Alien'];
    names.forEach(name => {
      if (!skipWords.some(s => name.toLowerCase() === s.toLowerCase())) {
        actors.push(name);
      }
    });
  }

  // Extract words after naming patterns
  let match;
  const titlePatterns = /(?:called|named|titled|name is|movie is)\s+["']?([^"',\.]+)["']?/gi;
  while ((match = titlePatterns.exec(description)) !== null) titles.push(match[1].trim());

  const actorPatterns = /(?:starring|with|featuring|acted by|played by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  while ((match = actorPatterns.exec(description)) !== null) actors.push(match[1].trim());

  // Keywords from remaining
  if (titles.length === 0 && actors.length === 0) {
    const stopWords = new Set(['a','an','the','is','was','were','are','have','has','had','do','does','did','will','would','could','should','that','this','i','me','my','we','you','he','she','it','they','what','which','who','where','when','why','how','movie','film','about','with','and','but','or','not','in','on','at','to','for','of','from','by']);
    const kws = description.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    keywords.push(...kws.slice(0, 6));
  }

  return { titles, actors, keywords };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validationResult = validateAISearchInput(body);
    if (!validationResult.valid || !validationResult.data) {
      return new Response(JSON.stringify({ error: validationResult.error || "Invalid input", movies: [], movie: null }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description, type, movieTitle, movieOverview, mood, excludeIds } = validationResult.data;
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");

    if (!TMDB_API_KEY) {
      return new Response(JSON.stringify({ error: "Movie service is not configured.", movies: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("AI search request:", { description, type });

    // Handle "describe" type - now powered by Gemini AI
    if (type === "describe") {
      if (!description) {
        return new Response(JSON.stringify({
          movies: [],
          message: "Please provide a description of the movie you're looking for."
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Use AI to extract smart search terms
      const { titles, actors, keywords } = await aiExtractSearchTerms(description);
      const searchQueries = [...titles, ...actors, ...keywords.slice(0, 3)];
      
      // Also add the raw description as a search if short enough
      if (description.length <= 60 && searchQueries.length === 0) {
        searchQueries.push(description);
      }
      
      // Deduplicate
      const uniqueQueries = [...new Set(searchQueries)].slice(0, 8);
      console.log("Search queries:", uniqueQueries);

      const allMovies: any[] = [];
      const seenIds = new Set<number>();

      // Search TMDb with each query
      for (const term of uniqueQueries) {
        try {
          // Movie search
          const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`;
          const searchResponse = await fetch(searchUrl);

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            for (const movie of (searchData.results || []).slice(0, 5)) {
              if (!seenIds.has(movie.id) && movie.poster_path) {
                seenIds.add(movie.id);
                const isTitle = titles.some(t => t.toLowerCase() === term.toLowerCase());
                allMovies.push({
                  id: movie.id,
                  title: movie.title,
                  year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                  rating: Math.round(movie.vote_average * 10) / 10,
                  posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
                  overview: movie.overview,
                  confidence: isTitle ? "high" : uniqueQueries.indexOf(term) < 2 ? "high" : "medium",
                  matchReason: `Matches: "${term}"`,
                });
              }
            }
          }

          // Person search for actor queries
          if (actors.includes(term)) {
            const personUrl = `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`;
            const personResponse = await fetch(personUrl);
            
            if (personResponse.ok) {
              const personData = await personResponse.json();
              for (const person of (personData.results || []).slice(0, 2)) {
                if (person.known_for) {
                  for (const work of person.known_for) {
                    if (work.media_type === 'movie' && !seenIds.has(work.id) && work.poster_path) {
                      seenIds.add(work.id);
                      allMovies.push({
                        id: work.id,
                        title: work.title,
                        year: work.release_date ? new Date(work.release_date).getFullYear() : null,
                        rating: Math.round(work.vote_average * 10) / 10,
                        posterUrl: `${TMDB_IMAGE_BASE}${work.poster_path}`,
                        overview: work.overview,
                        confidence: "high",
                        matchReason: `Starring ${person.name}`,
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Search error for term:", term, err);
        }
      }

      // Sort: high confidence first, then by rating
      allMovies.sort((a, b) => {
        const confOrder = { high: 0, medium: 1, low: 2 };
        const confDiff = (confOrder[a.confidence as keyof typeof confOrder] || 2) - (confOrder[b.confidence as keyof typeof confOrder] || 2);
        if (confDiff !== 0) return confDiff;
        return (b.rating || 0) - (a.rating || 0);
      });

      return new Response(JSON.stringify({
        movies: allMovies.slice(0, 12),
        searchTerms: uniqueQueries,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Handle "surprise" type
    if (type === "surprise") {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const randomYear = 1990 + Math.floor(Math.random() * 36);
      const excludeSet = new Set(excludeIds || []);

      let discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=200&page=${randomPage}&primary_release_year=${randomYear}`;

      if (mood) {
        const moodToGenre: Record<string, string> = {
          "happy": "35,10751", "sad": "18", "romantic": "10749",
          "excited": "28,12", "bored": "53,9648", "nostalgic": "18,10751",
          "relaxed": "35,16", "adventurous": "12,14",
        };
        const genreId = moodToGenre[mood.toLowerCase()];
        if (genreId) discoverUrl += `&with_genres=${genreId}`;
      }

      const discoverResponse = await fetch(discoverUrl);
      if (!discoverResponse.ok) throw new Error(`TMDb discover error: ${discoverResponse.status}`);

      const discoverData = await discoverResponse.json();
      let results = (discoverData.results || []).filter((m: any) => !excludeSet.has(m.id));

      if (results.length === 0) {
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
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const randomIndex = Math.floor(Math.random() * Math.min(results.length, 10));
      const tmdbMovie = results[randomIndex];

      return new Response(JSON.stringify({
        movie: {
          id: tmdbMovie.id,
          title: tmdbMovie.title,
          year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
          rating: Math.round(tmdbMovie.vote_average * 10) / 10,
          posterUrl: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}` : null,
          overview: tmdbMovie.overview,
          surpriseReason: "A hidden gem picked just for you ✨",
        }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid type." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-search function:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Failed to process request",
      movies: [], movie: null
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
