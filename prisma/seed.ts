import {
  PrismaClient,
  material_grade,
  material_category,
  NotificationType,
  NotificationStatus,
  FriendshipStatus,
  ActivityType,
  BadgeCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding data...");
  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();

  await prisma.userBadge.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.materialinvite.deleteMany();
  await prisma.courseenrollment.deleteMany();
  await prisma.program_enrollment.deleteMany();

  await prisma.material.deleteMany();
  await prisma.program.deleteMany();
  await prisma.news.deleteMany();
  await prisma.schedule.deleteMany();

  await prisma.user.deleteMany();

  console.log("🧹 Database cleared");

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "ustadz.ahmad@irma.com",
      name: "Ustadz Ahmad Zaki",
      password: hashedPassword,
      role: "user",
      notelp: "081234567890",
      address: "Jakarta, Indonesia",
      bio: "Pengajar bijak dengan 15 tahun pengalaman",
      bidangKeahlian: "Akidah dan Aqidah",
      pengalaman:
        "Mengajar sejak tahun 2010 di berbagai pesantren dan institusi pendidikan",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "ustadzah.fatimah@irma.com",
      name: "Ustadzah Fatimah",
      password: hashedPassword,
      role: "instruktur",
      notelp: "082345678901",
      address: "Bandung, Indonesia",
      bio: "Spesialis dalam mengajar Al-Quran dan Tafsir",
      bidangKeahlian: "Al-Quran dan Tafsir",
      pengalaman: "Pengalaman 10 tahun mengajar dan membimbing santri",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "rafa@irma.com",
      name: "Rafa Ardanza",
      password: hashedPassword,
      role: "user",
      notelp: "083456789012",
      address: "Surabaya, Indonesia",
      bio: "Santri yang antusias belajar",
    },
  });

  // Create news articles
  const news1 = await prisma.news.create({
    data: {
      title: "Kedudukan Akal dan Wahyu",
      slug: "kedudukan-akal-dan-wahyu",
      category: "Kajian",
      deskripsi:
        "Memahami hubungan dan kedudukan akal dalam konteks wahyu ilahi",
      content: `# Kedudukan Akal dan Wahyu

Dalam khazanah pemikiran Islam, relasi antara akal dan wahyu telah menjadi topik diskusi yang mendalam dan berkelanjutan.

## Pengertian Akal dalam Islam

Akal merupakan nikmat yang diberikan Allah kepada manusia...

## Kedudukan Wahyu

Wahyu adalah petunjuk langsung dari Allah kepada hamba-Nya...

## Hubungan Akal dan Wahyu

Akal dan wahyu bukan dua hal yang saling bertentangan...`,
      image:
        "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500",
      authorId: user1.id,
    },
  });

  const news2 = await prisma.news.create({
    data: {
      title: "Fiqih Ibadah Sehari-hari",
      slug: "fiqih-ibadah-sehari-hari",
      category: "Pembelajaran",
      deskripsi:
        "Panduan praktis menjalankan ibadah dalam kehidupan sehari-hari",
      content: `# Fiqih Ibadah Sehari-hari

Ibadah bukan hanya dilakukan di masjid, tetapi adalah bagian dari kehidupan sehari-hari seorang Muslim.

## Wudhu yang Sempurna

Wudhu adalah niat untuk membersihkan diri...

## Shalat Dengan Khusyu'

Khusyu' adalah hadirnya hati dalam shalat...`,
      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500",
      authorId: user2.id,
    },
  });

  const news3 = await prisma.news.create({
    data: {
      title: "Tafsir Al-Quran Surat Al-Fatihah",
      slug: "tafsir-al-quran-surat-al-fatihah",
      category: "Tafsir",
      deskripsi: "Penjelasan mendalam tentang surat pertama dalam Al-Quran",
      content: `# Tafsir Al-Quran Surat Al-Fatihah

Surat Al-Fatihah adalah surat pembuka Al-Quran yang penuh dengan makna dan hikmah.

## Bismillah

Membaca dengan nama Allah adalah cara memulai segala aktivitas...

## Alhamdulillah

Segala puji bagi Allah, Tuhan sekalian alam...`,
      image:
        "https://images.unsplash.com/photo-1488173174519-e21cc028cb29?w=500",
      authorId: user2.id,
    },
  });

  const news4 = await prisma.news.create({
    data: {
      title: "Akhlak Mulia dalam Berinteraksi",
      slug: "akhlak-mulia-dalam-berinteraksi",
      category: "Akhlak",
      deskripsi:
        "Mempelajari etika Islam dalam menjalin hubungan dengan sesama",
      content: `# Akhlak Mulia dalam Berinteraksi

Islam mengajarkan akhlak yang luhur dalam setiap aspek interaksi sosial.

## Salam dan Sapa

Memberikan salam adalah bentuk kasih sayang...

## Silaturahmi

Menjaga hubungan baik dengan keluarga dan teman...`,
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500",
      authorId: user1.id,
    },
  });

  const news5 = await prisma.news.create({
    data: {
      title: "Memahami Hadis Nabawi",
      slug: "memahami-hadis-nabawi",
      category: "Pembelajaran",
      deskripsi:
        "Pengenalan tentang hadis dan cara memahami petunjuk Rasulullah",
      content: `# Memahami Hadis Nabawi

Hadis adalah warisan berharga dari Rasulullah Muhammad SAW...

## Definisi Hadis

Hadis adalah segala ucapan, perbuatan, dan taqrir (persetujuan) Rasulullah...

## Tingkatan Hadis

Hadis dibagi menjadi beberapa tingkatan berdasarkan kualitasnya...`,
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
      authorId: user1.id,
    },
  });

  // Create schedules
  const schedule1 = await prisma.schedule.create({
    data: {
      title: "Seminar Akhlak Pemuda",
      description: "Membangun karakter islami generasi muda",
      fullDescription:
        "Generasi muda adalah pilar masa depan umat Islam. Seminar ini menghadirkan diskusi mendalam tentang pembangunan karakter Islami yang kuat di tengah tantangan zaman modern.",
      date: new Date("2026-02-15T09:00:00"),
      time: "09:00 WIB",
      location: "Aula Utama",
      pemateri: "Ustadz Ahmad Zaki",
      status: "segera_hadir",
      instructorId: user1.id,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500",
    },
  });

  const schedule2 = await prisma.schedule.create({
    data: {
      title: "Workshop Tahfidz Al-Quran",
      description: "Meningkatkan kemampuan menghafal Al-Quran",
      fullDescription:
        "Tahfidz Al-Quran adalah pencapaian spiritual tertinggi yang dapat diraih seorang Muslim. Program intensif ini dirancang untuk membantu peserta mengembangkan kemampuan menghafal Al-Quran dengan metode yang telah terbukti efektif.",
      date: new Date("2026-02-20T14:00:00"),
      time: "14:00 WIB",
      location: "Ruang Tahfidz",
      pemateri: "Ustadzah Fatimah",
      status: "segera_hadir",
      instructorId: user2.id,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500",
    },
  });

  const schedule3 = await prisma.schedule.create({
    data: {
      title: "Kajian Tafsir Surat Al-Baqarah",
      description: "Memahami makna mendalam surat Al-Baqarah",
      fullDescription:
        "Surat Al-Baqarah adalah surat terpanjang dalam Al-Quran yang penuh dengan hikmah dan petunjuk. Kajian ini akan membahas ayat demi ayat dengan pendekatan komprehensif.",
      date: new Date("2026-03-01T16:00:00"),
      time: "16:00 WIB",
      location: "Musholla Al-Ikhlas",
      pemateri: "Ustadzah Fatimah",
      status: "segera_hadir",
      instructorId: user2.id,
    },
  });

  // Create materials & instructors
  const instructors = [
    { id: "1", conID: "inst-ahmad", name: "Ustadz Ahmad Zaki" },
    { id: "2", conID: "inst-fatimah", name: "Ustadzah Fatimah" },
    { id: "3", conID: "inst-rizki", name: "Ustadz Muhammad Rizki" },
    { id: "4", conID: "inst-abdullah", name: "Ustadz Abdullah" },
    { id: "5", conID: "inst-ali", name: "Ustadz Ali Hasan" },
    { id: "6", conID: "inst-khadijah", name: "Ustadzah Khadijah" },
  ];

  for (const inst of instructors) {
    await prisma.user.create({
      data: {
        id: (parseInt(inst.id) + 100).toString(),
        name: inst.name,
        email: `${inst.conID}@irma.com`,
        password: hashedPassword,
        role: "instruktur",
      },
    });
  }

  // ── PROGRAMS ──────────────────────────────────────────────────────────────────
  const program1 = await prisma.program.create({
    data: {
      title: "Program Aqidah & Akhlak",
      description:
        "Program pembelajaran aqidah dan akhlak islami untuk santri, mencakup dasar-dasar keimanan dan pembentukan karakter Islami.",
      grade: material_grade.X,
      category: material_category.Wajib,
      instructorId: "101",
      duration: "12 Sesi / 3 Bulan",
      thumbnailUrl: "https://picsum.photos/seed/program1/400/300",
      syllabus: [
        "Pengenalan Aqidah Islam",
        "Rukun Iman dan Penjelasannya",
        "Akhlak Mulia dalam Kehidupan",
        "Adab Sehari-hari",
      ],
      requirements: ["Bisa membaca Al-Quran", "Komitmen hadir tiap sesi"],
      benefits: [
        "Memahami dasar-dasar aqidah Islam",
        "Meningkatkan kualitas akhlak",
        "Mendapat sertifikat kelulusan",
      ],
    },
  });

  const program2 = await prisma.program.create({
    data: {
      title: "Program Tafsir Al-Quran",
      description:
        "Program mendalam tentang tafsir dan ilmu Al-Quran, dirancang untuk santri tingkat lanjut yang ingin memahami makna Al-Quran secara komprehensif.",
      grade: material_grade.XII,
      category: material_category.NextLevel,
      instructorId: "102",
      duration: "16 Sesi / 4 Bulan",
      thumbnailUrl: "https://picsum.photos/seed/program2/400/300",
      syllabus: [
        "Ilmu Tajwid Lanjutan",
        "Tafsir Surat-surat Pendek",
        "Tafsir Surat Al-Baqarah",
        "Metode Penafsiran Al-Quran",
      ],
      requirements: [
        "Hafal minimal Juz 30",
        "Pengalaman mengaji minimal 2 tahun",
      ],
      benefits: [
        "Mampu membaca Al-Quran dengan tartil",
        "Memahami makna dan tafsir ayat",
        "Meningkatkan kecintaan terhadap Al-Quran",
      ],
    },
  });

  // ── MATERIALS ─────────────────────────────────────────────────────────────────
  const materialsData = [
    {
      title: "Kedudukan Akal dan Wahyu",
      description: "Materi tentang adab dalam Islam",
      grade: "X",
      category: "Wajib",
      thumbnailUrl: "https://picsum.photos/seed/kajian1/400/300",
      instructorId: 101,
      date: "2024-11-25",
      startedAt: "15:00 - 17:00",
      participants: 45,
      programId: program1.id,
    },
    {
      title: "Fiqih Ibadah Sehari-hari",
      description: "Materi tentang fiqih ibadah",
      grade: "XI",
      category: "Wajib",
      thumbnailUrl: "https://picsum.photos/seed/kajian2/400/300",
      instructorId: 102,
      date: "2024-11-28",
      startedAt: "14:00 - 16:00",
      participants: 38,
      programId: program2.id,
    },
    {
      title: "Tafsir Al-Quran: Surah Al-Baqarah",
      description: "Materi tentang tafsir Al-Quran",
      grade: "XII",
      category: "Next Level",
      thumbnailUrl: "https://picsum.photos/seed/kajian3/400/300",
      instructorId: 103,
      date: "2024-12-01",
      startedAt: "15:00 - 17:00",
      participants: 52,
      programId: program2.id,
    },
    {
      title: "Sejarah Khulafaur Rasyidin",
      description: "Materi tentang sejarah Khulafaur Rasyidin",
      grade: "X",
      category: "Ekstra",
      thumbnailUrl: "https://picsum.photos/seed/kajian4/400/300",
      instructorId: 104,
      date: "2024-12-05",
      startedAt: "13:00 - 15:00",
      participants: 41,
      programId: null,
    },
    {
      title: "Rukun Iman dan Implementasinya",
      description: "Materi tentang rukun iman dan implementasinya",
      grade: "XI",
      category: "Ekstra",
      thumbnailUrl: "https://picsum.photos/seed/kajian5/400/300",
      instructorId: 105,
      date: "2024-12-08",
      startedAt: "14:00 - 16:00",
      participants: 47,
      programId: program1.id,
    },
    {
      title: "Akhlak kepada Orang Tua",
      description: "Materi tentang akhlak kepada orang tua",
      grade: "XII",
      category: "Next Level",
      thumbnailUrl: "https://picsum.photos/seed/kajian6/400/300",
      instructorId: 106,
      date: "2024-12-10",
      startedAt: "15:00 - 17:00",
      participants: 55,
      programId: null,
    },
  ];

  for (const mt of materialsData) {
    await prisma.material.create({
      data: {
        title: mt.title,
        description: mt.description,
        grade: mapGrade(mt.grade),
        category: mapCourseCategory(mt.category),
        thumbnailUrl: mt.thumbnailUrl,
        instructorId: mt.instructorId.toString(),
        date: new Date(mt.date),
        startedAt: mt.startedAt,
        participants: mt.participants.toString(),
        programId: mt.programId ?? null,
      },
    });
  }

  // ── PROGRAM ENROLLMENTS ───────────────────────────────────────────────────────
  // Enroll user3 (Rafa) into program1
  await prisma.program_enrollment.create({
    data: { programId: program1.id, userId: user3.id },
  });

  // ── FRIENDSHIPS ────────────────────────────────────────────────────────────────
  // Create sample friendships for testing
  // user1 follow user2 (pending - one direction)
  await prisma.friendship.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
      status: "pending",
    },
  });

  // user2 follow user1 (creates mutual/accepted)
  await prisma.friendship.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
      status: "accepted", // Will be set to accepted since user1 already follows user2
    },
  });

  // user1 follow user3 (accepted - mutual)
  await prisma.friendship.create({
    data: {
      followerId: user1.id,
      followingId: user3.id,
      status: "accepted",
    },
  });

  // user3 follow user1 (also accepted - mutual)
  await prisma.friendship.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
      status: "accepted",
    },
  });

  // user2 follow user3 (pending)
  await prisma.friendship.create({
    data: {
      followerId: user2.id,
      followingId: user3.id,
      status: "pending",
    },
  });

  // Several instructors create sample friendships
  // user1 follow instructor user2
  await prisma.friendship.create({
    data: {
      followerId: user1.id,
      followingId: "102",
      status: "accepted",
    },
  });

  // Create sample notifications for user3 (Rafa)
  // 1. Basic notification
  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "basic",
      status: "unread",
      title: "Selamat Datang di IRMA Verse!",
      message:
        "Assalamualaikum! Selamat bergabung di platform IRMA Verse. Jelajahi fitur-fitur yang tersedia dan mulai perjalanan belajarmu.",
      icon: "megaphone",
      actionUrl: "/overview",
    },
  });

  // 2. Basic notification (schedule reminder)
  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "basic",
      status: "unread",
      title: "Jadwal Baru: Seminar Akhlak Pemuda",
      message:
        "Jadwal baru telah ditambahkan oleh Ustadz Ahmad Zaki. Seminar Akhlak Pemuda akan dilaksanakan pada 15 Feb 2026.",
      icon: "calendar",
      resourceType: "schedule",
      resourceId: schedule1.id,
      actionUrl: `/schedule/${schedule1.id}`,
      senderId: user1.id,
    },
  });

  // 3. Basic notification (already read)
  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "basic",
      status: "read",
      title: "Berita Baru: Kedudukan Akal dan Wahyu",
      message:
        "Artikel terbaru telah diterbitkan. Baca selengkapnya tentang hubungan akal dan wahyu dalam perspektif Islam.",
      icon: "bell",
      resourceType: "news",
      resourceId: news1.id,
      actionUrl: `/news/${news1.slug}`,
      senderId: user1.id,
    },
  });

  // 4. Invitation notification (with MaterialInvite)
  const inviteToken1 =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Create the materialinvite first
  await prisma.materialinvite.create({
    data: {
      materialId: (await prisma.material.findFirst({
        where: { instructorId: "101" },
      }))!.id,
      instructorId: "101",
      userId: user3.id,
      token: inviteToken1,
      status: "pending",
    },
  });

  const material101 = await prisma.material.findFirst({
    where: { instructorId: "101" },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "invitation",
      status: "unread",
      title: material101?.title || "Undangan Kajian",
      message: `Ustadz Ahmad Zaki mengundang Anda untuk bergabung ke kajian "${material101?.title || "Materi"}"`,
      icon: "book",
      resourceType: "material",
      resourceId: material101?.id,
      actionUrl: `/materials/${material101?.id}`,
      inviteToken: inviteToken1,
      senderId: "101",
    },
  });

  // 5. Another invitation notification
  const inviteToken2 =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const material102 = await prisma.material.findFirst({
    where: { instructorId: "102" },
  });

  await prisma.materialinvite.create({
    data: {
      materialId: material102!.id,
      instructorId: "102",
      userId: user3.id,
      token: inviteToken2,
      status: "pending",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      type: "invitation",
      status: "unread",
      title: material102?.title || "Undangan Kajian",
      message: `Ustadzah Fatimah mengundang Anda untuk bergabung ke kajian "${material102?.title || "Materi"}"`,
      icon: "book",
      resourceType: "material",
      resourceId: material102?.id,
      actionUrl: `/materials/${material102?.id}`,
      inviteToken: inviteToken2,
      senderId: "102",
    },
  });

  // ── BADGES ──────────────────────────────────────────────────────────────────
  console.log("🏅 Creating badges...");
  const badgesData: {
    code: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    requirement: string;
    xpReward: number;
  }[] = [
    {
      code: "first_quiz",
      name: "Quiz Pertama",
      description: "Menyelesaikan quiz pertamamu",
      icon: "🎯",
      category: "learning",
      requirement: "Selesaikan 1 quiz",
      xpReward: 50,
    },
    {
      code: "quiz_master",
      name: "Master Quiz",
      description: "Menyelesaikan 10 quiz",
      icon: "🧠",
      category: "learning",
      requirement: "Selesaikan 10 quiz",
      xpReward: 200,
    },
    {
      code: "quiz_legend",
      name: "Legenda Quiz",
      description: "Menyelesaikan 50 quiz",
      icon: "👑",
      category: "learning",
      requirement: "Selesaikan 50 quiz",
      xpReward: 500,
    },
    {
      code: "streak_3",
      name: "Konsisten 3 Hari",
      description: "Login 3 hari berturut-turut",
      icon: "🔥",
      category: "streak",
      requirement: "Streak 3 hari",
      xpReward: 75,
    },
    {
      code: "streak_7",
      name: "Semangat Mingguan",
      description: "Login 7 hari berturut-turut",
      icon: "⚡",
      category: "streak",
      requirement: "Streak 7 hari",
      xpReward: 150,
    },
    {
      code: "streak_30",
      name: "Istiqomah",
      description: "Login 30 hari berturut-turut",
      icon: "💎",
      category: "streak",
      requirement: "Streak 30 hari",
      xpReward: 500,
    },
    {
      code: "first_friend",
      name: "Teman Pertama",
      description: "Menambahkan teman pertamamu",
      icon: "🤝",
      category: "social",
      requirement: "Tambahkan 1 teman",
      xpReward: 30,
    },
    {
      code: "social_butterfly",
      name: "Kupu-Kupu Sosial",
      description: "Memiliki 10 teman",
      icon: "🦋",
      category: "social",
      requirement: "Miliki 10 teman",
      xpReward: 200,
    },
    {
      code: "community_pillar",
      name: "Pilar Komunitas",
      description: "Memiliki 50 teman",
      icon: "🏛️",
      category: "social",
      requirement: "Miliki 50 teman",
      xpReward: 500,
    },
    {
      code: "level_5",
      name: "Naik Kelas",
      description: "Mencapai Level 5",
      icon: "⭐",
      category: "achievement",
      requirement: "Capai Level 5",
      xpReward: 100,
    },
    {
      code: "level_10",
      name: "Pelajar Handal",
      description: "Mencapai Level 10",
      icon: "🌟",
      category: "achievement",
      requirement: "Capai Level 10",
      xpReward: 250,
    },
    {
      code: "level_20",
      name: "Ulama Digital",
      description: "Mencapai Level 20",
      icon: "✨",
      category: "achievement",
      requirement: "Capai Level 20",
      xpReward: 500,
    },
    {
      code: "active_learner",
      name: "Pelajar Aktif",
      description: "Mengikuti 5 program",
      icon: "📚",
      category: "learning",
      requirement: "Ikuti 5 program",
      xpReward: 150,
    },
    {
      code: "forum_contributor",
      name: "Kontributor Forum",
      description: "Membuat 10 post di forum",
      icon: "💬",
      category: "social",
      requirement: "Buat 10 post forum",
      xpReward: 100,
    },
    {
      code: "points_1000",
      name: "Seribu Poin",
      description: "Mengumpulkan 1000 poin XP",
      icon: "🎖️",
      category: "achievement",
      requirement: "Kumpulkan 1000 XP",
      xpReward: 100,
    },
    {
      code: "points_5000",
      name: "Lima Ribu Poin",
      description: "Mengumpulkan 5000 poin XP",
      icon: "🏆",
      category: "achievement",
      requirement: "Kumpulkan 5000 XP",
      xpReward: 300,
    },
  ];

  const badges: Record<string, string> = {};
  for (const b of badgesData) {
    const created = await prisma.badge.create({ data: b });
    badges[b.code] = created.id;
  }

  // ── ACTIVITY LOGS ─────────────────────────────────────────────────────────────
  console.log("📝 Creating activity logs...");
  const now = new Date();

  // Give user1 & user3 some XP points for demo purposes
  await prisma.user.update({
    where: { id: user1.id },
    data: {
      points: 320,
      level: 3,
      streak: 5,
      badges: 2,
      quizzes: 4,
      averageScore: 82,
    },
  });
  await prisma.user.update({
    where: { id: user3.id },
    data: {
      points: 185,
      level: 2,
      streak: 3,
      badges: 1,
      quizzes: 2,
      averageScore: 75,
    },
  });
  await prisma.user.update({
    where: { id: user2.id },
    data: {
      points: 560,
      level: 5,
      streak: 12,
      badges: 4,
      quizzes: 8,
      averageScore: 88,
    },
  });

  // user1 activities
  const activitiesUser1: {
    type: ActivityType;
    title: string;
    description: string;
    xpEarned: number;
    daysAgo: number;
  }[] = [
    {
      type: "quiz_completed",
      title: "Menyelesaikan Quiz: Rukun Iman",
      description: "Skor 85/100 pada quiz Rukun Iman",
      xpEarned: 75,
      daysAgo: 0,
    },
    {
      type: "program_enrolled",
      title: "Mendaftar Program Aqidah & Akhlak",
      description: "Bergabung di program pembelajaran aqidah",
      xpEarned: 40,
      daysAgo: 1,
    },
    {
      type: "friend_added",
      title: "Menambahkan teman baru",
      description: "Berteman dengan Ustadzah Fatimah",
      xpEarned: 15,
      daysAgo: 2,
    },
    {
      type: "quiz_completed",
      title: "Menyelesaikan Quiz: Fiqih Shalat",
      description: "Skor 90/100 pada quiz Fiqih Shalat",
      xpEarned: 75,
      daysAgo: 3,
    },
    {
      type: "badge_earned",
      title: "Badge Diperoleh: Quiz Pertama",
      description: "Mendapatkan badge Quiz Pertama!",
      xpEarned: 50,
      daysAgo: 3,
    },
    {
      type: "material_read",
      title: "Membaca Materi: Kedudukan Akal dan Wahyu",
      description: "Menyelesaikan bacaan materi",
      xpEarned: 20,
      daysAgo: 5,
    },
    {
      type: "streak_maintained",
      title: "Streak 5 Hari!",
      description: "Berhasil login 5 hari berturut-turut",
      xpEarned: 35,
      daysAgo: 0,
    },
    {
      type: "level_up",
      title: "Naik ke Level 3!",
      description: "Selamat! Kamu sekarang Pencari Ilmu",
      xpEarned: 0,
      daysAgo: 1,
    },
  ];

  for (const a of activitiesUser1) {
    const d = new Date(now);
    d.setDate(d.getDate() - a.daysAgo);
    d.setHours(d.getHours() - Math.floor(Math.random() * 12));
    await prisma.activityLog.create({
      data: {
        userId: user1.id,
        type: a.type,
        title: a.title,
        description: a.description,
        xpEarned: a.xpEarned,
        createdAt: d,
      },
    });
  }

  // user3 activities
  const activitiesUser3: {
    type: ActivityType;
    title: string;
    description: string;
    xpEarned: number;
    daysAgo: number;
  }[] = [
    {
      type: "program_enrolled",
      title: "Mendaftar Program Aqidah & Akhlak",
      description: "Bergabung di program pembelajaran",
      xpEarned: 40,
      daysAgo: 0,
    },
    {
      type: "quiz_completed",
      title: "Menyelesaikan Quiz: Adab Belajar",
      description: "Skor 72/100 pada quiz Adab Belajar",
      xpEarned: 50,
      daysAgo: 1,
    },
    {
      type: "friend_added",
      title: "Menambahkan teman baru",
      description: "Berteman dengan Ustadz Ahmad Zaki",
      xpEarned: 15,
      daysAgo: 2,
    },
    {
      type: "material_read",
      title: "Membaca Materi: Fiqih Ibadah",
      description: "Menyelesaikan bacaan materi fiqih",
      xpEarned: 20,
      daysAgo: 4,
    },
    {
      type: "level_up",
      title: "Naik ke Level 2!",
      description: "Selamat! Kamu sekarang Pelajar",
      xpEarned: 0,
      daysAgo: 1,
    },
    {
      type: "badge_earned",
      title: "Badge Diperoleh: Teman Pertama",
      description: "Mendapatkan badge Teman Pertama!",
      xpEarned: 30,
      daysAgo: 2,
    },
  ];

  for (const a of activitiesUser3) {
    const d = new Date(now);
    d.setDate(d.getDate() - a.daysAgo);
    d.setHours(d.getHours() - Math.floor(Math.random() * 12));
    await prisma.activityLog.create({
      data: {
        userId: user3.id,
        type: a.type,
        title: a.title,
        description: a.description,
        xpEarned: a.xpEarned,
        createdAt: d,
      },
    });
  }

  // user2 activities (instruktur)
  const activitiesUser2: {
    type: ActivityType;
    title: string;
    description: string;
    xpEarned: number;
    daysAgo: number;
  }[] = [
    {
      type: "quiz_completed",
      title: "Menyelesaikan Quiz: Tajwid Lanjutan",
      description: "Skor 95/100",
      xpEarned: 75,
      daysAgo: 0,
    },
    {
      type: "quiz_completed",
      title: "Menyelesaikan Quiz: Tafsir Al-Baqarah",
      description: "Skor 88/100",
      xpEarned: 75,
      daysAgo: 1,
    },
    {
      type: "badge_earned",
      title: "Badge Diperoleh: Master Quiz",
      description: "Mendapatkan badge Master Quiz!",
      xpEarned: 200,
      daysAgo: 1,
    },
    {
      type: "streak_maintained",
      title: "Streak 7 Hari!",
      description: "Login 7 hari berturut-turut",
      xpEarned: 35,
      daysAgo: 2,
    },
    {
      type: "friend_added",
      title: "Menambahkan teman baru",
      description: "Berteman dengan Rafa Ardanza",
      xpEarned: 15,
      daysAgo: 3,
    },
    {
      type: "level_up",
      title: "Naik ke Level 5!",
      description: "Selamat! Kamu sekarang Penuntut Ilmu",
      xpEarned: 0,
      daysAgo: 2,
    },
  ];

  for (const a of activitiesUser2) {
    const d = new Date(now);
    d.setDate(d.getDate() - a.daysAgo);
    d.setHours(d.getHours() - Math.floor(Math.random() * 12));
    await prisma.activityLog.create({
      data: {
        userId: user2.id,
        type: a.type,
        title: a.title,
        description: a.description,
        xpEarned: a.xpEarned,
        createdAt: d,
      },
    });
  }

  // ── USER BADGES ───────────────────────────────────────────────────────────────
  console.log("🎖️ Assigning badges to users...");

  // user1: first_quiz, streak_3
  await prisma.userBadge.create({
    data: {
      userId: user1.id,
      badgeId: badges["first_quiz"],
      earnedAt: new Date(now.getTime() - 3 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: user1.id,
      badgeId: badges["streak_3"],
      earnedAt: new Date(now.getTime() - 1 * 86400000),
    },
  });

  // user2: first_quiz, quiz_master, streak_3, streak_7
  await prisma.userBadge.create({
    data: {
      userId: user2.id,
      badgeId: badges["first_quiz"],
      earnedAt: new Date(now.getTime() - 10 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: user2.id,
      badgeId: badges["quiz_master"],
      earnedAt: new Date(now.getTime() - 1 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: user2.id,
      badgeId: badges["streak_3"],
      earnedAt: new Date(now.getTime() - 8 * 86400000),
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: user2.id,
      badgeId: badges["streak_7"],
      earnedAt: new Date(now.getTime() - 2 * 86400000),
    },
  });

  // user3: first_friend
  await prisma.userBadge.create({
    data: {
      userId: user3.id,
      badgeId: badges["first_friend"],
      earnedAt: new Date(now.getTime() - 2 * 86400000),
    },
  });

  console.log("✅ Data seeding completed!");
  console.log("📊 Summary:");
  console.log(`   - Users: 3 + 6 instructors`);
  console.log(`   - News: 5`);
  console.log(`   - Schedules: 3`);
  console.log(
    `   - Programs: 2 (program1 dengan 3 materi, program2 dengan 2 materi)`,
  );
  console.log(`   - Materials: 6 (4 terhubung ke program, 2 mandiri)`);
  console.log(`   - Program Enrollments: 1 (Rafa → Program Aqidah & Akhlak)`);
  console.log(`   - Friendships: 6 (mix of pending dan accepted)`);
  console.log(`   - Notifications: 5 (3 basic + 2 invitations)`);
  console.log(`   - Material Invites: 2`);
  console.log(
    `   - Badges: ${badgesData.length} (learning, social, achievement, streak)`,
  );
  console.log(
    `   - Activity Logs: ${activitiesUser1.length + activitiesUser2.length + activitiesUser3.length} entries`,
  );
  console.log(`   - User Badges: 7 (user1: 2, user2: 4, user3: 1)`);
  console.log("\n💡 Test the search with these keywords:");
  console.log('   - "kedudukan" (untuk mencari berita tentang akal dan wahyu)');
  console.log('   - "ahmad" (untuk mencari instruktur)');
  console.log('   - "tafsir" (untuk mencari artikel tafsir)');
  console.log('   - "rafa" (untuk mencari pengguna)');
  console.log("\n👥 Friendship test data:");
  console.log(`   - user1 ↔ user2: mutual (accepted)`);
  console.log(`   - user1 ↔ user3: mutual (accepted)`);
  console.log(`   - user2 → user3: one-way (pending)`);
  console.log("\n🏅 Gamification test data:");
  console.log(`   - user1: Level 3, 320 XP, 2 badges (first_quiz, streak_3)`);
  console.log(
    `   - user2: Level 5, 560 XP, 4 badges (first_quiz, quiz_master, streak_3, streak_7)`,
  );
  console.log(`   - user3: Level 2, 185 XP, 1 badge (first_friend)`);
}

function mapGrade(value: string): material_grade {
  switch (value) {
    case "X":
      return material_grade.X;
    case "XI":
      return material_grade.XI;
    case "XII":
      return material_grade.XII;
    default:
      throw new Error(`Invalid grade: ${value}`);
  }
}
function mapCourseCategory(value: string): material_category {
  switch (value) {
    case "Wajib":
      return material_category.Wajib;
    case "Ekstra":
      return material_category.Extra;
    case "Next Level":
      return material_category.NextLevel;
    case "Susulan":
      return material_category.Susulan;
    default:
      throw new Error(`Invalid course category: ${value}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
