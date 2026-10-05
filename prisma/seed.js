const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// No Team invite UI exists yet (build step 8), so this is the only way to
// grant admin access right now: seed a known email as OWNER, then log in
// with the magic link that src/auth.ts logs to the console.
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || "punedeveloper@mipl.co.in";

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { role: "OWNER" },
    create: {
      email: OWNER_EMAIL,
      name: "Kargatox Admin",
      role: "OWNER",
    },
  });
  console.log(`Seeded OWNER user: ${owner.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
