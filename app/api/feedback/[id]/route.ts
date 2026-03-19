import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { feedback_priority, feedback_status } from "@prisma/client";

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
    const { status, priority, response } = body;

    const validStatuses = ["open", "in_progress", "completed", "closed"];
    const validPriorities = ["low", "medium", "high", "critical"];

    const updateData: any = {};
    if (status && validStatuses.includes(status)) {
      updateData.status = status as feedback_status;
    }
    if (priority && validPriorities.includes(priority)) {
      updateData.priority = priority as feedback_priority;
    }
    if (response !== undefined) {
      updateData.response = response;
      updateData.respondedBy = session.user.id;
    }

    const feedback = await prisma.feature_requests.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        admin: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("[FEEDBACK PATCH] Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update feedback" },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const feedback = await prisma.feature_requests.findUnique({
      where: { id },
    });
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    // Users can only delete their own feedback, admins can delete any
    if (
      feedback.userId !== session.user.id &&
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.feature_requests.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Feedback deleted" });
  } catch (error: any) {
    console.error("[FEEDBACK DELETE] Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}
