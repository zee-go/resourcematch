import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthUserId } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { Company } from "@prisma/client";

export interface AuthenticatedRequest extends NextApiRequest {
  supabaseUserId: string;
  company: Company;
}

/**
 * Middleware that requires Supabase authentication and loads the company profile.
 * Attaches `supabaseUserId` and `company` to the request object.
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const supabaseUserId = await getAuthUserId(req, res);

    if (!supabaseUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const company = await prisma.company.findUnique({
      where: { supabaseUserId },
    });

    if (!company) {
      return res.status(403).json({
        error: "Company profile not found",
        message: "Complete your company profile to access this resource.",
      });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.supabaseUserId = supabaseUserId;
    authReq.company = company;

    return handler(authReq, res);
  };
}

/**
 * Middleware that requires admin role (for vetting pipeline routes).
 */
export function withAdmin(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req, res) => {
    // For now, admin check is by email. In production, use a role field.
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
    if (!adminEmails.includes(req.company.email)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    return handler(req, res);
  });
}
