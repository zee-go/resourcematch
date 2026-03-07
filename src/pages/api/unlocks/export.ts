import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const unlocks = await prisma.unlock.findMany({
      where: { companyId: req.company.id },
      include: {
        candidate: {
          select: {
            fullName: true,
            title: true,
            email: true,
            phone: true,
            linkedIn: true,
            resumeUrl: true,
            salaryMin: true,
            salaryMax: true,
            vertical: true,
            location: true,
          },
        },
      },
      orderBy: { unlockedAt: "desc" },
    });

    const header = "Name,Title,Email,Phone,LinkedIn,Resume URL,Salary Min (USD/mo),Salary Max (USD/mo),Vertical,Location,Contacted,Unlocked At\n";
    const rows = unlocks.map((u) => {
      const c = u.candidate;
      return [
        `"${c.fullName}"`,
        `"${c.title}"`,
        `"${c.email || ""}"`,
        `"${c.phone || ""}"`,
        c.linkedIn || "",
        c.resumeUrl || "",
        c.salaryMin ? String(c.salaryMin) : "",
        c.salaryMax ? String(c.salaryMax) : "",
        c.vertical,
        `"${c.location}"`,
        u.contacted ? "Yes" : "No",
        u.unlockedAt.toISOString(),
      ].join(",");
    });

    const csv = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=unlocks.csv");
    return res.status(200).send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Export failed: ${message}` });
  }
}

export default withAuth(handler);
