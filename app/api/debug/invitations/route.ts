import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get ALL invitations (untuk debugging)
    const allInvitations = await prisma.materialInvite.findMany({
      include: {
        material: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        instructor: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log("All invitations in database:", JSON.stringify(allInvitations, null, 2));

    return NextResponse.json({
      success: true,
      total: allInvitations.length,
      invitations: allInvitations,
    });
  } catch (error) {
    console.error("Debug invitations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
