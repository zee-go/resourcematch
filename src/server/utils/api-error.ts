import type { NextApiResponse } from "next";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public action?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown, res: NextApiResponse) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.action && { action: error.action }),
    });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({
    error: "Internal server error",
  });
}
