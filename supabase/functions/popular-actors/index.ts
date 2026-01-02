import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { page = 1 } = await req.json();

    const response = await fetch(
      `${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch popular actors");
    }

    const data = await response.json();

    const actors = data.results.map((person: any) => ({
      id: person.id,
      name: person.name,
      profileUrl: person.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : null,
      knownFor: person.known_for_department || "Acting",
      popularity: person.popularity,
      knownForMovies: person.known_for
        ? person.known_for.slice(0, 3).map((movie: any) => ({
            id: movie.id,
            title: movie.title || movie.name,
            posterUrl: movie.poster_path
              ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
              : null,
          }))
        : [],
    }));

    return new Response(
      JSON.stringify({
        actors,
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});