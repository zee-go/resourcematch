import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";
import { withMethods } from "@/server/middleware/withMethods";
import { withBodyValidation } from "@/server/middleware/withValidation";
import { withRateLimit } from "@/server/middleware/withRateLimit";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

async function handler(
  req: NextApiRequest & { body: z.infer<typeof forgotPasswordSchema> },
  res: NextApiResponse
) {
  const { email } = req.body;

  // Always return success to prevent user enumeration
  const successResponse = {
    message: "If an account with that email exists, a password reset link has been sent.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(200).json(successResponse);
  }

  // Generate a secure random token
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: `password-reset:${email}` },
  });

  // Store the reset token
  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token,
      expires,
    },
  });

  // TODO: Send email via Resend when RESEND_API_KEY is configured
  // For now, log the reset URL in development
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] Password reset URL: ${resetUrl}`);
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ResourceMatch <noreply@resourcematch.ph>",
          to: email,
          subject: "Reset your password",
          html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset for your ResourceMatch account.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          `,
        }),
      });
    } catch {
      // Don't fail the request if email sending fails
      console.error("Failed to send password reset email");
    }
  }

  return res.status(200).json(successResponse);
}

export default withRateLimit(
  { limit: 3, windowSeconds: 60 },
  withMethods(["POST"], withBodyValidation(forgotPasswordSchema, handler))
);
