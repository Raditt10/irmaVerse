import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { feedback_priority, feedback_type } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as feedback_type | null;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    // Users can only see their own feedback unless they are admin
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      where.userId = session.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    const feedback = await prisma.feature_requests.findMany({
      where,
      include: {
        users: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        admin: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      feedback,
      total: feedback.length,
    });
  } catch (error) {
    console.error("[FEEDBACK GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, description, priority } = body;

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Type, title, and description are required" },
        { status: 400 },
      );
    }

    if (!["feature_request", "bug_report"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 },
      );
    }

    const validPriorities = ["low", "medium", "high", "critical"];
    const finalPriority = validPriorities.includes(priority)
      ? priority
      : "medium";

    const feedback = await prisma.feature_requests.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        type: type as feedback_type,
        title,
        description,
        priority: finalPriority as feedback_priority,
      },
      include: {
        users: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully", feedback },
      { status: 201 },
    );
  } catch (error) {
    console.error("[FEEDBACK POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
