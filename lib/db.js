// Prisma client singleton, cached on `global` so repeated serverless invocations in
// the same warm Vercel instance (or hot reloads in local dev) reuse one connection
// pool instead of opening a new one per request.
const { PrismaClient } = require("@prisma/client");

const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

module.exports = { prisma };
