"use server";

import prisma from "@/lib/prisma";

export async function getInstructorTotalKajian(instructorId: string) {
  try {
    const count = await prisma.material.count({
      where: {
        instructorId: instructorId,
      },
    });
    return count;
  } catch (error) {
    console.error("Error fetching instructor total kajian:", error);
    return 0;
  }
}
