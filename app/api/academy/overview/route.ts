import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Hitung total user dengan role 'user'
  const totalStudents = await prisma.user.count({ where: { role: "user" } });
  // Hitung total kajian aktif (contoh: dari tabel Material)
  const activeCourses = await prisma.material.count();
  // Hitung sesi selesai (contoh: dari tabel Schedule dengan status 'completed')
  const completedSessions = await prisma.schedule.count({ where: { status: "completed" } });
  // Contoh rating rata-rata (dummy, sesuaikan jika ada tabel rating)
  const averageRating = 0;

  return NextResponse.json({
    stats: {
      totalStudents,
      activeCourses,
      completedSessions,
      averageRating,
    },
    upcomingClasses: [],
    recentActivities: [],
    coursesOverview: [],
  });
}
