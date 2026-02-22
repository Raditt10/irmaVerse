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

    const material = (await prisma.material.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
          }
        },
        subMaterials: {
          select: {
            id: true,
            title: true,
            description: true,
            startedAt: true,
          }
        }
      }
    })) as any;

    if (!material || material.materialType !== "program") {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    // Parse extra content
    let extraData = { syllabus: [], requirements: [], benefits: [] };
    if (material.content) {
      try {
        extraData = JSON.parse(material.content);
      } catch (e) {
        console.error("Error parsing program content JSON:", e);
      }
    }

    // Tentukan status berdasarkan tanggal (optional logic, can be customized)
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
      ? material.enrollments.some((e: any) => e.userId === session.user.id)
      : false;

    const formattedProgram = {
      id: material.id,
      title: material.title,
      description: material.description,
      duration: material.startedAt || "Belum ditentukan",
      level: material.grade || "Semua",
      startDate: material.date.toISOString(),
      schedule: material.startedAt ? `Mulai pukul ${material.startedAt}` : "Belum ditentukan",
      location: "Aula Utama IRMA", // Default placeholder
      instructor: material.instructor?.name || "Instruktur IRMA",
      quota: {
        filled: material.enrollments.length,
        total: material.participants ? parseInt(material.participants) : 0,
      },
      status: status,
      image: material.thumbnailUrl,
      syllabus: extraData.syllabus || [],
      requirements: extraData.requirements || [],
      benefits: extraData.benefits || [],
      sessions: (extraData as any).sessions || material.subMaterials || [],
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

    // Fetch the existing program to get its instructorId for sub-materials
    const existingProgram = (await prisma.material.findUnique({
      where: { id },
      select: { instructorId: true, materialType: true }
    })) as any;

    if (!existingProgram || existingProgram.materialType !== "program") {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    const updatedProgram = await (prisma.material as any).update({
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
      },
    });

    // Sub-materials (Sessions) are now stored in JSON 'content' above.
    // No longer synchronizing separate records to avoid cluttering.

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json({ error: "Gagal memperbarui program" }, { status: 500 });
  }
}
