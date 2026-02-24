import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch programs dari materials (yang adalah program/kursus)
    const materials = await prisma.material.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          }
        },
        enrollments: {
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data ke format yang diharapkan frontend
    const formattedPrograms = materials.map(material => {
      // Tentukan status berdasarkan tanggal
      const now = new Date();
      const materialDate = new Date(material.date);
      let status: "in-progress" | "done" | "upcoming" = "upcoming";
      
      if (materialDate < now) {
        status = "done";
      } else if (materialDate.toDateString() === now.toDateString()) {
        status = "in-progress";
      }

      return {
        id: material.id,
        title: material.title,
        description: material.description,
        duration: material.startedAt ? `${material.startedAt}` : "Belum ditentukan",
        level: material.grade || "X",
        quota: {
          filled: material.enrollments?.length || 0,
          total: material.participants ? parseInt(material.participants) : 0,
        },
        status: status,
        thumbnail: material.thumbnailUrl,
        instructor: material.instructor?.name,
      };
    });

    return NextResponse.json(formattedPrograms);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}
