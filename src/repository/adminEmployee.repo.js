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






//import prisma from "../config/prisma.js";

const buildModuleWhere = ({
  organization_id,
  project_id,
  module_id,
  status,
}) => ({
  organization_id,

  deleted_at: null,

  ...(project_id !== undefined && {
    project_id,
  }),

  ...(module_id !== undefined && {
    id: module_id,
  }),

  ...(status !== undefined && {
    status,
  }),
});

const buildAssignmentWhere = ({
  organization_id,
  project_id,
  module_id,
  user_id,
  employee_type,
}) => ({
  organization_id,

  is_active: true,

  ...(module_id !== undefined && {
    module_id,
  }),

  ...(user_id !== undefined && {
    user_id,
  }),

  ...(employee_type !== undefined && {
    employee_type,
  }),

  ...(project_id !== undefined && {
    module: {
      project_id,
      deleted_at: null,
    },
  }),
});

const buildWorkLogWhere = ({
  organization_id,
  project_id,
  module_id,
  user_id,
  employee_type,
  from_date,
  to_date,
}) => ({
  organization_id,

  deleted_at: null,

  ...(module_id !== undefined && {
    module_id,
  }),

  ...(user_id !== undefined && {
    user_id,
  }),

  ...(employee_type !== undefined && {
    employee_type,
  }),

  ...(project_id !== undefined && {
    module: {
      project_id,
      deleted_at: null,
    },
  }),

  ...(from_date || to_date
    ? {
      work_date: {
        ...(from_date && {
          gte: new Date(
            `${from_date}T00:00:00.000Z`
          ),
        }),

        ...(to_date && {
          lte: new Date(
            `${to_date}T00:00:00.000Z`
          ),
        }),
      },
    }
    : {}),
});

const buildStatusLogWhere = ({
  organization_id,
  project_id,
  module_id,
  user_id,
  status,
  from_date,
  to_date,
}) => ({
  organization_id,

  ...(module_id !== undefined && {
    module_id,
  }),

  ...(user_id !== undefined && {
    user_id,
  }),

  ...(status !== undefined && {
    new_status: status,
  }),

  ...(project_id !== undefined && {
    module: {
      project_id,
      deleted_at: null,
    },
  }),

  ...(from_date || to_date
    ? {
      changed_at: {
        ...(from_date && {
          gte: new Date(
            `${from_date}T00:00:00.000Z`
          ),
        }),

        ...(to_date && {
          lt: new Date(
            `${to_date}T00:00:00.000Z`
          ),
        }),
      },
    }
    : {}),
});

exports.getDashboard = async ({
  organization_id,
  project_id,
  module_id,
  user_id,
  status,
  employee_type,
  from_date,
  to_date,
  page = 1,
  limit = 10,
}) => {
  const skip = (page - 1) * limit;

  /*
   * --------------------------------------------------
   * BASE WHERE CONDITIONS
   * --------------------------------------------------
   */

  const moduleWhere = buildModuleWhere({
    organization_id,
    project_id,
    module_id,
    status,
  });

  const assignmentWhere =
    buildAssignmentWhere({
      organization_id,
      project_id,
      module_id,
      user_id,
      employee_type,
    });

  const workLogWhere =
    buildWorkLogWhere({
      organization_id,
      project_id,
      module_id,
      user_id,
      employee_type,
      from_date,
      to_date,
    });

  const statusLogWhere =
    buildStatusLogWhere({
      organization_id,
      project_id,
      module_id,
      user_id,
      status,
      from_date,
      to_date,
    });

  /*
   * --------------------------------------------------
   * EXECUTE DASHBOARD QUERIES IN PARALLEL
   * --------------------------------------------------
   */

  const [
    totalModules,
    statusDistribution,
    assignmentCount,
    workLogAggregate,
    statusChangeCount,
    moduleRows,
    employeeRows,
    recentActivity,
    dailyWorkLogs,
    dailyStatusChanges,
  ] = await Promise.all([
    /*
     * TOTAL MODULES
     */
    prisma.projectModule.count({
      where: moduleWhere,
    }),

    /*
     * STATUS DISTRIBUTION
     */
    prisma.projectModule.groupBy({
      by: ["status"],
      where: moduleWhere,
      _count: {
        _all: true,
      },
      orderBy: {
        status: "asc",
      },
    }),

    /*
     * ASSIGNMENTS / EMPLOYEES
     */
    prisma.projectModuleAssignment.count({
      where: assignmentWhere,
    }),

    /*
     * TOTAL WORK HOURS
     */
    prisma.projectModuleWorkLog.aggregate({
      where: workLogWhere,
      _count: {
        _all: true,
      },
      _sum: {
        hours_worked: true,
      },
    }),

    /*
     * TOTAL STATUS CHANGES
     */
    prisma.projectModuleStatusLog.count({
      where: statusLogWhere,
    }),

    /*
     * MODULE TABLE
     */
    prisma.projectModule.findMany({
      where: moduleWhere,

      orderBy: {
        updated_at: "desc",
      },

      skip,
      take: limit,

      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        created_at: true,
        updated_at: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },

        _count: {
          select: {
            assignments: true,
            work_logs: true,
            status_logs: true,
          },
        },
      },
    }),

    /*
     * EMPLOYEE PERFORMANCE
     */
    prisma.projectModuleWorkLog.groupBy({
      by: ["user_id", "employee_type"],
      where: workLogWhere,
      _count: {
        _all: true,
      },
      _sum: {
        hours_worked: true,
      },
      orderBy: {
        _sum: {
          hours_worked: "desc",
        },
      },
    }),

    /*
     * RECENT STATUS ACTIVITY
     */
    prisma.projectModuleStatusLog.findMany({
      where: statusLogWhere,

      orderBy: {
        changed_at: "desc",
      },

      take: 10,

      select: {
        id: true,
        old_status: true,
        new_status: true,
        comment: true,
        changed_at: true,

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    /*
     * DAILY WORK LOGS
     */
    prisma.projectModuleWorkLog.groupBy({
      by: ["work_date"],
      where: workLogWhere,
      _count: {
        _all: true,
      },
      _sum: {
        hours_worked: true,
      },
      orderBy: {
        work_date: "asc",
      },
    }),

    /*
     * DAILY STATUS CHANGES
     */
    prisma.projectModuleStatusLog.groupBy({
      by: ["changed_at"],
      where: statusLogWhere,
      _count: {
        _all: true,
      },
      orderBy: {
        changed_at: "asc",
      },
    }),
  ]);

  /*
   * --------------------------------------------------
   * FORMAT STATUS DISTRIBUTION
   * --------------------------------------------------
   */

  const formattedStatusDistribution =
    statusDistribution.map((item) => ({
      status: item.status,
      count: item._count._all,
    }));

  /*
   * --------------------------------------------------
   * CALCULATE SUMMARY
   * --------------------------------------------------
   */

  const getStatusCount = (statusName) =>
    formattedStatusDistribution.find(
      (item) => item.status === statusName
    )?.count ?? 0;

  const completedModules =
    getStatusCount("COMPLETED");

  const blockedModules =
    getStatusCount("BLOCKED");

  const onHoldModules =
    getStatusCount("ON_HOLD");

  const plannedModules =
    getStatusCount("PLANNED");

  const totalHours = Number(
    workLogAggregate._sum.hours_worked ?? 0
  );

  /*
   * --------------------------------------------------
   * FETCH EMPLOYEE DETAILS
   * --------------------------------------------------
   */

  const employeeIds = employeeRows.map(
    (item) => item.user_id
  );

  const employees =
    employeeIds.length > 0
      ? await prisma.user.findMany({
        where: {
          id: {
            in: employeeIds,
          },
        },

        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          employeeCode: true,
        },
      })
      : [];

  const employeeMap = new Map(
    employees.map((employee) => [
      employee.id,
      employee,
    ])
  );

  const employeePerformance =
    employeeRows.map((row) => ({
      user_id: row.user_id,

      user: employeeMap.get(row.user_id) ?? null,

      employee_type: row.employee_type,

      work_logs: row._count._all,

      hours_worked: Number(
        row._sum.hours_worked ?? 0
      ),
    }));

  /*
   * --------------------------------------------------
   * DAILY ACTIVITY
   * --------------------------------------------------
   */

  const dailyActivity = dailyWorkLogs.map(
    (item) => ({
      date: item.work_date,
      work_logs: item._count._all,
      hours_worked: Number(
        item._sum.hours_worked ?? 0
      ),
    })
  );

  /*
   * --------------------------------------------------
   * FINAL RESPONSE
   * --------------------------------------------------
   */

  return {
    filters: {
      project_id: project_id ?? null,
      module_id: module_id ?? null,
      user_id: user_id ?? null,
      status: status ?? null,
      employee_type: employee_type ?? null,
      from_date: from_date ?? null,
      to_date: to_date ?? null,
    },

    summary: {
      total_modules: totalModules,
      completed_modules: completedModules,
      blocked_modules: blockedModules,
      on_hold_modules: onHoldModules,
      planned_modules: plannedModules,

      total_employees:
        assignmentCount,

      total_work_logs:
        workLogAggregate._count._all,

      total_hours:
        totalHours,

      total_status_changes:
        statusChangeCount,
    },

    status_distribution:
      formattedStatusDistribution,

    employee_performance:
      employeePerformance,

    daily_activity:
      dailyActivity,

    recent_activity:
      recentActivity,

    modules: {
      data: moduleRows,

      pagination: {
        page,
        limit,
        total: totalModules,
        totalPages: Math.ceil(
          totalModules / limit
        ),
      },
    },

    /*
     * Kept separate so the frontend can later
     * consume transition analytics.
     */
    status_changes_by_time:
      dailyStatusChanges,
  };
};












const getDateRange = ({
  from_date,
  to_date,
}) => {
  const now = new Date();

  /*
   * Default:
   * Current week Monday -> Sunday
   */

  if (!from_date && !to_date) {
    const day = now.getUTCDay();

    const diff =
      day === 0 ? -6 : 1 - day;

    const monday = new Date(now);

    monday.setUTCDate(
      now.getUTCDate() + diff
    );

    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);

    sunday.setUTCDate(
      monday.getUTCDate() + 6
    );

    return {
      start: monday,
      end: sunday,
    };
  }

  const start = from_date
    ? new Date(
      `${from_date}T00:00:00.000Z`
    )
    : new Date(
      `${to_date}T00:00:00.000Z`
    );

  const end = to_date
    ? new Date(
      `${to_date}T00:00:00.000Z`
    )
    : new Date(
      `${from_date}T00:00:00.000Z`
    );

  /*
   * Inclusive to_date
   */
  end.setUTCDate(
    end.getUTCDate() + 1
  );

  return {
    start,
    end,
  };
};

const getDateKey = (date) => {
  return new Date(date)
    .toISOString()
    .slice(0, 10);
};

const generateDates = (
  start,
  end
) => {
  const dates = [];

  const current = new Date(start);

  while (current < end) {
    dates.push(
      getDateKey(current)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return dates;
};

exports.getWorklogDashboard = async ({
  organization_id,
  project_id,
  module_id,
  user_id,
  employee_type,
  from_date,
  to_date,
  page = 1,
  limit = 20,
}) => {
  /*
   * ------------------------------------------------
   * DATE RANGE
   * ------------------------------------------------
   */

  const {
    start,
    end,
  } = getDateRange({
    from_date,
    to_date,
  });

  const dates = generateDates(
    start,
    end
  );

  /*
   * ------------------------------------------------
   * EMPLOYEE FILTER
   * ------------------------------------------------
   *
   * EmployeeType is stored in
   * ProjectModuleAssignment, not User.
   *
   * Therefore when employee_type is supplied,
   * we first find employees matching it.
   */

  let employeeIds;

  if (employee_type) {
    const assignments =
      await prisma.projectModuleAssignment.findMany({
        where: {
          organization_id,
          employee_type,
          is_active: true,

          ...(project_id !== undefined && {
            module: {
              project_id,
            },
          }),
        },

        select: {
          user_id: true,
        },

        distinct: ["user_id"],
      });

    employeeIds = assignments.map(
      (item) => item.user_id
    );

    if (employeeIds.length === 0) {
      return {
        period: {
          from_date: getDateKey(start),
          to_date: getDateKey(
            new Date(end.getTime() - 86400000)
          ),
          total_days: dates.length,
        },

        summary: {
          total_employees: 0,
          submitted_employees: 0,
          missing_employees: 0,
          partial_employees: 0,
          compliance_percentage: 0,
          total_hours: 0,
        },

        employees: [],

        daily_summary: dates.map(
          (date) => ({
            date,
            submitted: 0,
            missing: 0,
            partial: 0,
            total_hours: 0,
          })
        ),

        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  /*
   * ------------------------------------------------
   * EMPLOYEE WHERE
   * ------------------------------------------------
   */

  const employeeWhere = {
    status: "ACTIVE",

    deletedAt: null,

    ...(user_id !== undefined && {
      id: user_id,
    }),

    ...(employeeIds && {
      id: {
        in: employeeIds,
      },
    }),
  };

  /*
   * ------------------------------------------------
   * PROJECT FILTER
   * ------------------------------------------------
   */

  const worklogWhere = {
    organization_id,

    deleted_at: null,

    log_date: {
      gte: start,
      lt: end,
    },

    ...(user_id !== undefined && {
      user_id,
    }),

    ...(project_id !== undefined && {
      project_id,
    }),
  };

  /*
   * ------------------------------------------------
   * FETCH EMPLOYEES + WORKLOGS
   * ------------------------------------------------
   */

  const [
    totalEmployees,
    employees,
    worklogs,
  ] = await Promise.all([
    prisma.user.count({
      where: employeeWhere,
    }),

    prisma.user.findMany({
      where: employeeWhere,

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeCode: true,
      },

      orderBy: {
        firstName: "asc",
      },

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.dailyWorkLog.findMany({
      where: worklogWhere,

      select: {
        id: true,
        user_id: true,
        log_date: true,
        hours_worked: true,
        project_id: true,
        task_id: true,
      },

      orderBy: {
        log_date: "asc",
      },
    }),
  ]);

  /*
   * ------------------------------------------------
   * MAP WORKLOGS
   * user_id -> date -> hours
   * ------------------------------------------------
   */

  const worklogMap = new Map();

  for (const log of worklogs) {
    const date = getDateKey(
      log.log_date
    );

    if (!worklogMap.has(log.user_id)) {
      worklogMap.set(
        log.user_id,
        new Map()
      );
    }

    const userMap =
      worklogMap.get(log.user_id);

    const previous =
      userMap.get(date) ?? 0;

    userMap.set(
      date,
      previous +
      Number(log.hours_worked ?? 0)
    );
  }

  /*
   * ------------------------------------------------
   * EXPECTED HOURS
   * ------------------------------------------------
   *
   * Change this according to your organization.
   */

  const EXPECTED_HOURS_PER_DAY = 8;

  /*
   * ------------------------------------------------
   * EMPLOYEE MATRIX
   * ------------------------------------------------
   */

  const employeeData =
    employees.map((employee) => {
      const userLogs =
        worklogMap.get(employee.id) ??
        new Map();

      let submitted = 0;
      let missing = 0;
      let partial = 0;
      let totalHours = 0;

      const daily = dates.map(
        (date) => {
          const hours =
            userLogs.get(date) ?? 0;

          totalHours += hours;

          if (hours === 0) {
            missing++;

            return {
              date,
              status: "MISSING",
              hours: 0,
            };
          }

          if (
            hours <
            EXPECTED_HOURS_PER_DAY
          ) {
            partial++;

            return {
              date,
              status: "PARTIAL",
              hours,
            };
          }

          submitted++;

          return {
            date,
            status: "SUBMITTED",
            hours,
          };
        }
      );

      const compliance =
        dates.length > 0
          ? Number(
            (
              (submitted /
                dates.length) *
              100
            ).toFixed(2)
          )
          : 0;

      return {
        user_id: employee.id,

        employee: {
          id: employee.id,
          firstName:
            employee.firstName,
          lastName:
            employee.lastName,
          email: employee.email,
          employeeCode:
            employee.employeeCode,
        },

        submitted_days:
          submitted,

        missing_days:
          missing,

        partial_days:
          partial,

        total_hours:
          Number(totalHours.toFixed(2)),

        compliance_percentage:
          compliance,

        daily,
      };
    });

  /*
   * ------------------------------------------------
   * DAILY SUMMARY
   * ------------------------------------------------
   */

  const dailySummary =
    dates.map((date) => {
      let submitted = 0;
      let missing = 0;
      let partial = 0;
      let totalHours = 0;

      for (const employee of employees) {
        const hours =
          worklogMap
            .get(employee.id)
            ?.get(date) ?? 0;

        totalHours += hours;

        if (hours === 0) {
          missing++;
        } else if (
          hours <
          EXPECTED_HOURS_PER_DAY
        ) {
          partial++;
        } else {
          submitted++;
        }
      }

      return {
        date,
        submitted,
        missing,
        partial,
        total_hours:
          Number(
            totalHours.toFixed(2)
          ),
      };
    });

  /*
   * ------------------------------------------------
   * SUMMARY
   * ------------------------------------------------
   */

  let submittedEmployees = 0;
  let missingEmployees = 0;
  let partialEmployees = 0;
  let totalHours = 0;

  for (const employee of employeeData) {
    totalHours +=
      employee.total_hours;

    if (
      employee.missing_days === 0 &&
      employee.partial_days === 0
    ) {
      submittedEmployees++;
    } else if (
      employee.missing_days > 0
    ) {
      missingEmployees++;
    } else {
      partialEmployees++;
    }
  }

  const totalExpectedDays =
    totalEmployees * dates.length;

  const totalSubmittedDays =
    employeeData.reduce(
      (sum, employee) =>
        sum +
        employee.submitted_days,
      0
    );

  const compliancePercentage =
    totalExpectedDays > 0
      ? Number(
        (
          (totalSubmittedDays /
            totalExpectedDays) *
          100
        ).toFixed(2)
      )
      : 0;

  return {
    period: {
      from_date: getDateKey(start),
      to_date: getDateKey(
        new Date(
          end.getTime() - 86400000
        )
      ),
      total_days: dates.length,
    },

    filters: {
      project_id:
        project_id ?? null,
      module_id:
        module_id ?? null,
      user_id:
        user_id ?? null,
      employee_type:
        employee_type ?? null,
    },

    summary: {
      total_employees:
        totalEmployees,

      submitted_employees:
        submittedEmployees,

      missing_employees:
        missingEmployees,

      partial_employees:
        partialEmployees,

      total_expected_days:
        totalExpectedDays,

      total_submitted_days:
        totalSubmittedDays,

      total_missing_days:
        employeeData.reduce(
          (sum, employee) =>
            sum +
            employee.missing_days,
          0
        ),

      total_partial_days:
        employeeData.reduce(
          (sum, employee) =>
            sum +
            employee.partial_days,
          0
        ),

      total_hours:
        Number(
          totalHours.toFixed(2)
        ),

      compliance_percentage:
        compliancePercentage,
    },

    daily_summary:
      dailySummary,

    employees:
      employeeData,

    pagination: {
      page,
      limit,
      total: totalEmployees,
      totalPages:
        Math.ceil(
          totalEmployees / limit
        ),
    },
  };
};

