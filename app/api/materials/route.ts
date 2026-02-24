import prisma from "@/lib/prisma";
import { CourseCategory, Grade, CourseRole, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;

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

    const where: Prisma.MaterialWhereInput = {};
    const category = searchParams.get("category");
    if (category && Object.values(CourseCategory).includes(category as CourseCategory)) {
      where.category = category as CourseCategory;
    }

    // If user is not instructor/admin, only show materials where they are enrolled or invited
    if (User.role !== "instruktur" && User.role !== "admin") {
      where.OR = [
        {
          // Materials user is enrolled in
          enrollments: {
            some: { userId: User.id }
          }
        },
        {
          // Materials user has been invited to (accepted)
          invites: {
            some: {
              userId: User.id,
              status: "accepted"
            }
          }
        }
      ];
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
      where,
      include: {
        instructor: {
          select: { 
            name: true
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    // Check if user is instructor or admin
    if (session.user.role !== "instruktur" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Hanya instruktur atau admin yang bisa membuat kajian" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, date, time, category, grade, thumbnailUrl, invites } = body;

    // Detailed validation
    if (!title || !title.toString().trim()) {
      return NextResponse.json({ error: "Judul kajian harus diisi" }, { status: 400 });
    }
    if (title.toString().trim().length < 3) {
      return NextResponse.json({ error: "Judul kajian minimal 3 karakter" }, { status: 400 });
    }
    if (!description || !description.toString().trim()) {
      return NextResponse.json({ error: "Deskripsi kajian harus diisi" }, { status: 400 });
    }
    if (description.toString().trim().length < 10) {
      return NextResponse.json({ error: "Deskripsi kajian minimal 10 karakter" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Tanggal kajian harus dipilih" }, { status: 400 });
    }
    if (!time) {
      return NextResponse.json({ error: "Jam kajian harus dipilih" }, { status: 400 });
    }

    // Map category from label to enum
    const CATEGORY_MAP: Record<string, CourseCategory> = {
      "Program Wajib": "Wajib",
      "Program Ekstra": "Extra",
      "Program Next Level": "NextLevel",
      "Program Susulan": "Susulan",
    };

    // Map grade from label to enum (default to X if Semua/All)
    const GRADE_MAP: Record<string, Grade> = {
      "Semua": "X",
      "Kelas 10": "X",
      "Kelas 11": "XI",
      "Kelas 12": "XII",
    };

    const mappedCategory = CATEGORY_MAP[category] || "Wajib";
    const mappedGrade = GRADE_MAP[grade] || "X";

    // Create material
    const material = await prisma.material.create({
      data: {
        title,
        description,
        date: new Date(date),
        startedAt: time || null,
        category: mappedCategory as CourseCategory,
        grade: mappedGrade as Grade,
        thumbnailUrl: thumbnailUrl || null,
        instructorId: session.user.id,
      },
    });

    // Add invites if provided
    if (invites && Array.isArray(invites) && invites.length > 0) {
      for (const email of invites) {
        const invitedUser = await prisma.user.findUnique({
          where: { email },
        });

        if (invitedUser) {
          await prisma.courseEnrollment.create({
            data: {
              userId: invitedUser.id,
              materialId: material.id,
              role: "user" as CourseRole, // Default role for invited users
            },
          });
        }
      }
    }

    return NextResponse.json({ id: material.id, message: "Kajian berhasil dibuat" }, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat kajian" },
      { status: 500 }
    );
  }
}