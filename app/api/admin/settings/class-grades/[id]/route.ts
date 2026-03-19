import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { label, isActive, order } = body;

    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const classGrade = await prisma.class_grades.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, classGrade });
  } catch (error: any) {
    console.error("[CLASS GRADE PATCH] Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Class grade not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update class grade" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.class_grades.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Class grade deleted",
    });
  } catch (error: any) {
    console.error("[CLASS GRADE DELETE] Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Class grade not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete class grade" },
      { status: 500 },
    );
  }
}
