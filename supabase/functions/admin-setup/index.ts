import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { action, user_id, role = "admin" } = await req.json();

    if (action === "promote_to_admin") {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: "user_id is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user_id)
        .maybeSingle();

      if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
        return new Response(
          JSON.stringify({
            message: "User is already an admin",
            role: profile.role
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const { error: fnError } = await supabase.rpc("set_user_as_admin", {
        target_user_id: user_id,
        target_role: role
      });

      if (fnError) {
        console.error("Error promoting user to admin:", fnError);
        return new Response(
          JSON.stringify({ error: fnError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("user_id, display_name, role")
        .eq("user_id", user_id)
        .single();

      return new Response(
        JSON.stringify({
          message: "User promoted to admin successfully",
          profile: updatedProfile
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (action === "list_admins") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, role, created_at")
        .in("role", ["admin", "super_admin"])
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      return new Response(
        JSON.stringify({ admins: data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (action === "check_admin") {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: "user_id is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user_id)
        .maybeSingle();

      const isAdmin = profile && (profile.role === "admin" || profile.role === "super_admin");

      return new Response(
        JSON.stringify({
          is_admin: isAdmin,
          role: profile?.role || "user"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action. Use 'promote_to_admin', 'list_admins', or 'check_admin'"
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
