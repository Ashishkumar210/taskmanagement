const prisma = require("../config/prisma");

/**
 * Get department list
 */
exports.getDepartmentList = async ({
  search,
  limit,
  offset,
}) => {
  const where = {
    deletedAt: null,

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  /**
   * Fetch departments and count
   * in parallel.
   */
  const [
    departments,
    total,
  ] = await Promise.all([
    prisma.department.findMany({
      where,

      select: {
        id: true,
        name: true,
        code: true,
      },

      orderBy: {
        name: "asc",
      },

      skip: offset,
      take: limit,
    }),

    prisma.department.count({
      where,
    }),
  ]);

  return {
    departments,
    total,
  };
};