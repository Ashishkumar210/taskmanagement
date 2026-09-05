const prisma = require("../config/prisma");

/**
 * Create module
 */
exports.createModule = async ({
  organization_id,
  project_id,
  name,
  code,
  description,
  status,
  created_by,
}) => {
  return prisma.projectModule.create({
    data: {
      organization_id,
      project_id,
      name: name.trim(),
      code: code?.trim() || null,
      description: description || null,
      status,
      created_by,
    },
  });
};

/**
 * Check project
 */
exports.findProject = async ({
  project_id,
  organization_id,
}) => {
  return prisma.project.findFirst({
    where: {
      id: project_id,
      organization_id,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

/**
 * Check duplicate module code
 */
exports.findModuleByCode = async ({
  project_id,
  code,
  exclude_id,
}) => {
  return prisma.projectModule.findFirst({
    where: {
      project_id,
      code,
      deleted_at: null,
      ...(exclude_id
        ? {
          NOT: {
            id: exclude_id,
          },
        }
        : {}),
    },
  });
};

/**
 * Get module list
 */
exports.getModuleList = async ({
  organization_id,
  project_id,
  status,
  search,
  skip,
  take,
}) => {
  const where = {
    organization_id,
    deleted_at: null,

    ...(project_id
      ? {
        project_id: Number(project_id),
      }
      : {}),

    ...(status
      ? {
        status,
      }
      : {}),

    ...(search
      ? {
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
      }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.projectModule.findMany({
      where,
      skip,
      take,
      orderBy: {
        created_at: "desc",
      },

      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },

        assignments: {
          where: {
            is_active: true,
          },
          select: {
            id: true,
            user_id: true,
            employee_type: true,
            assigned_at: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                employeeCode: true,
              },
            },
          },
        },
      },
    }),

    prisma.projectModule.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Module details
 */
// exports.getModuleDetails = async ({
//   module_id,
//   organization_id,
// }) => {
//   return prisma.projectModule.findFirst({
//     where: {
//       id: module_id,
//       organization_id,
//       deleted_at: null,
//     },

//     include: {
//       project: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },

//       assignments: {
//         where: {
//           is_active: true,
//         },

//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               employeeCode: true,
//             },
//           },
//         },
//       },

//       work_logs: {
//         orderBy: {
//           created_at: "desc",
//         },

//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               employeeCode: true,
//             },
//           },
//         },
//       },

//       status_logs: {
//         orderBy: {
//           created_at: "desc",
//         },

//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
//         },
//       },
//     },
//   });
// };



exports.getModuleDetails = async ({
  module_id,
  organization_id,
}) => {
  return prisma.projectModule.findFirst({
    where: {
      id: module_id,
      organization_id,
      deleted_at: null,
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },

      assignments: {
        where: {
          is_active: true,
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeCode: true,
            },
          },
        },
      },

      work_logs: {
        orderBy: {
          created_at: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      },

      status_logs: {
        orderBy: {
          changed_at: "desc", // ✅ ProjectModuleStatusLog uses changed_at
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};


/**
 * Check employee
 */
exports.findUser = async (user_id) => {
  return prisma.user.findFirst({
    where: {
      id: user_id,
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeCode: true,
    },
  });
};

/**
 * Check existing assignment
 */
exports.findAssignment = async ({
  module_id,
  user_id,
}) => {
  return prisma.projectModuleAssignment.findFirst({
    where: {
      module_id,
      user_id,
    },
  });
};

/**
 * Assign employee
 */
exports.createAssignment = async ({
  organization_id,
  module_id,
  user_id,
  employee_type,
  assigned_by,
}) => {
  return prisma.projectModuleAssignment.create({
    data: {
      organization_id,
      module_id,
      user_id,
      employee_type,
      assigned_by,
      is_active: true,
    },
  });
};

/**
 * Remove assignment
 */
exports.removeAssignment = async ({
  module_id,
  user_id,
  removed_by,
}) => {
  return prisma.projectModuleAssignment.updateMany({
    where: {
      module_id,
      user_id,
      is_active: true,
    },

    data: {
      is_active: false,
      removed_at: new Date(),
      removed_by,
    },
  });
};







exports.getActivityLogs = async ({
  organization_id,
  user_id,
  project_id,
  page = 1,
  limit = 10,
}) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const where = {
    organization_id,
    deleted_at: null,

    ...(user_id
      ? {
        user_id: Number(user_id),
      }
      : {}),

    ...(project_id
      ? {
        task: {
          project_id: Number(project_id),
        },
      }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.taskActivityLog.findMany({
      where,

      orderBy: {
        created_at: "desc",
      },

      skip,
      take: limit,

      include: {
        task: {
          select: {
            id: true,
            title: true,

            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.taskActivityLog.count({
      where,
    }),
  ]);

  return {
    logs,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};





exports.getModuleStatusLogs = async ({
  organization_id,
  module_id,
  user_id,
  page = 1,
  limit = 10,
}) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const where = {
    organization_id,

    ...(module_id
      ? {
        module_id: Number(module_id),
      }
      : {}),

    ...(user_id
      ? {
        user_id: Number(user_id),
      }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.projectModuleStatusLog.findMany({
      where,

      orderBy: {
        changed_at: "desc",
      },

      skip,
      take: limit,

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },

        module: {
          select: {
            id: true,
            name: true,
            code: true,

            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.projectModuleStatusLog.count({
      where,
    }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
