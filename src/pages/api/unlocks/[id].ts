import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/supabase-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUserId = await getAuthUserId(req, res);

  if (!supabaseUserId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.query;
  const { contacted } = req.body;

  if (typeof contacted !== "boolean") {
    return res.status(400).json({ error: "contacted (boolean) is required" });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { supabaseUserId },
    });

    if (!company) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    // Verify the unlock belongs to this company
    const unlock = await prisma.unlock.findUnique({
      where: { id: id as string },
    });

    if (!unlock || unlock.companyId !== company.id) {
      return res.status(404).json({ error: "Unlock not found" });
    }

    const updated = await prisma.unlock.update({
      where: { id: id as string },
      data: { contacted },
    });

    return res.status(200).json({ unlock: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update unlock: ${message}` });
  }
}
