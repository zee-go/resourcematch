import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withMethods } from "@/server/middleware/withMethods";
import { withBodyValidation } from "@/server/middleware/withValidation";
import { withRateLimit } from "@/server/middleware/withRateLimit";

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function handler(
  req: NextApiRequest & { body: z.infer<typeof resetPasswordSchema> },
  res: NextApiResponse
) {
  const { email, token, password } = req.body;

  // Find the reset token
  const stored = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: `password-reset:${email}`,
        token,
      },
    },
  });

  if (!stored) {
    return res.status(400).json({ error: "Invalid or expired reset link." });
  }

  if (stored.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `password-reset:${email}`,
          token,
        },
      },
    });
    return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
  }

  // Update the password and clean up
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `password-reset:${email}`,
          token,
        },
      },
    }),
  ]);

  return res.status(200).json({ message: "Password has been reset successfully." });
}

export default withRateLimit(
  { limit: 5, windowSeconds: 60 },
  withMethods(["POST"], withBodyValidation(resetPasswordSchema, handler))
);
