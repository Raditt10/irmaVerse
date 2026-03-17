import prisma from "@/lib/prisma";

type ActivityLogType =
  | "quiz_completed"
  | "material_read"
  | "course_enrolled"
  | "program_enrolled"
  | "attendance_marked"
  | "badge_earned"
  | "level_up"
  | "friend_added"
  | "forum_post"
  | "streak_maintained"
  | "profile_completed"
  | "admin_user_managed"
  | "admin_program_managed"
  | "admin_material_managed"
  | "admin_news_managed"
  | "admin_schedule_managed"
  | "admin_competition_managed"
  | "admin_admin_managed";

interface RecordActivityParams {
  userId: string;
  type: ActivityLogType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Record a user activity log without awarding XP.
 * Used for admin actions, superadmin actions, and other non-gamified activities.
 */
export async function recordActivity({
  userId,
  type,
  title,
  description,
  metadata,
}: RecordActivityParams) {
  try {
    return await prisma.activity_logs.create({
      data: {
        userId,
        type,
        title,
        description,
        metadata: metadata || undefined,
        xpEarned: 0, // Admin activities never award XP
      },
    });
  } catch (error) {
    console.error("Error recording activity:", error);
    // We don't throw error to avoid breaking the main process
    return null;
  }
}
