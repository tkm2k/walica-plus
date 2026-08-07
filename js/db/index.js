import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";
import { LocalStore } from "./local-store.js";
import { createSupabaseStore } from "./supabase-store.js";

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let store;
if (useSupabase) {
  // supabase global is loaded via CDN <script> in index.html
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  store = createSupabaseStore(sb);
} else {
  store = LocalStore;
}

export { store };
