import { createServerClient } from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";

type RequestWithCookies = IncomingMessage & {
  cookies: Partial<{ [key: string]: string }>;
};

export function createSupabaseServerClient(
  req: RequestWithCookies,
  res: ServerResponse
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock server client when env vars aren't set
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    } as ReturnType<typeof createServerClient>;
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        const cookies: { name: string; value: string }[] = [];
        for (const [name, value] of Object.entries(req.cookies)) {
          if (value) cookies.push({ name, value });
        }
        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.setHeader(
            "Set-Cookie",
            `${name}=${value}; Path=${options?.path ?? "/"}; HttpOnly; SameSite=Lax${options?.maxAge ? `; Max-Age=${options.maxAge}` : ""}`
          );
        });
      },
    },
  });
}

/**
 * Get the authenticated user's Supabase ID from a request.
 * Works with both API routes and getServerSideProps contexts.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(
  req: NextApiRequest | RequestWithCookies,
  res: NextApiResponse | ServerResponse
): Promise<string | null> {
  const supabase = createSupabaseServerClient(req as RequestWithCookies, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
