import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const comp = await prisma.competition.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  console.log(JSON.stringify(comp?.prizes, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
