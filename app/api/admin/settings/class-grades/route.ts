import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all available class grades
    const grades = await prisma.class_grades.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, grades });
  } catch (error) {
    console.error("[CLASS GRADES GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch class grades" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== "admin" && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, label, order } = body;

    if (!code || !label) {
      return NextResponse.json(
        { error: "Code and label are required" },
        { status: 400 },
      );
    }

    // Check if code already exists
    const existing = await prisma.class_grades.findUnique({
      where: { code },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Class grade with this code already exists" },
        { status: 409 },
      );
    }

    const classGrade = await prisma.class_grades.create({
      data: {
        id: crypto.randomUUID(),
        code,
        label,
        order: order || 0,
      },
    });

    return NextResponse.json(
      { success: true, message: "Class grade created", classGrade },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CLASS GRADES POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create class grade" },
      { status: 500 },
    );
  }
}
