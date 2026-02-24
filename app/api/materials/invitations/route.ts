import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get pending invitations for this user
    console.log("Fetching invitations for user:", user.id, user.email);
    
    const invitations = await prisma.materialInvite.findMany({
      where: {
        userId: user.id,
        status: "pending",
      },
      include: {
        material: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found invitations:", invitations.length, invitations);

    return NextResponse.json({
      success: true,
      invitations,
      total: invitations.length,
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch invitations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { token, status } = body; // status: accepted or rejected

    if (!token || !status) {
      return NextResponse.json(
        { error: "Token and status are required" },
        { status: 400 }
      );
    }

    const invite = await prisma.materialInvite.findUnique({
      where: { token },
      include: {
        material: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify invitation is for this user
    if (invite.userId !== user.id) {
      return NextResponse.json(
        { error: "This invitation is not for you" },
        { status: 403 }
      );
    }

    console.log("=== HANDLING INVITATION ===");
    console.log("Token:", token);
    console.log("Status:", status);
    console.log("User:", user.id, user.email);
    console.log("Material:", invite.materialId);

    // Update invitation status
    const updatedInvite = await prisma.materialInvite.update({
      where: { token },
      data: { status },
    });

    // If accepted, create course enrollment
    if (status === "accepted") {
      console.log("Creating CourseEnrollment...");
      const enrollment = await prisma.courseEnrollments.upsert({
        where: {
          materialId_userId: {
            materialId: invite.materialId,
            userId: user.id,
          },
        },
        update: { role: "user" },
        create: {
          materialId: invite.materialId,
          userId: user.id,
          role: "user",
              date: new Date(),
          time: "00:00",
          instructorArrival: "pending",
          StartAt: new Date(),
          EndTime: new Date(),
        },
      });
      console.log("CourseEnrollment created:", enrollment);
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${status}`,
      invite: updatedInvite,
    });
  } catch (error) {
    console.error("Update invitation error:", error);
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
}
