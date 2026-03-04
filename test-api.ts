import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const User = await prisma.user.findFirst();
    if (!User) {
        console.log("No user found");
        return;
    }
    console.log("Found User ID:", User.id, "Role:", User.role);

    const isPrivileged = User.role === "instruktur" || User.role === "admin";
    
    const programs = await prisma.program.findMany({
      include: {
        instructor: {
          select: { id: true, name: true, avatar: true },
        },
        materials: {
          select: { id: true },
        },
        enrollments: {
          select: { id: true, userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const GRADE_LABEL: Record<string, string> = {
      X: "Kelas 10",
      XI: "Kelas 11",
      XII: "Kelas 12",
    };

    const CATEGORY_LABEL: Record<string, string> = {
      Wajib: "Program Wajib",
      Extra: "Program Ekstra",
      NextLevel: "Program Next Level",
      Susulan: "Program Susulan",
    };

    const filtered = isPrivileged
      ? programs
      : programs.filter((p) => p.enrollments.some((e) => e.userId === User.id));

    const result = filtered.map((p) => {
      const isEnrolled = p.enrollments.some((e) => e.userId === User.id);

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        duration: p.duration || "Belum ditentukan",
        level: GRADE_LABEL[p.grade] || p.grade,
        category: CATEGORY_LABEL[p.category] || p.category,
        thumbnail: p.thumbnailUrl,
        instructor: p.instructor?.name || "Instruktur IRMA",
        instructorAvatar: p.instructor?.avatar,
        materialCount: p.materials.length,
        enrollmentCount: p.enrollments.length,
        isEnrolled,
        createdAt: p.createdAt,
      };
    });

    console.log("Result length:", result.length);
    console.log("JSON.stringify successful");
  } catch (e: any) {
    console.error("Simulation Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
