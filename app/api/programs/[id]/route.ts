import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const material = (await (prisma as any).material.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        courseenrollment: {
          select: {
            id: true,
            userId: true,
          }
        },
      }
    })) as any;

    if (!material || material.materialType !== "program") {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    // Parse extra content
    let extraData = { syllabus: [], requirements: [], benefits: [], sessions: [] };
    if (material.content) {
      try {
        extraData = JSON.parse(material.content);
      } catch (e) {
        console.error("Error parsing program content JSON:", e);
      }
    }

    // Tentukan status berdasarkan tanggal
    const now = new Date();
    const materialDate = new Date(material.date);
    let status: "in-progress" | "done" | "upcoming" = "upcoming";
    
    if (materialDate < now && materialDate.toDateString() !== now.toDateString()) {
      status = "done";
    } else if (materialDate.toDateString() === now.toDateString()) {
      status = "in-progress";
    }

    // Check if current user is enrolled
    const isJoined = session?.user?.id 
      ? material.courseenrollment.some((e: any) => e.userId === session.user.id)
      : false;

    const GRADE_LABEL: Record<string, string> = {
      X: "Kelas 10",
      XI: "Kelas 11",
      XII: "Kelas 12",
      x: "Kelas 10",
      xi: "Kelas 11",
      xii: "Kelas 12",
    };

    // Fetch dynamic sessions (materials where parentId = programId)
    const dynamicSessions = await (prisma as any).material.findMany({
      where: { parentId: material.id },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        startedAt: true,
      },
      orderBy: { date: "asc" },
    });

    const formattedSessions = [
      ...(extraData.sessions || []),
      ...dynamicSessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description || `${new Date(s.date).toLocaleDateString("id-ID")} - ${s.startedAt || ""}`,
      })),
    ];

    const formattedProgram = {
      id: material.id,
      title: material.title,
      description: material.description,
      duration: material.startedAt || "Belum ditentukan",
      level: GRADE_LABEL[material.grade] || material.grade || "Semua",
      startDate: material.date.toISOString(),
      schedule: material.startedAt ? `Mulai pukul ${material.startedAt}` : "Belum ditentukan",
      location: "Aula Utama IRMA", // Default placeholder
      instructor: material.users?.name || "Instruktur IRMA",
      quota: {
        filled: material.courseenrollment.length,
        total: material.participants ? parseInt(material.participants) : 0,
      },
      status: status,
      image: material.thumbnailUrl,
      syllabus: extraData.syllabus || [],
      requirements: extraData.requirements || [],
      benefits: extraData.benefits || [],
      sessions: formattedSessions,
      isJoined,
    };

    return NextResponse.json(formattedProgram);
  } catch (error) {
    console.error("Error fetching program detail:", error);
    return NextResponse.json({ error: "Gagal memuat detail program" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    if (session.user.role !== "instruktur" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Hanya instruktur atau admin yang bisa mengubah program" }, { status: 403 });
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
      "Susulan": "Susulan",
      "Extra": "Extra",
      "NextLevel": "NextLevel",
    };

    const GRADE_MAP: Record<string, any> = {
      "Semua": "X", 
      "Kelas 10": "X",
      "Kelas 11": "XI",
      "Kelas 12": "XII",
      "X": "X",
      "XI": "XI",
      "XII": "XII",
      "Pemula": "X",
      "Menengah": "XI",
      "Lanjutan": "XII",
    };

    const mappedCategory = CATEGORY_MAP[category] || "Wajib";
    const mappedGrade = GRADE_MAP[grade] || "X";

    // Fetch the existing program to check existence
    const existingProgram = await prisma.material.findUnique({
      where: { id },
      select: { materialType: true }
    });

    if (!existingProgram || existingProgram.materialType !== "program") {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    const updatedProgram = await prisma.material.update({
      where: { id },
      data: {
        title,
        description: description || null,
        grade: mappedGrade,
        category: mappedCategory,
        thumbnailUrl: thumbnailUrl || null,
        startedAt: duration || null, // StartedAt stores duration for programs
        materialType: "program",
        content: extraContent,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json({ error: "Gagal memperbarui program" }, { status: 500 });
  }
}
