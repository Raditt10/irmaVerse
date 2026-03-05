import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "instruktur" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instructorId = session.user.id;

  // 1. Total Siswa: Total count of users with role 'user' on the platform
  const totalStudents = await prisma.user.count({ 
    where: { role: "user" } 
  });

  // 2. Kajian Aktif: Count of materials created by the instructor
  const activeCourses = await prisma.material.count({
    where: { instructorId }
  });

  // 3. Sesi Selesai: Materials where all invited participants have recorded attendance
  const instructorMaterials = await prisma.material.findMany({
    where: { instructorId },
    include: {
      materialinvite: {
        where: { status: "accepted" }
      }
    }
  });

  let completedSessions = 0;
  
  // We need to check attendance for each material
  for (const material of instructorMaterials) {
    const inviteCount = material.materialinvite.length;
    if (inviteCount === 0) continue;

    const attendanceCount = await prisma.attendance.count({
      where: {
        materialId: material.id,
        userId: {
          in: material.materialinvite.map(i => i.userId)
        }
      }
    });

    if (attendanceCount >= inviteCount) {
      completedSessions++;
    }
  }

  // 4. Rating Rata-rata Profesional (dari rata-rata per kajian)
  const materialRatings = await Promise.all(instructorMaterials.map(async (mat) => {
    const ratings = await prisma.attendance.findMany({
      where: { materialId: mat.id, rating: { not: null } },
      select: { rating: true }
    });
    
    if (ratings.length === 0) return null;
    
    const sum = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return sum / ratings.length;
  }));

  const validRatings = materialRatings.filter((r): r is number => r !== null);
  const averageRating = validRatings.length > 0
    ? Number((validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length).toFixed(1))
    : 0;

  // 5. Today's Materials (Jadwal Kajian Mendatang)
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rawTodayMaterials = await prisma.material.findMany({
    where: { 
      instructorId,
      date: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      materialinvite: {
        where: { status: "accepted" }
      }
    },
    orderBy: { date: 'asc' }
  });

  const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

  const upcomingClasses = rawTodayMaterials
    .map(m => {
      const startTime = m.startedAt || "00:00";
      // If it's the exact same minute or in the past, consider it ongoing/passed
      const isOngoingOrPast = currentTimeStr >= startTime;
      
      return {
        id: m.id,
        title: m.title,
        time: m.startedAt || "Belum diatur",
        students: m.materialinvite.length,
        room: m.location || "TBA",
        // status is "ongoing" if exactly matching or past, otherwise "upcoming"
        status: isOngoingOrPast ? "ongoing" : "upcoming"
      };
    })
    .filter(kls => kls.status !== "ongoing"); // hide if ongoing or past

  // 6. Recent Activities (Heuristic from multiple models)
  const [latestMaterials, latestSchedules, latestCompetitions, latestNews] = await Promise.all([
    prisma.material.findMany({ where: { instructorId }, orderBy: { updatedAt: 'desc' }, take: 3 }),
    prisma.schedule.findMany({ where: { instructorId }, orderBy: { updatedAt: 'desc' }, take: 3 }),
    prisma.competition.findMany({ where: { instructorId }, orderBy: { updatedAt: 'desc' }, take: 3 }),
    prisma.news.findMany({ where: { authorId: instructorId }, orderBy: { updatedAt: 'desc' }, take: 3 })
  ]);

  const allActivities = [
    ...latestMaterials.map(m => ({
      id: `mat-${m.id}`,
      type: 'material',
      title: `${m.createdAt.getTime() === m.updatedAt.getTime() ? 'Membuat' : 'Mengedit'} Kajian: ${m.title}`,
      updatedAt: m.updatedAt
    })),
    ...latestSchedules.map(s => ({
      id: `sch-${s.id}`,
      type: 'schedule',
      title: `${s.createdAt.getTime() === s.updatedAt.getTime() ? 'Membuat' : 'Mengedit'} Kegiatan: ${s.title}`,
      updatedAt: s.updatedAt
    })),
    ...latestCompetitions.map(c => ({
      id: `comp-${c.id}`,
      type: 'competition',
      title: `${c.createdAt.getTime() === c.updatedAt.getTime() ? 'Membuat' : 'Mengedit'} Lomba: ${c.title}`,
      updatedAt: c.updatedAt
    })),
    ...latestNews.map(n => ({
      id: `news-${n.id}`,
      type: 'news',
      title: `${n.createdAt.getTime() === n.updatedAt.getTime() ? 'Menambahkan' : 'Mengedit'} Berita: ${n.title}`,
      updatedAt: n.updatedAt
    }))
  ];

  // Helper to format relative time
  const getRelativeTime = (date: Date) => {
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    if (minutes > 0) return `${minutes} menit yang lalu`;
    return "Baru saja";
  };

  const recentActivities = allActivities
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3)
    .map(act => ({
      id: act.id,
      title: act.title,
      time: getRelativeTime(act.updatedAt),
      type: act.type
    }));

  // 7. Courses Overview
  const coursesOverview = await Promise.all(instructorMaterials.map(async (mat) => {
    const inviteCount = mat.materialinvite.length;
    const attendanceCount = await prisma.attendance.count({
      where: {
        materialId: mat.id,
        userId: {
          in: mat.materialinvite.map(i => i.userId)
        }
      }
    });

    const progress = inviteCount > 0 ? Math.round((attendanceCount / inviteCount) * 100) : 0;
    
    // Average rating for this material
    const matRatings = await prisma.attendance.findMany({
      where: { materialId: mat.id, rating: { not: null } },
      select: { rating: true }
    });
    const matRating = matRatings.length > 0
      ? (matRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / matRatings.length).toFixed(1)
      : "0";

    return {
      id: mat.id,
      title: mat.title,
      students: inviteCount,
      sessions: attendanceCount,
      rating: matRating,
      progress: progress
    };
  }));

  // 8. Weekly Achievement (Pencapaian Minggu Ini)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyMaterials = await prisma.material.findMany({
    where: { 
      instructorId,
      date: {
        gte: sevenDaysAgo,
        lte: now
      }
    }
  });

  const weeklySessions = weeklyMaterials.length;

  const weeklyMaterialRatings = await Promise.all(weeklyMaterials.map(async (mat) => {
    const ratings = await prisma.attendance.findMany({
      where: { materialId: mat.id, rating: { not: null } },
      select: { rating: true }
    });
    if (ratings.length === 0) return null;
    return ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length;
  }));

  const validWeeklyRatings = weeklyMaterialRatings.filter((r): r is number => r !== null);
  const weeklyRating = validWeeklyRatings.length > 0
    ? Number((validWeeklyRatings.reduce((acc, curr) => acc + curr, 0) / validWeeklyRatings.length).toFixed(1))
    : 0;

  return NextResponse.json({
    stats: {
      totalStudents,
      activeCourses,
      completedSessions,
      averageRating,
    },
    upcomingClasses,
    recentActivities,
    coursesOverview,
    achievement: {
      weeklySessions,
      weeklyRating
    }
  });
}
