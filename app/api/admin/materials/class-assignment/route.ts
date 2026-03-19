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
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 },
      );
    }

    // Get material with its current class
    const material = await prisma.material.findUnique({
      where: { id: materialId },
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

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    }

    // Get all available classes
    const classes = await prisma.class_grades.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        currentClass: material.class_grade,
      },
      availableClasses: classes,
    });
  } catch (error) {
    console.error("[MATERIAL CLASS ASSIGNMENT GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch material class assignment" },
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
    const { materialId, classGradeId } = body;

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 },
      );
    }

    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      select: { id: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
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

    // Update material with class
    const updated = await prisma.material.update({
      where: { id: materialId },
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
      message: "Material class assignment updated",
      material: updated,
    });
  } catch (error) {
    console.error("[MATERIAL CLASS ASSIGNMENT PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update material class assignment" },
      { status: 500 },
    );
  }
}
