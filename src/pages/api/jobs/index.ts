import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Vertical, Availability } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    vertical,
    availability,
    search,
    page: pageStr,
    limit: limitStr,
  } = req.query;

  const page = Math.max(1, parseInt(pageStr as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitStr as string) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.JobWhereInput = {
    status: "OPEN",
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  };

  if (vertical && vertical !== "all") {
    where.vertical = vertical as Vertical;
  }

  if (availability && availability !== "all") {
    where.availability = availability as Availability;
  }

  if (search) {
    const searchStr = search as string;
    where.AND = [
      {
        OR: [
          { title: { contains: searchStr, mode: "insensitive" } },
          { description: { contains: searchStr, mode: "insensitive" } },
          { skills: { hasSome: [searchStr] } },
        ],
      },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        vertical: true,
        experienceMin: true,
        experienceMax: true,
        availability: true,
        salaryMin: true,
        salaryMax: true,
        skills: true,
        location: true,
        status: true,
        expiresAt: true,
        publishedAt: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            verified: true,
            industry: true,
            companySize: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(jobs)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return res.status(403).json({ error: "Company profile required" });
  }

  if (company.verificationStatus !== "VERIFIED") {
    return res.status(403).json({
      error: "Company must be verified to post jobs",
      verificationStatus: company.verificationStatus,
    });
  }

  const {
    title,
    description,
    vertical,
    availability,
    experienceMin,
    experienceMax,
    salaryMin,
    salaryMax,
    skills,
    location,
    status,
    expiresInDays,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Job title is required" });
  }

  if (!description?.trim()) {
    return res.status(400).json({ error: "Job description is required" });
  }

  if (!vertical) {
    return res.status(400).json({ error: "Vertical is required" });
  }

  if (!availability) {
    return res.status(400).json({ error: "Availability type is required" });
  }

  const jobStatus = status === "OPEN" ? "OPEN" : "DRAFT";
  const now = new Date();
  const days = parseInt(expiresInDays) || 90;
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: title.trim(),
      description: description.trim(),
      vertical,
      availability,
      experienceMin: parseInt(experienceMin) || 5,
      experienceMax: experienceMax ? parseInt(experienceMax) : null,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      skills: Array.isArray(skills) ? skills : [],
      location: location?.trim() || "Remote",
      status: jobStatus,
      publishedAt: jobStatus === "OPEN" ? now : null,
      expiresAt: jobStatus === "OPEN" ? expiresAt : null,
    },
    include: {
      company: {
        select: {
          companyName: true,
          verified: true,
        },
      },
    },
  });

  return res.status(201).json({ job: JSON.parse(JSON.stringify(job)) });
}
