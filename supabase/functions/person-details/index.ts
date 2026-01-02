import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w300";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { personId } = await req.json();
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    if (!personId) {
      throw new Error("Person ID is required");
    }

    console.log("Fetching details for person:", personId);

    // Fetch person details and movie credits in parallel
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`),
    ]);

    if (!detailsRes.ok) {
      throw new Error(`Failed to fetch person details: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };

    console.log("Fetched person details:", details.name);

    // Get filmography sorted by popularity, limited to top 12
    const filmography = credits.cast
      ?.filter((m: any) => m.poster_path)
      .sort((a: any, b: any) => b.popularity - a.popularity)
      .slice(0, 12)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        character: movie.character,
        posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
        rating: Math.round(movie.vote_average * 10) / 10,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      })) || [];

    const personDetails = {
      id: details.id,
      name: details.name,
      biography: details.biography || null,
      birthday: details.birthday || null,
      deathday: details.deathday || null,
      placeOfBirth: details.place_of_birth || null,
      profileUrl: details.profile_path 
        ? `${TMDB_PROFILE_BASE}${details.profile_path}`
        : null,
      knownFor: details.known_for_department || "Acting",
      filmography,
    };

    console.log("Returning person details with", filmography.length, "movies");

    return new Response(JSON.stringify(personDetails), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in person-details function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get person details";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});