const prisma = require("../config/prisma");

/**
 * Get project list
 */
exports.getProjectList = async ({
  organization_id,

  search,

  status,

  limit,

  offset,

  sortBy,

  sortOrder,
}) => {
  /**
   * Organization isolation.
   *
   * deleted_at must be null.
   */
  const where = {
    organization_id,

    deleted_at: null,

    ...(status && {
      status,
    }),

    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  /**
   * Safe sorting.
   *
   * sortBy was already validated
   * by the service/validator.
   */
  const orderBy = {
    [sortBy]: sortOrder,
  };

  /**
   * Fetch projects and count
   * in parallel.
   */
  const [
    projects,
    total,
  ] = await Promise.all([
    prisma.project.findMany({
      where,

      select: {
        id: true,

        name: true,

        description: true,

        status: true,

        created_at: true,

        updated_at: true,

        /**
         * Number of tasks
         */
        _count: {
          select: {
            tasks: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
      },

      orderBy,

      skip: offset,

      take: limit,
    }),

    prisma.project.count({
      where,
    }),
  ]);

  /**
   * Format response.
   */
  const formattedProjects =
    projects.map(
      (project) => ({
        id: project.id,

        name: project.name,

        description:
          project.description,

        status:
          project.status,

        taskCount:
          project._count.tasks,

        created_at:
          project.created_at,

        updated_at:
          project.updated_at,
      })
    );

  return {
    projects:
      formattedProjects,

    total,
  };
};