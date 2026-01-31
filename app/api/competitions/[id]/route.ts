import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            notelp: true,
            bidangKeahlian: true,
          },
        },
        schedules: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const formattedCompetition = {
      ...competition,
      requirements: competition.requirements
        ? JSON.parse(competition.requirements)
        : [],
      judgingCriteria: competition.judgingCriteria
        ? JSON.parse(competition.judgingCriteria)
        : [],
      prizes: competition.prizes ? JSON.parse(competition.prizes) : [],
    };

    return NextResponse.json(formattedCompetition);
  } catch (error: any) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}
