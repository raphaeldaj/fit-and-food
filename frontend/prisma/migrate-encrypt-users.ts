import { PrismaClient } from "@prisma/client";
import { encryptField, encryptFieldDeterministic, decryptField } from "../src/lib/security/crypto";

const prisma = new PrismaClient();

function isAlreadyEncrypted(value: string): boolean {
  const decrypted = decryptField(value);
  return decrypted !== value; // decryptField renvoie la valeur telle quelle si le déchiffrement échoue
}

async function main() {
  const users = await prisma.user.findMany();
  let migrated = 0;

  for (const user of users) {
    if (isAlreadyEncrypted(user.email)) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: encryptField(user.fullName),
        email: encryptFieldDeterministic(user.email),
        phone: encryptFieldDeterministic(user.phone),
        address: user.address ? encryptField(user.address) : null,
      },
    });
    migrated++;
  }

  console.log(`✅ ${migrated} utilisateur(s) migré(s) vers le chiffrement.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
