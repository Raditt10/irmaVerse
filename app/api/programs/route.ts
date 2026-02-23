import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Fetch programs dari materials (yang adalah program/kursus)
    const materials = await (prisma as any).material.findMany({
      where: { materialType: "program" },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          }
        },
        courseenrollment: {
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
    const formattedPrograms = materials.map((material: any) => {
      // Tentukan status berdasarkan tanggal
      const now = new Date();
      const materialDate = new Date(material.date);
      let status: "in-progress" | "done" | "upcoming" = "upcoming";
      
      if (materialDate < now) {
        status = "done";
      } else if (materialDate.toDateString() === now.toDateString()) {
        status = "in-progress";
      }

      const GRADE_LABEL: Record<string, string> = {
        X: "Kelas 10",
        XI: "Kelas 11",
        XII: "Kelas 12",
        x: "Kelas 10",
        xi: "Kelas 11",
        xii: "Kelas 12",
      };

      return {
        id: material.id,
        title: material.title,
        description: material.description,
        duration: material.startedAt ? `${material.startedAt}` : "Belum ditentukan",
        level: GRADE_LABEL[material.grade] || material.grade || "Kelas 10",
        quota: {
          filled: material.courseenrollment?.length || 0,
          total: material.participants ? parseInt(material.participants) : 0,
        },
        status: status,
        thumbnail: material.thumbnailUrl,
        instructor: material.users?.name,
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
    const CATEGORY_MAP: Record<string, any> = {
      "Program Wajib": "Wajib",
      "Wajib": "Wajib",
      "Extra": "Extra",
    };

    const GRADE_MAP: Record<string, any> = {
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

    const program = await prisma.material.create({
      data: {
        id: `prog-${Date.now()}`, // Added ID generation for safety
        title,
        description: description || null,
        grade: mappedGrade,
        category: mappedCategory,
        thumbnailUrl: thumbnailUrl || null,
        instructorId: session.user.id,
        startedAt: duration || null, // StartedAt stores duration for programs
        materialType: "program",
        content: extraContent,
        updatedAt: new Date(), // Explicitly setting updatedAt as it might be required
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json({ error: "Gagal membuat program" }, { status: 500 });
  }
}
