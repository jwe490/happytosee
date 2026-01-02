const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { description, type, movieTitle, movieOverview, watchHistory, mood } = body;

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

    console.log("AI search request:", { description, type });

    if (type === "describe") {
      if (!description) {
        return new Response(JSON.stringify({
          movies: [],
          message: "Please provide a description of the movie you're looking for."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const searchQuery = description.slice(0, 100);
      const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`;

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(`TMDb search error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const movies = (searchData.results || []).slice(0, 10).map((tmdbMovie: any) => ({
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
        rating: Math.round(tmdbMovie.vote_average * 10) / 10,
        posterUrl: tmdbMovie.poster_path
          ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`
          : null,
        overview: tmdbMovie.overview,
        matchReason: "Matches your search description",
      }));

      return new Response(JSON.stringify({
        movies,
        searchTerms: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "summary") {
      if (!movieTitle) {
        throw new Error("Movie title is required for summary");
      }

      return new Response(JSON.stringify({
        summary: movieOverview || "No summary available for this movie."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "surprise") {
      const randomPage = Math.floor(Math.random() * 10) + 1;

      let discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=500&page=${randomPage}`;

      if (mood) {
        const moodToGenre: Record<string, string> = {
          "happy": "35",
          "sad": "18",
          "romantic": "10749",
          "excited": "28",
          "bored": "53",
          "nostalgic": "18",
          "relaxed": "35",
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
      const results = discoverData.results || [];

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

      return new Response(JSON.stringify({
        movie: {
          id: tmdbMovie.id,
          title: tmdbMovie.title,
          year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
          rating: Math.round(tmdbMovie.vote_average * 10) / 10,
          posterUrl: tmdbMovie.poster_path
            ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`
            : null,
          overview: tmdbMovie.overview,
          surpriseReason: "A hidden gem you might enjoy!",
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
