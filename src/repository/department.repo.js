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





/**
 * Find department by name
 *
 * Only active/non-deleted departments
 * are considered duplicates.
 */
exports.findByName =
  async (name) => {
    return prisma.department.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },

        deletedAt: null,
      },

      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  };

/**
 * Find department by code
 */
exports.findByCode =
  async (code) => {
    return prisma.department.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },

        deletedAt: null,
      },

      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  };

/**
 * Create department
 */
exports.createDepartment =
  async ({
    name,
    code,
  }) => {
    return prisma.department.create({
      data: {
        name,
        code,
      },

      select: {
        id: true,

        name: true,

        code: true,

        createdAt: true,

        updatedAt: true,
      },
    });
  };