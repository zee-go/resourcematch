import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client that does nothing when env vars aren't set
    // This allows the build to succeed without Supabase credentials
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
