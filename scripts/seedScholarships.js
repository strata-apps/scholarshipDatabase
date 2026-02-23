import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";


// Load env vars
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// IMPORTANT: Service role key is required for seeding
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Create Supabase admin client
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

async function seedScholarships() {
  console.log("📥 Loading scholarships.json...");

  const filePath = path.resolve("./data/scholarships.json");
  const raw = fs.readFileSync(filePath, "utf8");

  const scholarships = JSON.parse(raw);

  console.log(`Found ${scholarships.length} scholarships`);

  // Convert JSON → DB rows
  const rows = scholarships.map((s) => ({
    id: s.id,
    name: s.name,
    amount: s.amount,

    open_date: s.openDate || null,
    close_date: s.closeDate || null,

    gpa_min: s.gpaMin ?? null,

    citizenship: s.citizenship || [],

    need_based: !!s.needBased,
    is_grant: !!s.grant,

    region: s.region,
    requirements: s.requirements,
    url: s.url,

    tags: s.tags || [],
  }));

  console.log("🚀 Uploading to Supabase...");

  // Upload in chunks (important)
  const CHUNK_SIZE = 200;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);

    const { error } = await supabase
      .from("scholarships")
      .upsert(chunk, { onConflict: "id" });

    if (error) {
      console.error("❌ Insert failed:", error);
      return;
    }

    console.log(`✅ Inserted ${i + chunk.length}/${rows.length}`);
  }

  console.log("🎉 Done! Scholarships seeded successfully.");
}

seedScholarships();
