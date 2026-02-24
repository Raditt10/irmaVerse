import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await params for Next.js 16
    const { id: materialId } = await params;

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Get material to check if user is instructor
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        instructor: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Check if current user is the instructor or admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only instructor or admin can view attendance
    if (
      material.instructorId !== user.id &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only instructor can view attendance" },
        { status: 403 }
      );
    }

    // Get all attendance for this material
    const attendances = await prisma.attendance.findMany({
      where: {
        materialId: materialId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user details for each attendance
    const attendanceWithUsers = await Promise.all(
      attendances.map(async (att) => {
        const attendanceUser = await prisma.user.findUnique({
          where: { id: att.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        });
        return {
          ...att,
          user: attendanceUser,
        };
      })
    );

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        date: material.date,
      },
      attendances: attendanceWithUsers,
      total: attendanceWithUsers.length,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
