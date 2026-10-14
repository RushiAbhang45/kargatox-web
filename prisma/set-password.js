const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12; // matches src/lib/password-auth.ts

const VALID_ROLES = ["OWNER", "ADMIN", "EDITOR", "SALES"];
const [, , email, password, role] = process.argv;

if (!email || !password) {
  console.error("Usage: npm run admin:set-password -- <email> <password> [role]");
  console.error(`  role defaults to OWNER if the user doesn't exist yet. Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}
if (role && !VALID_ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

// No Team invite UI exists yet (build step 8), so this — upsert a User row
// with a bcrypt password hash — is the only way to create a new admin
// account or reset an existing one's password. Sign-in is password-only
// (magic link was removed), so a user with no password can't sign in at all.
async function main() {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, ...(role ? { role } : {}) },
    create: { email, password: hash, role: role || "OWNER" },
  });

  console.log(`Set password for ${user.role} user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
