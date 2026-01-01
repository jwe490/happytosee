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

    // Fetch movie details, credits, videos, similar movies, and watch providers in parallel
    const [detailsRes, creditsRes, videosRes, similarRes, providersRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`),
    ]);

    if (!detailsRes.ok) {
      throw new Error(`Failed to fetch movie details: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };
    const videos = videosRes.ok ? await videosRes.json() : { results: [] };
    const similar = similarRes.ok ? await similarRes.json() : { results: [] };
    const providers = providersRes.ok ? await providersRes.json() : { results: {} };

    console.log("Fetched movie details:", details.title);

    // Get top 10 cast members with full details
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

    // Get top 6 similar movies with posters
    const similarMovies = similar.results
      ?.filter((m: any) => m.poster_path)
      .slice(0, 6)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
        rating: Math.round(movie.vote_average * 10) / 10,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      })) || [];

    // Parse watch providers (prioritize US, then any available)
    const providerData = providers.results?.US || providers.results?.GB || Object.values(providers.results || {})[0] || {};
    
    const watchProviders = {
      link: providerData.link || null,
      flatrate: providerData.flatrate?.slice(0, 5).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
      })) || [],
      rent: providerData.rent?.slice(0, 3).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
      })) || [],
      buy: providerData.buy?.slice(0, 3).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
      })) || [],
    };

    console.log(`Found ${similarMovies.length} similar movies, ${watchProviders.flatrate.length} streaming providers`);

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
      similarMovies,
      watchProviders,
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