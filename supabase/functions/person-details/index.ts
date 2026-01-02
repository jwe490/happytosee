import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/h632";

Deno.serve(async (req: Request) => {
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

    const [detailsRes, creditsRes, externalIdsRes, imagesRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`${TMDB_BASE_URL}/person/${personId}/external_ids?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/person/${personId}/images?api_key=${TMDB_API_KEY}`),
    ]);

    if (!detailsRes.ok) {
      throw new Error(`Failed to fetch person details: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };
    const externalIds = externalIdsRes.ok ? await externalIdsRes.json() : {};
    const images = imagesRes.ok ? await imagesRes.json() : { profiles: [] };

    console.log("Fetched person details:", details.name);

    const processMovies = (movies: any[]) => {
      return movies
        .filter((m: any) => m.poster_path && m.media_type === "movie")
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          character: movie.character || null,
          job: movie.job || null,
          posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
          backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
          rating: Math.round(movie.vote_average * 10) / 10,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          releaseDate: movie.release_date || null,
          popularity: movie.popularity || 0,
        }))
        .sort((a: any, b: any) => {
          if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
          return b.popularity - a.popularity;
        });
    };

    const castMovies = processMovies(credits.cast || []);
    const crewMovies = credits.crew
      ?.filter((c: any) => c.poster_path && c.media_type === "movie")
      .reduce((acc: any, curr: any) => {
        const existing = acc.find((m: any) => m.id === curr.id);
        if (existing) {
          if (!existing.jobs.includes(curr.job)) {
            existing.jobs.push(curr.job);
          }
        } else {
          acc.push({
            id: curr.id,
            title: curr.title,
            jobs: [curr.job],
            posterUrl: `${TMDB_IMAGE_BASE}${curr.poster_path}`,
            backdropUrl: curr.backdrop_path ? `${TMDB_IMAGE_BASE}${curr.backdrop_path}` : null,
            rating: Math.round(curr.vote_average * 10) / 10,
            year: curr.release_date ? new Date(curr.release_date).getFullYear() : null,
            releaseDate: curr.release_date || null,
            popularity: curr.popularity || 0,
          });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => {
        if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
        return b.popularity - a.popularity;
      }) || [];

    const groupedCrew = crewMovies.reduce((acc: any, movie: any) => {
      movie.jobs.forEach((job: string) => {
        const category = categorizeJob(job);
        if (!acc[category]) acc[category] = [];
        acc[category].push({ ...movie, job });
      });
      return acc;
    }, {});

    const totalMovies = new Set([
      ...castMovies.map((m: any) => m.id),
      ...crewMovies.map((m: any) => m.id)
    ]).size;

    const additionalPhotos = images.profiles
      ?.slice(0, 6)
      .map((img: any) => `${TMDB_PROFILE_BASE}${img.file_path}`) || [];

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
      popularity: Math.round(details.popularity * 10) / 10,
      alsoKnownAs: details.also_known_as || [],
      gender: details.gender === 1 ? "Female" : details.gender === 2 ? "Male" : "Other",
      homepage: details.homepage || null,
      externalIds: {
        imdb: externalIds.imdb_id || null,
        instagram: externalIds.instagram_id || null,
        twitter: externalIds.twitter_id || null,
        facebook: externalIds.facebook_id || null,
      },
      additionalPhotos,
      stats: {
        totalMovies,
        asActor: castMovies.length,
        asCrew: crewMovies.length,
      },
      actingRoles: castMovies,
      crewRoles: groupedCrew,
    };

    console.log("Returning person details with", totalMovies, "total movies");

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

function categorizeJob(job: string): string {
  const jobLower = job.toLowerCase();
  if (jobLower.includes("direct")) return "Director";
  if (jobLower.includes("produc")) return "Producer";
  if (jobLower.includes("writ")) return "Writer";
  if (jobLower.includes("cinemat") || jobLower.includes("photography")) return "Cinematography";
  if (jobLower.includes("music") || jobLower.includes("composer")) return "Music";
  if (jobLower.includes("edit")) return "Editor";
  return "Other";
}