import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Verify JWT and extract user ID
function verifyJWT(token: string, secret: string): { valid: boolean; userId?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, userId: payload.sub };
  } catch {
    return { valid: false };
  }
}

// Hash function for token verification
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const jwtSecret = Deno.env.get("JWT_SECRET");

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not set");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action, token, data } = body;

    console.log(`[user-data] Action: ${action}`);

    // Verify token
    const result = verifyJWT(token, jwtSecret);
    if (!result.valid || !result.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify session exists in DB
    const tokenHash = await hashToken(token);
    const { data: session } = await supabase
      .from("key_sessions")
      .select("expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (!session || new Date(session.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Session expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = result.userId;

    switch (action) {
      // ==================== GET DATA ====================
      case "get_watchlist": {
        const { data: watchlist, error } = await supabase
          .from("watchlist")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ watchlist: watchlist || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_collections": {
        // Get collections with their movies
        const { data: collections, error } = await supabase
          .from("collections")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // Get movies for each collection
        const collectionsWithMovies = await Promise.all(
          (collections || []).map(async (collection) => {
            const { data: movies } = await supabase
              .from("collection_movies")
              .select("*")
              .eq("collection_id", collection.id)
              .order("added_at", { ascending: false });

            return { ...collection, movies: movies || [] };
          })
        );

        return new Response(JSON.stringify({ collections: collectionsWithMovies }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_collection_movies": {
        const { collection_id } = data;

        // Verify collection belongs to user
        const { data: collection } = await supabase
          .from("collections")
          .select("id")
          .eq("id", collection_id)
          .eq("user_id", userId)
          .maybeSingle();

        if (!collection) {
          return new Response(JSON.stringify({ error: "Collection not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: movies, error } = await supabase
          .from("collection_movies")
          .select("*")
          .eq("collection_id", collection_id)
          .order("added_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ movies: movies || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_collection": {
        const { collection_id, name, description, is_public, mood } = data;

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (is_public !== undefined) updateData.is_public = is_public;
        if (mood !== undefined) updateData.mood = mood;

        const { error } = await supabase
          .from("collections")
          .update(updateData)
          .eq("id", collection_id)
          .eq("user_id", userId);

        if (error) throw error;
        console.log("[user-data] Collection updated:", collection_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ==================== REVIEWS ====================
      case "add_review": {
        const { movie_id, movie_title, movie_poster, rating, review_text } = data;

        // Check existing
        const { data: existing } = await supabase
          .from("reviews")
          .select("id")
          .eq("user_id", userId)
          .eq("movie_id", movie_id)
          .maybeSingle();

        if (existing) {
          // Update
          const { error } = await supabase
            .from("reviews")
            .update({
              rating,
              review_text: review_text || null,
              movie_poster: movie_poster || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
          console.log("[user-data] Review updated for movie:", movie_id);
        } else {
          // Insert
          const { error } = await supabase.from("reviews").insert({
            user_id: userId,
            movie_id,
            movie_title,
            movie_poster: movie_poster || null,
            rating,
            review_text: review_text || null,
          });

          if (error) throw error;
          console.log("[user-data] Review created for movie:", movie_id);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_review": {
        const { review_id } = data;

        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", review_id)
          .eq("user_id", userId);

        if (error) throw error;
        console.log("[user-data] Review deleted:", review_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ==================== COLLECTIONS ====================
      case "create_collection": {
        const { name, description, is_public } = data;

        const { data: newCollection, error } = await supabase
          .from("collections")
          .insert({
            user_id: userId,
            name,
            description: description || null,
            is_public: is_public || false,
          })
          .select()
          .single();

        if (error) throw error;
        console.log("[user-data] Collection created:", newCollection.id);

        return new Response(JSON.stringify({ success: true, collection: newCollection }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "add_to_collection": {
        const { collection_id, movie_id, title, poster_path } = data;

        // Verify collection belongs to user
        const { data: collection } = await supabase
          .from("collections")
          .select("id")
          .eq("id", collection_id)
          .eq("user_id", userId)
          .single();

        if (!collection) {
          return new Response(JSON.stringify({ error: "Collection not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if already exists
        const { data: existing } = await supabase
          .from("collection_movies")
          .select("id")
          .eq("collection_id", collection_id)
          .eq("movie_id", movie_id)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ success: true, alreadyExists: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase.from("collection_movies").insert({
          collection_id,
          movie_id,
          title,
          poster_path: poster_path || null,
        });

        if (error) throw error;
        console.log("[user-data] Movie added to collection:", collection_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_collection": {
        const { collection_id } = data;

        // First delete all movies in the collection
        await supabase
          .from("collection_movies")
          .delete()
          .eq("collection_id", collection_id);

        const { error } = await supabase
          .from("collections")
          .delete()
          .eq("id", collection_id)
          .eq("user_id", userId);

        if (error) throw error;
        console.log("[user-data] Collection deleted:", collection_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ==================== WATCHLIST ====================
      case "add_to_watchlist": {
        const { movie_id, title, poster_path, rating, release_year, overview } = data;

        // Check existing
        const { data: existing } = await supabase
          .from("watchlist")
          .select("id")
          .eq("user_id", userId)
          .eq("movie_id", movie_id)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ success: true, alreadyExists: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase.from("watchlist").insert({
          user_id: userId,
          movie_id,
          title,
          poster_path: poster_path || null,
          rating: rating || null,
          release_year: release_year || null,
          overview: overview || null,
        });

        if (error) throw error;
        console.log("[user-data] Added to watchlist:", movie_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_from_watchlist": {
        const { movie_id } = data;

        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", userId)
          .eq("movie_id", movie_id);

        if (error) throw error;
        console.log("[user-data] Removed from watchlist:", movie_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_from_collection": {
        const { collection_id, movie_id } = data;

        // Verify collection belongs to user
        const { data: collection } = await supabase
          .from("collections")
          .select("id")
          .eq("id", collection_id)
          .eq("user_id", userId)
          .single();

        if (!collection) {
          return new Response(JSON.stringify({ error: "Collection not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase
          .from("collection_movies")
          .delete()
          .eq("collection_id", collection_id)
          .eq("movie_id", movie_id);

        if (error) throw error;
        console.log("[user-data] Movie removed from collection:", collection_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("[user-data] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
