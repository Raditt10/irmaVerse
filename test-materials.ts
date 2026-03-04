import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        users: { select: { name: true } },
        courseenrollment: { select: { id: true } },
        materialinvite: { select: { status: true } },
        program: { select: { id: true, title: true } }
      },
      orderBy: { date: 'desc' },
      take: 2
    });
    console.log('Success, found materials:', materials.length);
  } catch (e) {
    console.error('Error in materials query:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
