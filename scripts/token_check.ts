
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tokens = ['hdxycn0lmar1bit2zob81j', '7ff9vi5s10lnvldyo1e3cf', 'qodip5t5fhoys4gskdn4j', '32f46znpwbio7ej439iskl', 's2p1z3mcgxlbx4dtlvfvbe', 'iub5zsa4o2qwj9t1l4i9a', 'l39b54o7vffwvma93gq0nq', '0tthd9b9rah9rjyo7uo9d9', '3jxv8v4sb7xv40jd7dj8le', '83rdcmivnm51ihgx3x6g3p', 'd7abx25toa6qo7cdclf3ym', 'cmg9dz2ud7ady7v3c6f1rq', 'p6iab0zeunmpi8ud3les9o']
  
  const results = await prisma.materialinvite.findMany({
    where: { token: { in: tokens } },
    include: { users_materialinvite_userIdTousers: { select: { email: true } } }
  })
  
  console.log(JSON.stringify(results.map(r => ({
    token: r.token,
    userId: r.userId,
    userEmail: r.users_materialinvite_userIdTousers.email,
    status: r.status,
    materialId: r.materialId
  })), null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
