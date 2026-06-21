"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { certificates, courses, userProgress } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const issueCertificate = async (courseId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user progress exists
  const userProgressData = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!userProgressData) {
    throw new Error("User progress not found");
  }

  // Check if the certificate already exists
  const existingCertificate = await db.query.certificates.findFirst({
    where: and(
      eq(certificates.userId, userId),
      eq(certificates.courseId, courseId),
    ),
  });

  if (existingCertificate) {
    return { success: true, certificateId: existingCertificate.id };
  }

  // Insert the new certificate
  const [newCertificate] = await db
    .insert(certificates)
    .values({
      userId,
      courseId,
      userName: userProgressData.userName || "Estudante",
    })
    .returning();

  if (!newCertificate) {
    throw new Error("Failed to create certificate");
  }

  revalidatePath("/learn");
  revalidatePath("/profile");

  return { success: true, certificateId: newCertificate.id };
};

export const getUserCertificates = async (userId: string) => {
  const data = await db.query.certificates.findMany({
    where: eq(certificates.userId, userId),
    with: {
      course: true,
    },
    orderBy: (certificates, { desc }) => [desc(certificates.createdAt)],
  });

  return data;
};

export const getCertificateById = async (id: string) => {
  const data = await db.query.certificates.findFirst({
    where: eq(certificates.id, id),
    with: {
      course: true,
      user: true,
    },
  });

  return data;
};
