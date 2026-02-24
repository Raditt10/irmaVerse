import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const instructors = await prisma.user.findMany({
      where: { role: "instruktur" },
      select: {
        id: true,
        name: true,
        avatar: true,
        bidangKeahlian: true,
        pengalaman: true,
        // Tambahkan field lain jika ada (rating, studentsCount, kajianCount, dsb)
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(instructors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 });
  }
}
