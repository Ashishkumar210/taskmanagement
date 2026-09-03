const prisma = require("../config/prisma");

/**
 * Get employee tasks
 *
 * Tasks are determined from DailyWorkLog
 * because your current Task model does not
 * have an assigned employee relation.
 */
exports.getEmployeeTasks = async ({
  employeeId,
  organizationId,
  page,
  limit,
  search,
  status,
  priority,
  projectId,
  fromDate,
  toDate,
  sortBy,
  sortOrder,
}) => {
  const skip = (page - 1) * limit;

  /**
   * First get task IDs worked on by employee.
   */
  const workLogWhere = {
    user_id: employeeId,

    organization_id: organizationId,

    deleted_at: null,
  };

  if (fromDate || toDate) {
    workLogWhere.log_date = {};

    if (fromDate) {
      workLogWhere.log_date.gte = fromDate;
    }

    if (toDate) {
      workLogWhere.log_date.lt = toDate;
    }
  }

  const employeeTaskRows =
    await prisma.dailyWorkLog.findMany({
      where: workLogWhere,

      select: {
        task_id: true,
      },

      distinct: ["task_id"],
    });

  const taskIds =
    employeeTaskRows
      .map((row) => row.task_id)
      .filter(Boolean);

  if (!taskIds.length) {
    return {
      items: [],
      total: 0,
    };
  }

  /**
   * Task filters
   */
  const where = {
    id: {
      in: taskIds,
    },

    organization_id: organizationId,

    deleted_at: null,
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (projectId) {
    where.project_id = Number(projectId);
  }

  /**
   * Count
   */
  const total =
    await prisma.task.count({
      where,
    });

  /**
   * Sorting
   */
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "due_date",
    "title",
    "priority",
    "status",
  ];

  const safeSortBy =
    allowedSortFields.includes(sortBy)
      ? sortBy
      : "updated_at";

  const safeSortOrder =
    sortOrder === "asc"
      ? "asc"
      : "desc";

  /**
   * Tasks
   */
  const tasks =
    await prisma.task.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        [safeSortBy]: safeSortOrder,
      },

      select: {
        id: true,

        title: true,

        description: true,

        due_date: true,

        priority: true,

        status: true,

        project_id: true,

        created_at: true,

        updated_at: true,

        project: {
          select: {
            id: true,

            name: true,

            status: true,
          },
        },

        checklist_items: {
          where: {
            deleted_at: null,
          },

          select: {
            id: true,

            title: true,

            is_completed: true,
          },
        },
      },
    });

  /**
   * Get work statistics for returned tasks
   */
  const taskWorkStats =
    await prisma.dailyWorkLog.groupBy({
      by: ["task_id"],

      where: {
        ...workLogWhere,

        task_id: {
          in: tasks.map(
            (task) => task.id
          ),
        },
      },

      _sum: {
        hours_worked: true,
      },

      _count: {
        id: true,
      },

      _max: {
        created_at: true,
      },
    });

  const workMap =
    new Map(
      taskWorkStats.map(
        (item) => [
          item.task_id,
          item,
        ]
      )
    );

  /**
   * Format response
   */
  const items =
    tasks.map((task) => {
      const work =
        workMap.get(task.id);

      const checklist =
        task.checklist_items || [];

      const totalChecklist =
        checklist.length;

      const completedChecklist =
        checklist.filter(
          (item) =>
            item.is_completed
        ).length;

      const progress =
        totalChecklist > 0
          ? Math.round(
            (completedChecklist /
              totalChecklist) *
            100
          )
          : task.status ===
            "COMPLETED"
            ? 100
            : 0;

      return {
        id: task.id,

        title: task.title,

        description: task.description,

        priority: task.priority,

        status: task.status,

        dueDate: task.due_date,

        createdAt: task.created_at,

        updatedAt: task.updated_at,

        project: task.project
          ? {
            id:
              task.project.id,

            name:
              task.project.name,

            status:
              task.project.status,
          }
          : null,

        checklist: {
          total:
            totalChecklist,

          completed:
            completedChecklist,

          remaining:
            totalChecklist -
            completedChecklist,

          progress,
        },

        work: {
          totalHoursSpent:
            Number(
              work?._sum
                ?.hours_worked || 0
            ),

          workLogCount:
            work?._count?.id || 0,

          lastWorkedAt:
            work?._max?.created_at ||
            null,
        },
      };
    });

  return {
    items,
    total,
  };
};






/**
 * Get tasks created by user
 */
exports.getMyTasks = async ({
  organizationId,
  userId,
  projectId,
  status,
  priority,
  search,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;

  const where = {
    organization_id: organizationId,
    created_by: userId,
    deleted_at: null,
  };

  /**
   * Project filter
   */
  if (projectId) {
    where.project_id = projectId;
  }

  /**
   * Status filter
   */
  if (status) {
    where.status = status;
  }

  /**
   * Priority filter
   */
  if (priority) {
    where.priority = priority;
  }

  /**
   * Search by task title
   */
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [total, tasks] =
    await prisma.$transaction([
      /**
       * Total
       */
      prisma.task.count({
        where,
      }),

      /**
       * Tasks
       */
      prisma.task.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          created_at: "desc",
        },

        select: {
          id: true,

          organization_id: true,

          project_id: true,

          title: true,

          description: true,

          due_date: true,

          priority: true,

          status: true,

          created_by: true,

          updated_by: true,

          created_at: true,

          updated_at: true,

          /**
           * Project
           */
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            },
          },

          /**
           * Checklist
           */
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

          /**
           * Attachments
           */
          attachments: {
            where: {
              deleted_at: null,
            },

            orderBy: {
              created_at: "desc",
            },

            select: {
              id: true,
              file_name: true,
              file_url: true,
              file_size: true,
              mime_type: true,
              uploaded_by: true,
              created_at: true,
            },
          },

          /**
           * Work logs
           */
          work_logs: {
            where: {
              deleted_at: null,
            },

            orderBy: {
              log_date: "desc",
            },

            select: {
              id: true,
              user_id: true,
              log_date: true,
              hours_worked: true,
              work_item_title: true,
              daily_summary: true,
              achievements: true,
              blockers: true,
            },
          },

          /**
           * Counts
           */
          _count: {
            select: {
              checklist_items: true,
              attachments: true,
              activity_logs: true,
              work_logs: true,
            },
          },
        },
      }),
    ]);

  return {
    total,
    tasks,
  };
};