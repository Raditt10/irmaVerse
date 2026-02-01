import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const programs = [
      { id: "1", name: "Program Wajib", category: "mandatory" },
      { id: "2", name: "Program Ekstra", category: "extra" },
      { id: "3", name: "Program Next Level", category: "premium" },
    ];
    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}
