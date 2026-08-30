// // const { PrismaClient } = require("@prisma/client");

// // const globalForPrisma = global;

// // const prisma =
// //   globalForPrisma.prisma ||
// //   new PrismaClient();

// // if (process.env.NODE_ENV !== "production") {
// //   globalForPrisma.prisma = prisma;
// // }

// // module.exports = prisma;


// const { PrismaClient } = require("@prisma/client");

// const globalForPrisma = global;

// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ["query", "info", "warn", "error"], // optional
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// module.exports = prisma;




const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;