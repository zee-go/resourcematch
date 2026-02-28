import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

/**
 * Validates request body against a Zod schema.
 * Attaches validated data as `req.body` (replacing raw input).
 */
export function withBodyValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextApiRequest & { body: z.infer<T> },
    res: NextApiResponse
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    return handler(req as NextApiRequest & { body: z.infer<T> }, res);
  };
}

/**
 * Validates query parameters against a Zod schema.
 */
export function withQueryValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextApiRequest & { query: z.infer<T> },
    res: NextApiResponse
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: result.error.flatten().fieldErrors,
      });
    }

    (req as any).validatedQuery = result.data;
    return handler(req as NextApiRequest & { query: z.infer<T> }, res);
  };
}
