const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// No Team invite UI exists yet (build step 8), so this is the only way to
// grant admin access right now: seed a known email as OWNER. Password is the
// only sign-in path (magic link was removed — see src/app/admin/login/),
// so without SEED_OWNER_PASSWORD this account is created but can't sign in
// until a password is set some other way (see the warning below).
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || "punedeveloper@mipl.co.in";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD;
const BCRYPT_ROUNDS = 12; // matches src/lib/password-auth.ts

async function main() {
  const password = OWNER_PASSWORD ? await bcrypt.hash(OWNER_PASSWORD, BCRYPT_ROUNDS) : undefined;

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { role: "OWNER", ...(password ? { password } : {}) },
    create: { email: OWNER_EMAIL, name: "Kargatox Admin", role: "OWNER", password },
  });
  console.log(`Seeded OWNER user: ${owner.email}`);
  if (!password) {
    console.warn(
      "No SEED_OWNER_PASSWORD set — this user has no password yet and can't sign in. " +
        "Re-run with SEED_OWNER_PASSWORD set, or set one directly via a one-off Prisma script."
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
