import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get ALL invitations with all details
    const invitations = await prisma.materialInvite.findMany({
      include: {
        material: true,
        instructor: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      total: invitations.length,
      invitations: invitations.map((inv) => ({
        id: inv.id,
        token: inv.token,
        status: inv.status,
        materialId: inv.materialId,
        material: {
          id: inv.material?.id,
          title: inv.material?.title,
        },
        instructorId: inv.instructorId,
        instructor: {
          id: inv.instructor?.id,
          name: inv.instructor?.name,
          email: inv.instructor?.email,
        },
        userId: inv.userId,
        user: {
          id: inv.user?.id,
          name: inv.user?.name,
          email: inv.user?.email,
        },
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug invitations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations", details: String(error) },
      { status: 500 }
    );
  }
}
