// Supabase Edge Function for AI-powered movie search

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

// Smart keyword extraction for movie descriptions
function extractSearchQueries(description: string): string[] {
  const queries: string[] = [];
  
  // Extract quoted titles
  const quotedMatches = description.match(/["'「」]([^"'「」]+)["'「」]/g);
  if (quotedMatches) {
    quotedMatches.forEach(m => queries.push(m.replace(/["'「」]/g, '').trim()));
  }
  
  // Extract actor/director names (capitalized word pairs)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  const names = description.match(namePattern);
  if (names) {
    names.forEach(name => {
      // Filter out common non-name phrases
      const skipWords = ['The Movie', 'The Film', 'The One', 'This Movie', 'That Movie', 'Blue Alien', 'Red Dragon'];
      if (!skipWords.some(s => name.toLowerCase() === s.toLowerCase())) {
        queries.push(name);
      }
    });
  }
  
  // Extract words after "called", "named", "titled"
  const titlePatterns = /(?:called|named|titled|name is|movie is)\s+["']?([^"',\.]+)["']?/gi;
  let match;
  while ((match = titlePatterns.exec(description)) !== null) {
    queries.push(match[1].trim());
  }
  
  // Extract words after "starring", "with", "featuring" for actor searches
  const actorPatterns = /(?:starring|with|featuring|acted by|played by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  while ((match = actorPatterns.exec(description)) !== null) {
    queries.push(match[1].trim());
  }
  
  // Extract character names after "character named/called"
  const charPatterns = /(?:character\s+(?:named|called)|alien\s+(?:named|called))\s+["']?(\w+)["']?/gi;
  while ((match = charPatterns.exec(description)) !== null) {
    queries.push(match[1].trim());
  }

  // If no specific terms found, use cleaned-up description
  if (queries.length === 0) {
    // Remove common filler words and use remaining keywords
    const stopWords = new Set(['a', 'an', 'the', 'is', 'was', 'were', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'that', 'this', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how', 'movie', 'film', 'about', 'with', 'and', 'but', 'or', 'not', 'no', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'don', 'now', 'in', 'on', 'at', 'to', 'for', 'of', 'from', 'by', 'up', 'out', 'off', 'over', 'under', 'again', 'there', 'here', 'all', 'each', 'some', 'any', 'most', 'other', 'into', 'one', 'two']);
    
    const keywords = description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    // Take meaningful keyword groups
    if (keywords.length > 0) {
      queries.push(keywords.slice(0, 5).join(' '));
      // Also try just the first 3 keywords as a more focused search
      if (keywords.length > 3) {
        queries.push(keywords.slice(0, 3).join(' '));
      }
    }
  }
  
  // Also add the full description as a last resort search
  if (description.length <= 60) {
    queries.push(description);
  }

  // Deduplicate
  return [...new Set(queries)].slice(0, 6);
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

    // Handle "describe" type
    if (type === "describe") {
      if (!description) {
        return new Response(JSON.stringify({
          movies: [],
          message: "Please provide a description of the movie you're looking for."
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Extract smart search queries from description
      const searchQueries = extractSearchQueries(description);
      console.log("Extracted search queries:", searchQueries);

      const allMovies: any[] = [];
      const seenIds = new Set<number>();

      // Search TMDb with each query
      for (const term of searchQueries) {
        try {
          // Try movie search
          const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`;
          console.log("Searching TMDb for:", term);
          const searchResponse = await fetch(searchUrl);

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const results = searchData.results || [];
            console.log(`Found ${results.length} results for "${term}"`);

            for (const movie of results.slice(0, 5)) {
              if (!seenIds.has(movie.id) && movie.poster_path) {
                seenIds.add(movie.id);
                allMovies.push({
                  id: movie.id,
                  title: movie.title,
                  year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                  rating: Math.round(movie.vote_average * 10) / 10,
                  posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
                  overview: movie.overview,
                  confidence: searchQueries.indexOf(term) === 0 ? "high" : "medium",
                  matchReason: `Matches: "${term}"`,
                });
              }
            }
          }

          // Also try person search for actor names
          const personUrl = `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`;
          const personResponse = await fetch(personUrl);
          
          if (personResponse.ok) {
            const personData = await personResponse.json();
            const persons = personData.results || [];
            
            for (const person of persons.slice(0, 2)) {
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

      console.log(`Returning ${Math.min(allMovies.length, 12)} movies total`);

      return new Response(JSON.stringify({
        movies: allMovies.slice(0, 12),
        searchTerms: searchQueries,
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
      const surpriseReasons = [
        "A hidden gem you might love!", "Critics loved this one!",
        "Underrated masterpiece", "Perfect for your mood",
        "You won't regret this pick", "A fan favorite",
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
