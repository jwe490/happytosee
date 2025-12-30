import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, type } = await req.json();
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI search request:", { description, type });

    if (type === "describe") {
      // Use AI to identify movie from description
      const aiPrompt = `The user is trying to find a movie. They described it as: "${description}"

Based on this description, identify the most likely movie(s) they're looking for. Return a JSON object with:
{
  "movies": [
    {
      "title": "Movie Title",
      "year": 2020,
      "confidence": "high/medium/low",
      "reason": "Why this matches the description"
    }
  ],
  "searchTerms": ["keyword1", "keyword2"]
}

Only include movies you're fairly confident about. Maximum 5 movies.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: aiPrompt }],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI service error");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        return new Response(JSON.stringify({ 
          movies: [],
          message: "I couldn't identify any movies from that description. Try being more specific."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Search TMDb for identified movies
      const movies = [];
      for (const movie of (parsed.movies || []).slice(0, 5)) {
        const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&year=${movie.year || ""}`;
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results?.[0]) {
            const tmdbMovie = searchData.results[0];
            movies.push({
              id: tmdbMovie.id,
              title: tmdbMovie.title,
              year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
              rating: Math.round(tmdbMovie.vote_average * 10) / 10,
              posterUrl: tmdbMovie.poster_path 
                ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`
                : null,
              overview: tmdbMovie.overview,
              confidence: movie.confidence,
              matchReason: movie.reason,
            });
          }
        }
      }

      return new Response(JSON.stringify({ 
        movies,
        searchTerms: parsed.searchTerms || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "summary") {
      // Generate AI summary for a movie
      const { movieTitle, movieOverview } = await req.json();
      
      const summaryPrompt = `Provide a brief, engaging 2-sentence summary of the movie "${movieTitle}". 
Original overview: ${movieOverview}

Make it sound exciting and highlight what makes this movie special. Don't spoil any plot twists.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: summaryPrompt }],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("AI service error");
      }

      const aiData = await aiResponse.json();
      const summary = aiData.choices?.[0]?.message?.content || movieOverview;

      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "surprise") {
      // Surprise me - random recommendation based on user's history
      const { watchHistory, mood } = await req.json();
      
      const surprisePrompt = `Based on the user's watch history and mood, suggest ONE unexpected movie they might love.

Watch history: ${watchHistory?.slice(0, 10).map((m: any) => m.title).join(", ") || "None"}
Current mood: ${mood || "adventurous"}

Suggest something they wouldn't typically pick but would likely enjoy. Return JSON:
{
  "title": "Movie Title",
  "year": 2020,
  "reason": "Why they'll love it despite not expecting to"
}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: surprisePrompt }],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("AI service error");
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse AI response");
      }

      if (parsed?.title) {
        const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(parsed.title)}&year=${parsed.year || ""}`;
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results?.[0]) {
            const tmdbMovie = searchData.results[0];
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
                surpriseReason: parsed.reason,
              }
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      return new Response(JSON.stringify({ 
        movie: null,
        message: "Couldn't find a surprise recommendation"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-search function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
