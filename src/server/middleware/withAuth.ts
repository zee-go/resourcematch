import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Company } from "@prisma/client";

export interface AuthenticatedRequest extends NextApiRequest {
  userId: string;
  company: Company;
}

/**
 * Middleware that requires NextAuth authentication and loads the company profile.
 * Attaches `userId` and `company` to the request object.
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSession(req, res);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return res.status(403).json({
        error: "Company profile not found",
        message: "Complete your company profile to access this resource.",
      });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.userId = session.user.id;
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
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
    if (!adminEmails.includes(req.company.email)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    return handler(req, res);
  });
}
