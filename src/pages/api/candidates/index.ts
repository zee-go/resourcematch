import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { Vertical, Availability } from "@prisma/client";

const AVAILABILITY_MAP: Record<string, Availability> = {
  full: "FULL_TIME",
  part: "PART_TIME",
  contract: "CONTRACT",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    vertical,
    experience,
    availability,
    search,
    skills,
  } = req.query;

  try {
    const where: Record<string, unknown> = {};

    // Vertical filter
    if (vertical && vertical !== "all") {
      where.vertical = vertical as Vertical;
    }

    // Experience filter
    if (experience && experience !== "all") {
      const exp = experience as string;
      if (exp === "5-7") {
        where.experience = { gte: 5, lte: 7 };
      } else if (exp === "8-10") {
        where.experience = { gte: 8, lte: 10 };
      } else if (exp === "10+") {
        where.experience = { gte: 10 };
      }
    }

    // Availability filter
    if (availability && availability !== "all") {
      const mapped = AVAILABILITY_MAP[availability as string];
      if (mapped) {
        where.availability = mapped;
      }
    }

    // Search filter
    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { skills: { hasSome: [search] } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: where as any,
      select: {
        // Public fields only — no email, phone, salary, etc.
        id: true,
        name: true,
        title: true,
        avatar: true,
        vertical: true,
        experience: true,
        availability: true,
        skills: true,
        tools: true,
        location: true,
        rating: true,
        summary: true,
        vettingScore: true,
        verified: true,
        caseStudies: {
          select: { title: true, outcome: true, metrics: true },
        },
        vettingLayers: {
          select: { layer: true, score: true, passed: true },
        },
        _count: {
          select: { references: true },
        },
      },
      orderBy: { vettingScore: "desc" },
    });

    return res.status(200).json({ candidates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch candidates: ${message}` });
  }
}
