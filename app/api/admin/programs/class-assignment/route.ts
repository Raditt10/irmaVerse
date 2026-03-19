import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 },
      );
    }

    // Get program with its current class
    const program = await prisma.programs.findUnique({
      where: { id: programId },
      select: {
        id: true,
        title: true,
        classGradeId: true,
        class_grade: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Get all available classes
    const classes = await prisma.class_grades.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      program: {
        id: program.id,
        title: program.title,
        currentClass: program.class_grade,
      },
      availableClasses: classes,
    });
  } catch (error) {
    console.error("[PROGRAM CLASS ASSIGNMENT GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch program class assignment" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { programId, classGradeId } = body;

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 },
      );
    }

    // Verify program exists
    const program = await prisma.programs.findUnique({
      where: { id: programId },
      select: { id: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Verify class exists if provided
    if (classGradeId) {
      const classGrade = await prisma.class_grades.findUnique({
        where: { id: classGradeId },
        select: { id: true },
      });

      if (!classGrade) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
    }

    // Update program with class
    const updated = await prisma.programs.update({
      where: { id: programId },
      data: { classGradeId: classGradeId || null },
      select: {
        id: true,
        title: true,
        classGradeId: true,
        class_grade: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Program class assignment updated",
      program: updated,
    });
  } catch (error) {
    console.error("[PROGRAM CLASS ASSIGNMENT PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update program class assignment" },
      { status: 500 },
    );
  }
}
