import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieId } = await req.json();
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    if (!movieId) {
      throw new Error("Movie ID is required");
    }

    console.log("Fetching details for movie:", movieId);

    // Fetch movie details, credits, and videos in parallel
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
    ]);

    if (!detailsRes.ok) {
      throw new Error(`Failed to fetch movie details: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };
    const videos = videosRes.ok ? await videosRes.json() : { results: [] };

    console.log("Fetched movie details:", details.title);

    // Get top 10 cast members
    const cast = credits.cast?.slice(0, 10).map((person: any) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      profileUrl: person.profile_path 
        ? `${TMDB_PROFILE_BASE}${person.profile_path}`
        : null,
    })) || [];

    // Find the official trailer or any YouTube video
    const trailer = videos.results?.find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    ) || videos.results?.find(
      (v: any) => v.site === "YouTube"
    );

    const movieDetails = {
      id: details.id,
      title: details.title,
      tagline: details.tagline,
      overview: details.overview,
      releaseDate: details.release_date,
      runtime: details.runtime,
      rating: Math.round(details.vote_average * 10) / 10,
      voteCount: details.vote_count,
      posterUrl: details.poster_path 
        ? `${TMDB_IMAGE_BASE}${details.poster_path}`
        : null,
      backdropUrl: details.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : null,
      genres: details.genres?.map((g: any) => g.name) || [],
      budget: details.budget,
      revenue: details.revenue,
      productionCompanies: details.production_companies?.map((c: any) => c.name) || [],
      cast,
      trailerKey: trailer?.key || null,
      trailerName: trailer?.name || null,
    };

    console.log("Returning movie details with", cast.length, "cast members");

    return new Response(JSON.stringify(movieDetails), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in movie-details function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get movie details";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
