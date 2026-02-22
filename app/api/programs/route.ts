import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseCategory, Grade } from "@prisma/client";

export async function GET() {
  try {
    // Fetch programs dari materials (yang adalah program/kursus)
    const materials = await prisma.material.findMany({
      where: { materialType: "program" },
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
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    // Check if user is instructor or admin
    if (session.user.role !== "instruktur" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya instruktur atau admin yang bisa membuat program" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      grade,
      category,
      thumbnailUrl,
      duration,
      syllabus,
      requirements,
      benefits,
      sessions,
    } = body;

    // Validation
    if (!title) return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });

    // Prepare extra content as JSON string
    const extraContent = JSON.stringify({
      syllabus: Array.isArray(syllabus) ? syllabus : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      sessions: Array.isArray(sessions) ? sessions : [],
    });

    // Map categories and grades correctly to Prisma enums
    const CATEGORY_MAP: Record<string, CourseCategory> = {
      "Program Wajib": "Wajib",
      "Wajib": "Wajib",
    };

    const GRADE_MAP: Record<string, Grade> = {
      "Semua": "X", 
      "Kelas 10": "X",
      "Kelas 11": "XI",
      "Kelas 12": "XII",
      "X": "X",
      "XI": "XI",
      "XII": "XII",
    };

    const mappedCategory = CATEGORY_MAP[category] || "Wajib";
    const mappedGrade = GRADE_MAP[grade] || "X";

    const program = (await (prisma.material as any).create({
      data: {
        title,
        description: description || null,
        grade: mappedGrade,
        category: mappedCategory,
        thumbnailUrl: thumbnailUrl || null,
        instructorId: session.user.id,
        startedAt: duration || null, // StartedAt stores duration for programs
        materialType: "program",
        content: extraContent,
      },
    })) as any;

    // Sub-materials (Kajian) are now stored in JSON 'content' above.
    // No longer creating separate records to avoid cluttering the materials list.

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json({ error: "Gagal membuat program" }, { status: 500 });
  }
}
