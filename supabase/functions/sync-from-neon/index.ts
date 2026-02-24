import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { neon } from "https://esm.sh/@neondatabase/serverless@0.9.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const neonUrl = Deno.env.get("VITE_DATABASE_URL");
    if (!neonUrl) {
      return new Response(JSON.stringify({ error: "VITE_DATABASE_URL not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sql = neon(neonUrl);

    // Fetch from Neon
    const products = await sql`
      SELECT id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category
      FROM products ORDER BY created_at DESC
    `;
    const categories = await sql`SELECT name FROM categories ORDER BY name`;

    // Connect to Cloud (Supabase)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert categories
    if (categories.length > 0) {
      const catRows = categories.map((c: any) => ({ name: c.name }));
      const { error: catErr } = await supabase.from("categories").upsert(catRows, { onConflict: "name" });
      if (catErr) console.error("Category insert error:", catErr);
    }

    // Insert products
    if (products.length > 0) {
      const prodRows = products.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        retail_price: p.retail_price,
        wholesale_price: p.wholesale_price,
        min_wholesale_qty: p.min_wholesale_qty,
        description: p.description,
        category: p.category,
      }));
      const { error: prodErr } = await supabase.from("products").upsert(prodRows, { onConflict: "id" });
      if (prodErr) console.error("Product insert error:", prodErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: { products: products.length, categories: categories.length },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
