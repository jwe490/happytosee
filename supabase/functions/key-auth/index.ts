import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ───────────────────────────────────────────────────────────────────────────
// Proper HMAC-SHA256 JWT implementation using Web Crypto API
// ───────────────────────────────────────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmacSign(data: string, secret: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return new Uint8Array(signature);
}

async function hmacVerify(data: string, signature: Uint8Array, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Copy into a fresh ArrayBuffer to satisfy Deno's type check
  const sigBuffer = new Uint8Array(signature).buffer as ArrayBuffer;
  return crypto.subtle.verify("HMAC", cryptoKey, sigBuffer, msgData);
}

async function createJWT(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: number
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresIn };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));

  const signatureInput = `${headerB64}.${payloadB64}`;
  const signatureBytes = await hmacSign(signatureInput, secret);
  const signatureB64 = base64UrlEncode(signatureBytes);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyJWT(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [headerB64, payloadB64, signatureB64] = parts;
    const signatureInput = `${headerB64}.${payloadB64}`;
    const signatureBytes = base64UrlDecode(signatureB64);

    const isValid = await hmacVerify(signatureInput, signatureBytes, secret);
    if (!isValid) {
      console.log("[key-auth] HMAC signature verification failed");
      return { valid: false };
    }

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    // Check expiration
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log("[key-auth] Token expired at", new Date(payload.exp * 1000).toISOString());
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("[key-auth] JWT verification error:", err);
    return { valid: false };
  }
}

// Hash function for token storage (SHA-256)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ───────────────────────────────────────────────────────────────────────────
// Main handler
// ───────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error("JWT_SECRET must be set and at least 32 characters");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action, keyHash, profile, token, rememberMe } = body;

    console.log(`[key-auth] Action: ${action}`);

    switch (action) {
      case "signup": {
        console.log("[key-auth] Processing signup...");

        // Check if key hash already exists
        const { data: existing } = await supabase
          .from("key_users")
          .select("id")
          .eq("key_hash", keyHash)
          .single();

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
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "login": {
        console.log("[key-auth] Processing login...");
        console.log("[key-auth] Key hash (first 16 chars):", keyHash?.substring(0, 16) + "...");

        // Find user by key hash
        const { data: user, error: findError } = await supabase
          .from("key_users")
          .select("*")
          .eq("key_hash", keyHash)
          .single();

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
        const jwtToken = await createJWT({ sub: user.id, name: user.display_name }, jwtSecret, expiresIn);

        // Store session
        const tokenHash = await hashToken(jwtToken);
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        const { error: sessionError } = await supabase.from("key_sessions").insert({
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          is_remembered: rememberMe,
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
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify": {
        console.log("[key-auth] Processing verify...");

        const result = await verifyJWT(token, jwtSecret);

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

        const result = await verifyJWT(token, jwtSecret);
        if (!result.valid || !result.payload) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get user
        const { data: user } = await supabase
          .from("key_users")
          .select("*")
          .eq("id", result.payload.sub)
          .single();

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
        const newToken = await createJWT({ sub: user.id, name: user.display_name }, jwtSecret, expiresIn);

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
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        console.log("[key-auth] Invalid action:", action);
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    console.error("[key-auth] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
