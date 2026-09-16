import { PrismaClient } from "@prisma/client";
import { encryptField, decryptField } from "../src/lib/security/crypto";

const prisma = new PrismaClient();

function isAlreadyEncrypted(value: string): boolean {
  return decryptField(value) !== value;
}

async function main() {
  const logs = await prisma.activityLog.findMany();
  let migrated = 0;

  for (const log of logs) {
    if (isAlreadyEncrypted(log.userName)) continue;

    await prisma.activityLog.update({
      where: { id: log.id },
      data: { userName: encryptField(log.userName) },
    });
    migrated++;
  }

  console.log(`✅ ${migrated} entrée(s) de log migrée(s) vers le chiffrement.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });