import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.material.findFirst({orderBy: {createdAt: "desc"}}).then(m => {
  console.log("TITLE:", m?.title);
  console.log("CONTENT:", m?.content);
  console.log("LINK:", m?.link);
  console.log("TYPE:", m?.materialType);
}).finally(() => p.$disconnect());
