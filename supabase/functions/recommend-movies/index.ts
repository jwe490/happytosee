import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, languages, genres, industries, duration, previouslyRecommended } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const excludeList = previouslyRecommended?.length > 0 
      ? `\n\nCRITICAL: Do NOT recommend these movies that were already shown: ${previouslyRecommended.join(", ")}`
      : "";

    const systemPrompt = `You are an advanced movie recommendation assistant. Your task is to recommend movies based on the user's mood and preferences while ensuring recommendations are diverse, non-repetitive, and unique.

🚫 Anti-Repetition Rules (VERY IMPORTANT):
- Never recommend the same movie twice
- Avoid overused/default titles unless explicitly requested
- Rotate between: popular classics, modern hits, critically acclaimed, and underrated/hidden gems

🎯 Diversity Constraints (EACH list MUST include):
- Movies from different release years (mix old and new)
- Different directors and lead actors
- No more than one movie from the same franchise
- Mix of mainstream + hidden gems

🎭 Mood-Based Mapping:
- Sad → comfort dramas, uplifting stories, hopeful endings
- Happy → feel-good, comedy, celebratory films
- Stressed → light-hearted, calming, low-intensity movies
- Excited → action, thriller, adventure
- Romantic → emotional, relationship-driven films
- Nostalgic → classic films, retro aesthetics
- Bored → engaging plots, twist endings, unique concepts

📤 Output Format (JSON array):
Return ONLY a valid JSON array with 10-12 movies. Each movie object must have:
{
  "title": "Movie Title",
  "year": 2020,
  "rating": 8.5,
  "genre": "Drama, Thriller",
  "language": "English",
  "industry": "Hollywood",
  "posterUrl": "USE PLACEHOLDER",
  "moodMatch": "One sentence explaining why this fits the user's mood"
}

IMPORTANT: For posterUrl, always use this exact format with a unique movie-related seed:
https://picsum.photos/seed/[movie-title-no-spaces]/400/600
Example: https://picsum.photos/seed/TheShawshankRedemption/400/600

🔁 Smart Rotation Logic:
- Shift recommendations to different time periods/regions on each request
- Include at least 2 lesser-known films
- If similar mood is repeated, change era, cultural origin, or genre sub-type${excludeList}`;

    const userPrompt = `Please recommend movies based on:
- Current mood: ${mood}
- Preferred languages: ${languages?.join(", ") || "Any"}
- Preferred genres: ${genres?.length > 0 ? genres.join(", ") : "Open to all"}
- Movie industries: ${industries?.join(", ") || "Any"}
- Time available: ${duration || "Any length"}

Remember to provide diverse, fresh recommendations that the user hasn't seen before!`;

    console.log("Requesting movie recommendations for mood:", mood);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received:", content?.substring(0, 200));

    // Parse the JSON from the response
    let movies;
    try {
      // Extract JSON array from the response (handles markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        movies = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse movie recommendations");
    }

    // Add unique IDs to movies
    const moviesWithIds = movies.map((movie: any, index: number) => ({
      ...movie,
      id: Date.now() + index,
    }));

    return new Response(JSON.stringify({ movies: moviesWithIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in recommend-movies function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get recommendations";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
