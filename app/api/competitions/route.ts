import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all competitions or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    if (id) {
      // Get specific competition by ID
      const competition = await prisma.competition.findUnique({
        where: { id },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              notelp: true,
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
    }

    // Build query filters
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    // Get all competitions
    const competitions = await prisma.competition.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });

    // Parse JSON fields for each competition
    const formattedCompetitions = competitions.map((comp) => ({
      ...comp,
      requirements: comp.requirements ? JSON.parse(comp.requirements) : [],
      judgingCriteria: comp.judgingCriteria
        ? JSON.parse(comp.judgingCriteria)
        : [],
      prizes: comp.prizes ? JSON.parse(comp.prizes) : [],
    }));

    return NextResponse.json(formattedCompetitions);
  } catch (error: any) {
    console.error("Error fetching competitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}

// POST create new competition
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is instructor
    if (session.user.role !== "instruktur") {
      return NextResponse.json(
        { error: "Only instructors can create competitions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      location,
      prize,
      category,
      thumbnailUrl,
      status,
      requirements,
      judgingCriteria,
      prizes,
      contactPerson,
      contactNumber,
      contactEmail,
      maxParticipants,
      schedules,
    } = body;

    // Validate required fields
    if (!title || !description || !date || !location || !prize || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create competition with schedules
    const competition = await prisma.competition.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        prize,
        category,
        thumbnailUrl,
        status: status || "upcoming",
        instructorId: session.user.id,
        requirements: requirements ? JSON.stringify(requirements) : null,
        judgingCriteria: judgingCriteria
          ? JSON.stringify(judgingCriteria)
          : null,
        prizes: prizes ? JSON.stringify(prizes) : null,
        contactPerson,
        contactNumber,
        contactEmail,
        maxParticipants,
        schedules: schedules
          ? {
              create: schedules.map((schedule: any) => ({
                phase: schedule.phase,
                date: schedule.date,
                description: schedule.description,
              })),
            }
          : undefined,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: true,
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error: any) {
    console.error("Error creating competition:", error);
    return NextResponse.json(
      { error: "Failed to create competition" },
      { status: 500 }
    );
  }
}

// PUT update competition
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, schedules, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    // Check if competition exists and user is the owner
    const existingCompetition = await prisma.competition.findUnique({
      where: { id },
    });

    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (
      existingCompetition.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to update this competition" },
        { status: 403 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };

    // Handle date conversion if present
    if (updateData.date) {
      dataToUpdate.date = new Date(updateData.date);
    }

    // Handle JSON fields
    if (updateData.requirements) {
      dataToUpdate.requirements = JSON.stringify(updateData.requirements);
    }
    if (updateData.judgingCriteria) {
      dataToUpdate.judgingCriteria = JSON.stringify(
        updateData.judgingCriteria
      );
    }
    if (updateData.prizes) {
      dataToUpdate.prizes = JSON.stringify(updateData.prizes);
    }

    // Update competition
    const competition = await prisma.competition.update({
      where: { id },
      data: dataToUpdate,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: true,
      },
    });

    // Handle schedules update if provided
    if (schedules) {
      // Delete existing schedules
      await prisma.competitionSchedule.deleteMany({
        where: { competitionId: id },
      });

      // Create new schedules
      await prisma.competitionSchedule.createMany({
        data: schedules.map((schedule: any) => ({
          competitionId: id,
          phase: schedule.phase,
          date: schedule.date,
          description: schedule.description,
        })),
      });
    }

    return NextResponse.json(competition);
  } catch (error: any) {
    console.error("Error updating competition:", error);
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    );
  }
}

// DELETE competition
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    // Check if competition exists and user is the owner
    const existingCompetition = await prisma.competition.findUnique({
      where: { id },
    });

    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (
      existingCompetition.instructorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to delete this competition" },
        { status: 403 }
      );
    }

    // Delete competition (cascades to schedules)
    await prisma.competition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Competition deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting competition:", error);
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    );
  }
}
