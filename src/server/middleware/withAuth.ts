import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Company } from "@prisma/client";

export interface AuthenticatedRequest extends NextApiRequest {
  userId: string;
  userEmail: string;
  company: Company;
}

/**
 * Middleware that requires NextAuth authentication and loads the company profile.
 * Attaches `userId`, `userEmail`, and `company` to the request object.
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
    authReq.userEmail = session.user.email;
    authReq.company = company;

    return handler(authReq, res);
  };
}

/**
 * Middleware that requires admin role (for vetting pipeline routes).
 * Checks the User's email (from JWT session) against ADMIN_EMAILS,
 * NOT the mutable company email field.
 */
export function withAdmin(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req, res) => {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    if (!adminEmails.includes(req.userEmail.toLowerCase())) {
      return res.status(403).json({ error: "Admin access required" });
    }
    return handler(req, res);
  });
}
