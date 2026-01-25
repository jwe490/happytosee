const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { movieId, page = 1 } = await req.json();

    if (!movieId || typeof movieId !== "number") {
      return new Response(JSON.stringify({ error: "Invalid movie ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch similar movies: ${response.status}`);
    }

    const data = await response.json();

    const similarMovies = data.results
      ?.filter((m: any) => m.poster_path)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
        rating: Math.round(movie.vote_average * 10) / 10,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      })) || [];

    return new Response(
      JSON.stringify({
        movies: similarMovies,
        page: data.page,
        totalPages: data.total_pages,
        hasMore: data.page < data.total_pages,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in similar-movies function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch similar movies";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
