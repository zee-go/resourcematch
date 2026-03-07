import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
  });

  if (!candidate) {
    return res.status(404).json({ error: "Candidate profile not found" });
  }

  if (req.method === "GET") {
    const vettingLayers = await prisma.vettingLayerResult.findMany({
      where: { candidateId: candidate.id },
      select: {
        layer: true,
        score: true,
        passed: true,
        summary: true,
        completedAt: true,
      },
    });

    const vettingProfile = await prisma.vettingProfile.findUnique({
      where: { candidateId: candidate.id },
      select: {
        status: true,
        overallScore: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return res.status(200).json({
      candidate: {
        id: candidate.id,
        fullName: candidate.fullName,
        name: candidate.name,
        title: candidate.title,
        avatar: candidate.avatar,
        vertical: candidate.vertical,
        experience: candidate.experience,
        availability: candidate.availability,
        skills: candidate.skills,
        tools: candidate.tools,
        location: candidate.location,
        summary: candidate.summary,
        vettingScore: candidate.vettingScore,
        verified: candidate.verified,
        salaryMin: candidate.salaryMin,
        salaryMax: candidate.salaryMax,
        email: candidate.email,
        phone: candidate.phone,
        linkedIn: candidate.linkedIn,
        videoUrl: candidate.videoUrl,
        resumeUrl: candidate.resumeUrl,
        vettingLayers,
        vettingProfile,
      },
    });
  }

  if (req.method === "PATCH") {
    const {
      fullName,
      title,
      vertical,
      experience,
      availability,
      skills,
      tools,
      location,
      summary,
      salaryMin,
      salaryMax,
      phone,
      linkedIn,
      videoUrl,
      resumeUrl,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName;
      const parts = fullName.trim().split(/\s+/);
      updateData.name =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1][0]}.`
          : fullName;
    }
    if (title !== undefined) updateData.title = title;
    if (vertical !== undefined) updateData.vertical = vertical;
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (availability !== undefined) updateData.availability = availability;
    if (skills !== undefined) updateData.skills = skills;
    if (tools !== undefined) updateData.tools = tools;
    if (location !== undefined) updateData.location = location;
    if (summary !== undefined) updateData.summary = summary;
    if (salaryMin !== undefined)
      updateData.salaryMin = salaryMin ? parseInt(salaryMin) : null;
    if (salaryMax !== undefined)
      updateData.salaryMax = salaryMax ? parseInt(salaryMax) : null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (linkedIn !== undefined) {
      if (linkedIn) {
        try { new URL(linkedIn); } catch { return res.status(400).json({ error: "Invalid LinkedIn URL" }); }
        updateData.linkedIn = linkedIn;
      } else {
        updateData.linkedIn = null;
      }
    }
    if (videoUrl !== undefined) {
      if (videoUrl) {
        try { new URL(videoUrl); } catch { return res.status(400).json({ error: "Invalid video URL" }); }
        updateData.videoUrl = videoUrl;
      } else {
        updateData.videoUrl = null;
      }
    }
    if (resumeUrl !== undefined) {
      if (resumeUrl) {
        try { new URL(resumeUrl); } catch { return res.status(400).json({ error: "Invalid resume URL" }); }
        updateData.resumeUrl = resumeUrl;
      } else {
        updateData.resumeUrl = null;
      }
    }

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: updateData,
    });

    return res.status(200).json({
      candidate: {
        id: updated.id,
        fullName: updated.fullName,
        name: updated.name,
        title: updated.title,
        avatar: updated.avatar,
        vertical: updated.vertical,
        experience: updated.experience,
        availability: updated.availability,
        skills: updated.skills,
        tools: updated.tools,
        location: updated.location,
        summary: updated.summary,
        vettingScore: updated.vettingScore,
        verified: updated.verified,
        salaryMin: updated.salaryMin,
        salaryMax: updated.salaryMax,
        email: updated.email,
        phone: updated.phone,
        linkedIn: updated.linkedIn,
        videoUrl: updated.videoUrl,
        resumeUrl: updated.resumeUrl,
      },
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
