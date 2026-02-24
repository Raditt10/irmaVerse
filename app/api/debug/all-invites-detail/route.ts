import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all invitations with full user details
    const invitations = await prisma.materialInvite.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        instructor: {
          select: { id: true, email: true, name: true }
        },
        material: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      take: 20
    });

    return NextResponse.json({
      totalInvitations: invitations.length,
      invitations: invitations.map(inv => ({
        id: inv.id,
        token: inv.token.substring(0, 8) + "...",
        status: inv.status,
        createdAt: inv.createdAt,
        material: inv.material.title,
        instructor: inv.instructor.name + " (" + inv.instructor.email + ")",
        user: inv.user.name + " (" + inv.user.email + ")",
        userId: inv.user.id,
        instructorId: inv.instructor.id
      })),
      allUsers: users
    });
  } catch (error) {
    console.error("[DEBUG-ALL-INVITES] Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
