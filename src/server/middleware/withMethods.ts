import type { NextApiRequest, NextApiResponse } from "next";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function withMethods(
  methods: HttpMethod[],
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!methods.includes(req.method as HttpMethod)) {
      res.setHeader("Allow", methods.join(", "));
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    return handler(req, res);
  };
}
