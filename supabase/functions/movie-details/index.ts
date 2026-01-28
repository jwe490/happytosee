// Supabase Edge Function for movie details

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

// Direct streaming service URLs (these are the official sites)
const PROVIDER_URLS: Record<number, string> = {
  8: "https://www.netflix.com",           // Netflix
  9: "https://www.amazon.com/gp/video",   // Amazon Prime Video
  337: "https://www.disneyplus.com",      // Disney+
  384: "https://www.hbomax.com",          // HBO Max
  15: "https://www.hulu.com",             // Hulu
  386: "https://www.peacocktv.com",       // Peacock
  531: "https://www.paramountplus.com",   // Paramount+
  350: "https://tv.apple.com",            // Apple TV+
  283: "https://www.crunchyroll.com",     // Crunchyroll
  2: "https://tv.apple.com",              // Apple iTunes
  3: "https://play.google.com/store/movies", // Google Play
  10: "https://www.amazon.com/gp/video",  // Amazon Video
  192: "https://www.youtube.com",         // YouTube
  7: "https://www.vudu.com",              // Vudu
  68: "https://www.microsoft.com/en-us/store/movies-and-tv", // Microsoft Store
};

const getProviderUrl = (providerId: number): string | null => {
  return PROVIDER_URLS[providerId] || null;
};

// Simple validation function
function validateMovieId(body: unknown): { valid: boolean; error?: string; movieId?: number } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  
  const b = body as Record<string, unknown>;
  let movieId: number;
  
  if (typeof b.movieId === 'number' && Number.isInteger(b.movieId) && b.movieId > 0) {
    movieId = b.movieId;
  } else if (typeof b.movieId === 'string' && /^\d+$/.test(b.movieId)) {
    movieId = parseInt(b.movieId, 10);
  } else {
    return { valid: false, error: "Movie ID must be a positive integer" };
  }
  
  return { valid: true, movieId };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = validateMovieId(body);
    if (!validationResult.valid || !validationResult.movieId) {
      return new Response(JSON.stringify({ error: validationResult.error || "Invalid movie ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const movieId = validationResult.movieId;
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    console.log("Fetching details for movie:", movieId);

    // Fetch movie details, credits, videos, similar movies, and watch providers in parallel
    const [detailsRes, creditsRes, videosRes, similarRes1, similarRes2, providersRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=2`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`),
    ]);

    if (!detailsRes.ok) {
      throw new Error(`Failed to fetch movie details: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };
    const videos = videosRes.ok ? await videosRes.json() : { results: [] };
    const similar1 = similarRes1.ok ? await similarRes1.json() : { results: [] };
    const similar2 = similarRes2.ok ? await similarRes2.json() : { results: [] };
    const providers = providersRes.ok ? await providersRes.json() : { results: {} };

    // Combine both pages of similar movies
    const allSimilarResults = [...(similar1.results || []), ...(similar2.results || [])];

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

    // Get up to 20 similar movies with posters
    const similarMovies = allSimilarResults
      .filter((m: any) => m.poster_path)
      .slice(0, 20)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
        rating: Math.round(movie.vote_average * 10) / 10,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      })) || [];

    // Parse watch providers with direct URLs (no third-party aggregators)
    const providerData = providers.results?.US || providers.results?.GB || Object.values(providers.results || {})[0] || {};
    
    const watchProviders = {
      flatrate: providerData.flatrate?.slice(0, 5).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
        url: getProviderUrl(p.provider_id),
      })).filter((p: any) => p.url) || [],
      rent: providerData.rent?.slice(0, 3).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
        url: getProviderUrl(p.provider_id),
      })).filter((p: any) => p.url) || [],
      buy: providerData.buy?.slice(0, 3).map((p: any) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
        url: getProviderUrl(p.provider_id),
      })).filter((p: any) => p.url) || [],
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
