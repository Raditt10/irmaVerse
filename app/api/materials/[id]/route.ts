import prisma from "@/lib/prisma";
import { CourseCategory, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("id");

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    const User = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
        
    if (!User) {
      console.log('User not found in database:', session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log('User found:', User.email, User.role);

    if(!courseId){
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const where: Prisma.MaterialWhereInput = {};
    const category = searchParams.get("category");
    if (category && Object.values(CourseCategory).includes(category as CourseCategory)) {
      where.category = category as CourseCategory;
    }

    const CATEGORY_LABEL: Record<CourseCategory, string> = {
      Wajib: "Program Wajib",
      Extra: "Program Ekstra",
      NextLevel: "Program Next Level",
      Susulan: "Program Susulan",
    };

    const GRADE_LABEL = {
      X: "Kelas 10",
      XI: "Kelas 11",
      XII: "Kelas 12",
    } as const;

    const materials = await prisma.material.findMany({
      where: {id: courseId},
      include: {
        instructor: {
          select: { 
            name: true,
            email: true
          },
        },
        enrollments: {
          where: { userId: User.id },
          select: { id: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // normalize ke format frontend
    const result = materials.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      date: m.date,
      instructor: m.instructor.name,
      insttructorEmail: m.instructor.email,
      category: CATEGORY_LABEL[m.category as keyof typeof CATEGORY_LABEL],
      grade: GRADE_LABEL[m.grade as keyof typeof GRADE_LABEL],
      startedAt: m.startedAt,
      thumbnailUrl: m.thumbnailUrl,
      isJoined: m.enrollments.length > 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Check if user is instructor or admin
    if (session.user.role !== "instruktur" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya instruktur atau admin yang bisa menghapus kajian" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if material exists and user is the owner
    const material = await prisma.material.findUnique({
      where: { id },
      select: { instructorId: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Kajian tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check authorization (only instructor/admin who created it or admin can delete)
    if (
      material.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin menghapus kajian ini" },
        { status: 403 }
      );
    }

    // Delete material (cascading delete will handle enrollments)
    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Kajian berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus kajian" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Check if user is instructor or admin
    if (session.user.role !== "instruktur" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya instruktur atau admin yang bisa mengedit kajian" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      date,
      time,
      category,
      grade,
      thumbnailUrl,
    } = body;

    // Detailed validation
    if (!title || !title.toString().trim()) {
      return NextResponse.json(
        { error: "Judul kajian harus diisi" },
        { status: 400 }
      );
    }
    if (title.toString().trim().length < 3) {
      return NextResponse.json(
        { error: "Judul kajian minimal 3 karakter" },
        { status: 400 }
      );
    }
    if (!description || !description.toString().trim()) {
      return NextResponse.json(
        { error: "Deskripsi kajian harus diisi" },
        { status: 400 }
      );
    }
    if (description.toString().trim().length < 10) {
      return NextResponse.json(
        { error: "Deskripsi kajian minimal 10 karakter" },
        { status: 400 }
      );
    }
    if (!date) {
      return NextResponse.json(
        { error: "Tanggal kajian harus dipilih" },
        { status: 400 }
      );
    }
    if (!time) {
      return NextResponse.json(
        { error: "Jam kajian harus dipilih" },
        { status: 400 }
      );
    }

    // Check if material exists and user is the owner
    const material = await prisma.material.findUnique({
      where: { id },
      select: { instructorId: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Kajian tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      material.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin mengedit kajian ini" },
        { status: 403 }
      );
    }

    // Map category and grade
    const CATEGORY_MAP: Record<string, string> = {
      "Program Wajib": "Wajib",
      "Program Ekstra": "Extra",
      "Program Next Level": "NextLevel",
      "Program Susulan": "Susulan",
    };

    const GRADE_MAP: Record<string, string> = {
      "Semua": "X",
      "Kelas 10": "X",
      "Kelas 11": "XI",
      "Kelas 12": "XII",
    };

    const mappedCategory = CATEGORY_MAP[category] || "Wajib";
    const mappedGrade = GRADE_MAP[grade] || "X";

    // Update material
    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        startedAt: time || null,
        category: mappedCategory as any,
        grade: mappedGrade as any,
        thumbnailUrl: thumbnailUrl || null,
      },
      include: {
        instructor: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(updatedMaterial, { status: 200 });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengedit kajian" },
      { status: 500 }
    );
  }
}