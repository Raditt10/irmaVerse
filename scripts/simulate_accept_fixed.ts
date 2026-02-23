
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const token = "zy1s5qhnrmgljtgq5wy4"; // Token for KWH 1
  console.log("Simulating acceptance for token:", token);

  const invite = await prisma.materialinvite.findUnique({
    where: { token },
    include: { material: true }
  })

  if (!invite) {
    console.log("Invite not found");
    return;
  }

  console.log("Invite found for user:", invite.userId, "material:", invite.materialId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedInvite = await tx.materialinvite.update({
        where: { id: invite.id },
        data: { status: 'accepted' }
      });
      console.log("Invite updated to accepted");

      const enrollment = await tx.courseenrollment.upsert({
        where: {
          materialId_userId: {
            materialId: invite.materialId,
            userId: invite.userId,
          },
        },
        update: { 
          role: 'user',
          enrolledAt: new Date()
        },
        create: {
          id: `enr-sim-${Date.now()}`,
          materialId: invite.materialId,
          userId: invite.userId,
          role: 'user',
          enrolledAt: new Date(),
        },
      });
      console.log("Enrollment created/updated:", enrollment.id);
      return { updatedInvite, enrollment };
    });
    console.log("Transaction successful!");
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

main().catch(console.error)
