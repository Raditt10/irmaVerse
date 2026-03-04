import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const comp = await prisma.competition.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  console.log("Prizes array type:", Array.isArray(comp?.prizes));
  console.log("Prizes array content:", JSON.stringify(comp?.prizes, null, 2));

  const comp2 = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  })
  console.log("Recent comps prizes:", comp2.map(c => c.prizes));
}

main().finally(() => prisma.$disconnect())
