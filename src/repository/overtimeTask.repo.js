// const prisma = require("../config/prisma");

// /**
//  * Get Prisma client.
//  *
//  * Allows service transaction to pass `tx`.
//  */
// const getClient = (tx) => tx || prisma;

// /**
//  * Find user
//  */
// exports.findUser = async (userId, tx) => {
//   const db = getClient(tx);

//   return db.user.findFirst({
//     where: {
//       id: Number(userId),
//       deletedAt: null,
//     },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       employeeCode: true,
//       status: true,
//     },
//   });
// };

// /**
//  * Find project
//  */
// exports.findProject = async ({
//   projectId,
//   organizationId,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.project.findFirst({
//     where: {
//       id: Number(projectId),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },
//     select: {
//       id: true,
//       name: true,
//       status: true,
//     },
//   });
// };

// /**
//  * Find task
//  */
// exports.findTask = async ({
//   taskId,
//   organizationId,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.task.findFirst({
//     where: {
//       id: Number(taskId),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },
//     select: {
//       id: true,
//       title: true,
//       description: true,
//       status: true,
//       priority: true,
//       project_id: true,
//       due_date: true,
//     },
//   });
// };

// /**
//  * Create overtime task
//  */
// exports.create = async (
//   {
//     organizationId,
//     userId,
//     taskId,
//     projectId,
//     title,
//     description,
//     overtimeDate,
//     estimatedHours,
//     actualHours,
//     priority,
//     status,
//     reason,
//     createdBy,
//   },
//   tx
// ) => {
//   const db = getClient(tx);

//   return db.overtimeTask.create({
//     data: {
//       organization_id: Number(organizationId),

//       user_id: Number(userId),

//       task_id: taskId
//         ? Number(taskId)
//         : null,

//       project_id: projectId
//         ? Number(projectId)
//         : null,

//       title,

//       description:
//         description || null,

//       overtime_date: overtimeDate,

//       estimated_hours:
//         estimatedHours !== undefined &&
//           estimatedHours !== null
//           ? estimatedHours
//           : null,

//       actual_hours:
//         actualHours !== undefined &&
//           actualHours !== null
//           ? actualHours
//           : 0,

//       priority:
//         priority || "MEDIUM",

//       status:
//         status || "PENDING",

//       reason:
//         reason || null,

//       created_by: Number(createdBy),
//     },

//     include: {
//       user: {
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           employeeCode: true,
//         },
//       },

//       project: {
//         select: {
//           id: true,
//           name: true,
//           status: true,
//         },
//       },

//       task: {
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           status: true,
//           priority: true,
//           due_date: true,
//         },
//       },
//     },
//   });
// };

// /**
//  * Find by ID
//  */
// exports.findById = async ({
//   id,
//   organizationId,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.findFirst({
//     where: {
//       id: Number(id),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },

//     include: {
//       user: {
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           employeeCode: true,
//         },
//       },

//       project: {
//         select: {
//           id: true,
//           name: true,
//           status: true,
//         },
//       },

//       task: {
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           status: true,
//           priority: true,
//           due_date: true,

//           checklist_items: {
//             where: {
//               deleted_at: null,
//             },

//             orderBy: {
//               created_at: "asc",
//             },

//             select: {
//               id: true,
//               title: true,
//               is_completed: true,
//               created_at: true,
//               updated_at: true,
//             },
//           },
//         },
//       },
//     },
//   });
// };

// /**
//  * Find many
//  */
// exports.findMany = async ({
//   where,
//   skip,
//   take,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.findMany({
//     where,

//     skip,
//     take,

//     orderBy: [
//       {
//         overtime_date: "desc",
//       },
//       {
//         created_at: "desc",
//       },
//     ],

//     include: {
//       user: {
//         select: {
//           id: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           employeeCode: true,
//         },
//       },

//       project: {
//         select: {
//           id: true,
//           name: true,
//           status: true,
//         },
//       },

//       task: {
//         select: {
//           id: true,
//           title: true,
//           description: true,
//           status: true,
//           priority: true,
//           due_date: true,

//           checklist_items: {
//             where: {
//               deleted_at: null,
//             },

//             orderBy: {
//               created_at: "asc",
//             },

//             select: {
//               id: true,
//               title: true,
//               is_completed: true,
//             },
//           },
//         },
//       },
//     },
//   });
// };

// /**
//  * Count
//  */
// exports.count = async ({
//   where,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.count({
//     where,
//   });
// };

// /**
//  * Update
//  */
// exports.update = async ({
//   id,
//   organizationId,
//   data,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.updateMany({
//     where: {
//       id: Number(id),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },

//     data,
//   });
// };

// /**
//  * Update status
//  */
// exports.updateStatus = async ({
//   id,
//   organizationId,
//   status,
//   updatedBy,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.updateMany({
//     where: {
//       id: Number(id),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },

//     data: {
//       status,
//       updated_by: Number(updatedBy),
//     },
//   });
// };

// /**
//  * Update hours
//  */
// exports.updateHours = async ({
//   id,
//   organizationId,
//   actualHours,
//   updatedBy,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.updateMany({
//     where: {
//       id: Number(id),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },

//     data: {
//       actual_hours: actualHours,
//       updated_by: Number(updatedBy),
//     },
//   });
// };

// /**
//  * Soft delete
//  */
// exports.softDelete = async ({
//   id,
//   organizationId,
//   deletedBy,
//   tx,
// }) => {
//   const db = getClient(tx);

//   return db.overtimeTask.updateMany({
//     where: {
//       id: Number(id),
//       organization_id: Number(organizationId),
//       deleted_at: null,
//     },

//     data: {
//       deleted_at: new Date(),
//       deleted_by: Number(deletedBy),
//     },
//   });
// };


const prisma = require("../config/prisma");

/**
 * Get Prisma client.
 *
 * If transaction client is supplied, use it.
 * Otherwise use normal Prisma client.
 */
const getClient = (tx) => tx || prisma;

/**
 * ============================================================
 * FIND USER
 * ============================================================
 */
exports.findUser = async (userId, tx) => {
  const db = getClient(tx);

  return db.user.findFirst({
    where: {
      id: Number(userId),
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeCode: true,
      status: true,
    },
  });
};

/**
 * ============================================================
 * FIND PROJECT
 * ============================================================
 */
exports.findProject = async ({
  projectId,
  organizationId,
  tx,
}) => {
  const db = getClient(tx);

  return db.project.findFirst({
    where: {
      id: Number(projectId),
      organization_id: Number(organizationId),
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });
};

/**
 * ============================================================
 * FIND TASK
 * ============================================================
 */
exports.findTask = async ({
  taskId,
  organizationId,
  tx,
}) => {
  const db = getClient(tx);

  return db.task.findFirst({
    where: {
      id: Number(taskId),
      organization_id: Number(organizationId),
      deleted_at: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      project_id: true,
      due_date: true,
    },
  });
};

/**
 * ============================================================
 * CREATE OVERTIME TASK
 * ============================================================
 */
exports.create = async (
  {
    organizationId,
    userId,
    taskId,
    projectId,
    title,
    description,
    overtimeDate,
    estimatedHours,
    actualHours,
    priority,
    status,
    reason,
    createdBy,
  },
  tx
) => {
  const db = getClient(tx);

  return db.overtimeTask.create({
    data: {
      organization_id: Number(organizationId),

      user_id: Number(userId),

      task_id: taskId
        ? Number(taskId)
        : null,

      project_id: projectId
        ? Number(projectId)
        : null,

      title,

      description:
        description || null,

      overtime_date: overtimeDate,

      estimated_hours:
        estimatedHours !== undefined &&
          estimatedHours !== null
          ? estimatedHours
          : null,

      actual_hours:
        actualHours !== undefined &&
          actualHours !== null
          ? actualHours
          : 0,

      priority:
        priority || "MEDIUM",

      status:
        status || "PENDING",

      reason:
        reason || null,

      created_by: Number(createdBy),
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

      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      task: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          due_date: true,

          checklist_items: {
            where: {
              deleted_at: null,
            },
            orderBy: {
              created_at: "asc",
            },
            select: {
              id: true,
              title: true,
              is_completed: true,
            },
          },
        },
      },
    },
  });
};

/**
 * ============================================================
 * FIND BY ID
 * ============================================================
 */
exports.findById = async ({
  id,
  organizationId,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.findFirst({
    where: {
      id: Number(id),
      organization_id: Number(organizationId),
      deleted_at: null,
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

      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      task: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          due_date: true,

          checklist_items: {
            where: {
              deleted_at: null,
            },

            orderBy: {
              created_at: "asc",
            },

            select: {
              id: true,
              title: true,
              is_completed: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      },
    },
  });
};

/**
 * ============================================================
 * FIND MANY
 * ============================================================
 */
exports.findMany = async ({
  where,
  skip,
  take,
  sortBy = "overtime_date",
  sortOrder = "desc",
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.findMany({
    where,

    skip,

    take,

    orderBy: [
      {
        [sortBy]: sortOrder,
      },
      {
        created_at: "desc",
      },
    ],

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

      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },

      task: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          due_date: true,

          checklist_items: {
            where: {
              deleted_at: null,
            },

            orderBy: {
              created_at: "asc",
            },

            select: {
              id: true,
              title: true,
              is_completed: true,
            },
          },
        },
      },
    },
  });
};

/**
 * ============================================================
 * COUNT
 * ============================================================
 */
exports.count = async ({
  where,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.count({
    where,
  });
};

/**
 * ============================================================
 * UPDATE
 * ============================================================
 */
exports.update = async ({
  id,
  organizationId,
  data,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.updateMany({
    where: {
      id: Number(id),
      organization_id: Number(organizationId),
      deleted_at: null,
    },

    data,
  });
};

/**
 * ============================================================
 * UPDATE STATUS
 * ============================================================
 */
exports.updateStatus = async ({
  id,
  organizationId,
  status,
  updatedBy,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.updateMany({
    where: {
      id: Number(id),
      organization_id: Number(organizationId),
      deleted_at: null,
    },

    data: {
      status,
      updated_by: Number(updatedBy),
    },
  });
};

/**
 * ============================================================
 * UPDATE HOURS
 * ============================================================
 */
exports.updateHours = async ({
  id,
  organizationId,
  actualHours,
  updatedBy,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.updateMany({
    where: {
      id: Number(id),
      organization_id: Number(organizationId),
      deleted_at: null,
    },

    data: {
      actual_hours: actualHours,
      updated_by: Number(updatedBy),
    },
  });
};

/**
 * ============================================================
 * SOFT DELETE
 * ============================================================
 */
exports.softDelete = async ({
  id,
  organizationId,
  deletedBy,
  tx,
}) => {
  const db = getClient(tx);

  return db.overtimeTask.updateMany({
    where: {
      id: Number(id),
      organization_id: Number(organizationId),
      deleted_at: null,
    },

    data: {
      deleted_at: new Date(),
      deleted_by: Number(deletedBy),
    },
  });
};




exports.getOvertimeTaskList = async ({
  organization_id,
  created_by,

  search,

  user_id,
  project_id,
  task_id,

  status,
  priority,

  overtime_date_from,
  overtime_date_to,

  created_at_from,
  created_at_to,

  limit,
  offset,

  sortBy,
  sortOrder,
}) => {
  /**
   * -----------------------------------------
   * BASE FILTER
   * -----------------------------------------
   *
   * Organization isolation is mandatory.
   *
   * deleted_at = null ensures soft-deleted
   * overtime tasks are not returned.
   */
  const where = {
    organization_id,
    deleted_at: null,
  };

  /**
   * -----------------------------------------
   * CREATED BY
   * -----------------------------------------
   *
   * If provided, only records created by
   * the authenticated user are returned.
   */
  if (
    created_by !== undefined &&
    created_by !== null &&
    created_by !== ""
  ) {
    where.created_by = Number(created_by);
  }

  /**
   * -----------------------------------------
   * SEARCH
   * -----------------------------------------
   *
   * Search:
   * - overtime title
   * - overtime description
   * - reason
   * - related task title
   * - related project name
   * - employee first name
   * - employee last name
   * - employee email
   * - employee code
   */
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        reason: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        task: {
          is: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },

      {
        project: {
          is: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },

      {
        user: {
          is: {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },

      {
        user: {
          is: {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },

      {
        user: {
          is: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },

      {
        user: {
          is: {
            employeeCode: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  /**
   * -----------------------------------------
   * USER / EMPLOYEE FILTER
   * -----------------------------------------
   */
  if (
    user_id !== undefined &&
    user_id !== null &&
    user_id !== ""
  ) {
    where.user_id = Number(user_id);
  }

  /**
   * -----------------------------------------
   * PROJECT FILTER
   * -----------------------------------------
   */
  if (
    project_id !== undefined &&
    project_id !== null &&
    project_id !== ""
  ) {
    where.project_id = Number(project_id);
  }

  /**
   * -----------------------------------------
   * TASK FILTER
   * -----------------------------------------
   */
  if (
    task_id !== undefined &&
    task_id !== null &&
    task_id !== ""
  ) {
    where.task_id = Number(task_id);
  }

  /**
   * -----------------------------------------
   * STATUS FILTER
   * -----------------------------------------
   */
  if (status) {
    where.status = status;
  }

  /**
   * -----------------------------------------
   * PRIORITY FILTER
   * -----------------------------------------
   */
  if (priority) {
    where.priority = priority;
  }

  /**
   * -----------------------------------------
   * OVERTIME DATE FILTER
   * -----------------------------------------
   */
  if (
    overtime_date_from ||
    overtime_date_to
  ) {
    where.overtime_date = {};

    if (overtime_date_from) {
      where.overtime_date.gte =
        new Date(
          `${overtime_date_from}T00:00:00.000Z`
        );
    }

    if (overtime_date_to) {
      /**
       * Since overtime_date is a DATE field,
       * use next day with lt rather than 23:59:59.
       *
       * This avoids precision problems.
       */
      const nextDay =
        new Date(
          `${overtime_date_to}T00:00:00.000Z`
        );

      nextDay.setUTCDate(
        nextDay.getUTCDate() + 1
      );

      where.overtime_date.lt =
        nextDay;
    }
  }

  /**
   * -----------------------------------------
   * CREATED DATE FILTER
   * -----------------------------------------
   */
  if (
    created_at_from ||
    created_at_to
  ) {
    where.created_at = {};

    if (created_at_from) {
      where.created_at.gte =
        new Date(created_at_from);
    }

    if (created_at_to) {
      where.created_at.lte =
        new Date(created_at_to);
    }
  }

  /**
   * -----------------------------------------
   * SAFE SORT
   * -----------------------------------------
   *
   * sortBy has already been validated.
   */
  const orderBy = {
    [sortBy]: sortOrder,
  };

  /**
   * -----------------------------------------
   * DATABASE QUERIES
   * -----------------------------------------
   *
   * List and count execute in parallel.
   */
  const [
    overtimeTasks,
    total,
  ] = await Promise.all([
    prisma.overtimeTask.findMany({
      where,

      select: {
        id: true,

        organization_id: true,

        task_id: true,
        project_id: true,
        user_id: true,

        title: true,
        description: true,

        overtime_date: true,

        estimated_hours: true,
        actual_hours: true,

        priority: true,
        status: true,

        reason: true,

        created_by: true,
        updated_by: true,

        created_at: true,
        updated_at: true,

        /**
         * -------------------------------------
         * EMPLOYEE
         * -------------------------------------
         */
        user: {
          select: {
            id: true,

            firstName: true,
            lastName: true,

            email: true,
            mobileNo: true,

            employeeCode: true,

            status: true,

            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },

        /**
         * -------------------------------------
         * PROJECT
         * -------------------------------------
         */
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        /**
         * -------------------------------------
         * TASK
         * -------------------------------------
         */
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            due_date: true,
          },
        },
      },

      orderBy,

      skip: offset,
      take: limit,
    }),

    prisma.overtimeTask.count({
      where,
    }),
  ]);

  /**
   * -----------------------------------------
   * FORMAT RESPONSE
   * -----------------------------------------
   *
   * Prisma Decimal objects are converted
   * to numbers for API response.
   */
  const formattedOvertimeTasks =
    overtimeTasks.map((item) => ({
      id: item.id,

      organization_id:
        item.organization_id,

      task_id: item.task_id,
      project_id: item.project_id,
      user_id: item.user_id,

      title: item.title,
      description: item.description,

      overtime_date:
        item.overtime_date,

      estimated_hours:
        item.estimated_hours !== null
          ? Number(item.estimated_hours)
          : null,

      actual_hours:
        item.actual_hours !== null
          ? Number(item.actual_hours)
          : null,

      priority: item.priority,
      status: item.status,

      reason: item.reason,

      created_by: item.created_by,
      updated_by: item.updated_by,

      created_at: item.created_at,
      updated_at: item.updated_at,

      user: item.user
        ? {
          id: item.user.id,

          firstName:
            item.user.firstName,

          lastName:
            item.user.lastName,

          email:
            item.user.email,

          mobileNo:
            item.user.mobileNo,

          employeeCode:
            item.user.employeeCode,

          status:
            item.user.status,

          department:
            item.user.department,
        }
        : null,

      project: item.project,

      task: item.task,

      /**
       * Useful calculated field.
       */
      hours_difference:
        item.estimated_hours !== null &&
          item.actual_hours !== null
          ? Number(
            (
              Number(item.actual_hours) -
              Number(item.estimated_hours)
            ).toFixed(2)
          )
          : null,
    }));

  return {
    overtimeTasks:
      formattedOvertimeTasks,

    total,
  };
};