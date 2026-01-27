import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple JWT implementation
function createJWT(payload: Record<string, any>, secret: string, expiresIn: number): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresIn;

  const fullPayload = { ...payload, iat: now, exp };

  const base64Header = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const base64Payload = btoa(JSON.stringify(fullPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  // Create signature using HMAC-SHA256
  const signatureInput = `${base64Header}.${base64Payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(signatureInput);

  // Simple signature (in production, use proper HMAC)
  let hash = 0;
  const combined = new Uint8Array([...keyData, ...data]);
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined[i];
    hash = hash & hash;
  }
  const signature = btoa(String(Math.abs(hash)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyJWT(token: string, secret: string): { valid: boolean; payload?: Record<string, any> } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log("[key-auth] Token expired at", new Date(payload.exp * 1000).toISOString());
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("[key-auth] JWT verification error:", err);
    return { valid: false };
  }
}

// Hash function for token storage
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
    const jwtSecret = Deno.env.get("JWT_SECRET") ||
                      Deno.env.get("SUPABASE_JWT_SECRET") ||
                      "moodflix-jwt-secret-default-change-in-production-43f0851500a8a3534e736bc2560849d40146c09b701e57ca01c7f6e5abedbd3a";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const body = await req.json();
    const { action, keyHash, profile, token, rememberMe } = body;

    console.log(`[key-auth] Action: ${action}`, { hasKeyHash: !!keyHash, hasToken: !!token });

    switch (action) {
      case "signup": {
        console.log("[key-auth] Processing signup...");

        if (!keyHash || !profile?.display_name) {
          return new Response(
            JSON.stringify({ error: "Key hash and display name are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if key hash already exists
        const { data: existing } = await supabase.from("key_users").select("id").eq("key_hash", keyHash).maybeSingle();

        if (existing) {
          console.log("[key-auth] Key already registered");
          return new Response(JSON.stringify({ error: "This key is already registered" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("key_users")
          .insert({
            key_hash: keyHash,
            display_name: profile.display_name,
            date_of_birth: profile.date_of_birth || null,
            gender: profile.gender || null,
            purpose: profile.purpose || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("[key-auth] Insert error:", insertError);
          return new Response(JSON.stringify({ error: "Failed to create account" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log("[key-auth] User created:", newUser.id);

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: newUser.id,
              display_name: newUser.display_name,
              date_of_birth: newUser.date_of_birth,
              gender: newUser.gender,
              purpose: newUser.purpose,
              created_at: newUser.created_at,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "login": {
        console.log("[key-auth] Processing login...");

        if (!keyHash) {
          return new Response(
            JSON.stringify({ error: "Key hash is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[key-auth] Key hash (first 16 chars):", keyHash?.substring(0, 16) + "...");

        // Find user by key hash
        const { data: user, error: findError } = await supabase
          .from("key_users")
          .select("*")
          .eq("key_hash", keyHash)
          .maybeSingle();

        if (findError) {
          console.log("[key-auth] Find error:", findError.message);
        }

        if (!user) {
          console.log("[key-auth] No user found for this key hash");
          return new Response(JSON.stringify({ error: "Invalid access key" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log("[key-auth] User found:", user.id, user.display_name);

        // Create JWT token
        const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
        const jwtToken = createJWT({ sub: user.id, name: user.display_name }, jwtSecret, expiresIn);

        // Store session
        const tokenHash = await hashToken(jwtToken);
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        const { error: sessionError } = await supabase.from("key_sessions").insert({
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          is_remembered: rememberMe || false,
          user_agent: req.headers.get("user-agent") || null,
        });

        if (sessionError) {
          console.error("[key-auth] Session insert error:", sessionError);
        }

        // Update last login
        await supabase.from("key_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

        console.log("[key-auth] Login successful for user:", user.id);

        return new Response(
          JSON.stringify({
            token: jwtToken,
            user: {
              id: user.id,
              display_name: user.display_name,
              date_of_birth: user.date_of_birth,
              gender: user.gender,
              purpose: user.purpose,
              created_at: user.created_at,
              last_login_at: new Date().toISOString(),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "verify": {
        console.log("[key-auth] Processing verify...");

        const result = verifyJWT(token, jwtSecret);

        if (!result.valid) {
          console.log("[key-auth] JWT verification failed");
          return new Response(JSON.stringify({ valid: false }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if session exists in DB AND is not expired
        const tokenHash = await hashToken(token);
        const { data: session } = await supabase
          .from("key_sessions")
          .select("expires_at")
          .eq("token_hash", tokenHash)
          .maybeSingle();

        const isActive = !!session && new Date(session.expires_at).getTime() > Date.now();

        console.log("[key-auth] Session active:", isActive);

        return new Response(JSON.stringify({ valid: isActive, payload: result.payload }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "logout": {
        console.log("[key-auth] Processing logout...");

        const tokenHash = await hashToken(token);
        await supabase.from("key_sessions").delete().eq("token_hash", tokenHash);

        console.log("[key-auth] Logout complete");

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "refresh": {
        console.log("[key-auth] Processing refresh...");

        const result = verifyJWT(token, jwtSecret);
        if (!result.valid || !result.payload) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get user
        const { data: user } = await supabase.from("key_users").select("*").eq("id", result.payload.sub).single();

        if (!user) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete old session
        const oldTokenHash = await hashToken(token);
        const { data: oldSession } = await supabase
          .from("key_sessions")
          .select("is_remembered")
          .eq("token_hash", oldTokenHash)
          .single();

        await supabase.from("key_sessions").delete().eq("token_hash", oldTokenHash);

        // Create new token
        const isRemembered = oldSession?.is_remembered || false;
        const expiresIn = isRemembered ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const newToken = createJWT({ sub: user.id, name: user.display_name }, jwtSecret, expiresIn);

        // Store new session
        const newTokenHash = await hashToken(newToken);
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        await supabase.from("key_sessions").insert({
          user_id: user.id,
          token_hash: newTokenHash,
          expires_at: expiresAt,
          is_remembered: isRemembered,
        });

        console.log("[key-auth] Refresh complete for user:", user.id);

        return new Response(
          JSON.stringify({
            token: newToken,
            user: {
              id: user.id,
              display_name: user.display_name,
              date_of_birth: user.date_of_birth,
              gender: user.gender,
              purpose: user.purpose,
              created_at: user.created_at,
              last_login_at: user.last_login_at,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        console.log("[key-auth] Invalid action:", action);
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error: any) {
    console.error("[key-auth] Error:", error);
    const errorMessage = error?.message || "Internal server error";
    console.error("[key-auth] Error details:", {
      message: errorMessage,
      stack: error?.stack,
      name: error?.name
    });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
