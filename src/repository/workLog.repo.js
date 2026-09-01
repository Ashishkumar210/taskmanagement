const prisma =
  require("../config/prisma");

/**
 * Find task inside organization
 */
exports.findTaskForOrganization =
  async ({
    task_id,
    organization_id,
  }) => {
    return prisma.task.findFirst({
      where: {
        id: task_id,

        organization_id,

        deleted_at: null,
      },

      select: {
        id: true,
        project_id: true,
        title: true,
        status: true,
      },
    });
  };

/**
 * Find project inside organization
 */
exports.findProjectForOrganization =
  async ({
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
        status: true,
      },
    });
  };

/**
 * Find existing daily work log
 */
exports.findByUserAndDate =
  async ({
    user_id,
    organization_id,
    log_date,
  }) => {
    return prisma.dailyWorkLog.findFirst({
      where: {
        user_id,

        organization_id,

        log_date,

        deleted_at: null,
      },

      select: {
        id: true,
        log_date: true,
      },
    });
  };


exports.findByUserAndDateAndProject = async ({
  user_id,
  organization_id,
  project_id,
  log_date,
}) => {
  return prisma.dailyWorkLog.findFirst({
    where: {
      user_id,
      organization_id,
      project_id,
      log_date,
      deleted_at: null,
    },

    select: {
      id: true,
      log_date: true,
      project_id: true,
    },
  });
};
/**
 * Create work log
 */
exports.createWorkLog =
  async ({
    organization_id,

    user_id,

    log_date,

    hours_worked,

    task_id,

    project_id,

    work_item_title,

    daily_summary,

    achievements,

    blockers,
  }) => {
    return prisma.dailyWorkLog.create({
      data: {
        organization_id,

        user_id,

        log_date,

        hours_worked,

        task_id,

        project_id,

        work_item_title,

        daily_summary,

        achievements,

        blockers,
      },

      select: {
        id: true,

        organization_id: true,

        user_id: true,

        log_date: true,

        hours_worked: true,

        task_id: true,

        project_id: true,

        work_item_title: true,

        daily_summary: true,

        achievements: true,

        blockers: true,

        created_at: true,
      },
    });
  };

/**
 * Create attachment
 */
exports.createAttachment =
  async ({
    work_log_id,

    organization_id,

    uploaded_by,

    file_name,

    file_url,

    file_size,

    mime_type,
  }) => {
    return prisma.dailyWorkLogAttachment.create({
      data: {
        work_log_id,

        organization_id,

        uploaded_by,

        file_name,

        file_url,

        file_size: BigInt(file_size),

        mime_type,
      },
    });
  };

/**
 * Get work log
 */
exports.findById =
  async ({
    id,
    organization_id,
  }) => {
    return prisma.dailyWorkLog.findFirst({
      where: {
        id,

        organization_id,

        deleted_at: null,
      },

      select: {
        id: true,

        organization_id: true,

        user_id: true,

        log_date: true,

        hours_worked: true,

        task_id: true,

        project_id: true,

        work_item_title: true,

        daily_summary: true,

        achievements: true,

        blockers: true,

        created_at: true,

        updated_at: true,

        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },

        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        attachments: {
          where: {
            deleted_at: null,
          },

          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            created_at: true,
          },
        },
      },
    });
  };






exports.getDailyWorkLogs = async ({
  organizationId,
  userId,
  projectId,
  taskId,
  page,
  limit,
  startDate,
  endDate,
}) => {
  const skip = (page - 1) * limit;

  const where = {
    organization_id: organizationId,
    deleted_at: null,
  };

  if (userId) {
    where.user_id = userId;
  }

  if (projectId) {
    where.project_id = projectId;
  }

  if (taskId) {
    where.task_id = taskId;
  }

  if (startDate || endDate) {
    where.log_date = {};

    if (startDate) {
      where.log_date.gte = startDate;
    }

    if (endDate) {
      where.log_date.lt = endDate;
    }
  }

  const [total, logs] = await prisma.$transaction([
    prisma.dailyWorkLog.count({
      where,
    }),

    prisma.dailyWorkLog.findMany({
      where,

      skip,
      take: limit,

      orderBy: [
        {
          log_date: "desc",
        },
        {
          created_at: "desc",
        },
      ],

      select: {
        id: true,
        organization_id: true,
        user_id: true,

        log_date: true,
        hours_worked: true,

        task_id: true,
        project_id: true,

        work_item_title: true,
        daily_summary: true,
        achievements: true,
        blockers: true,

        created_at: true,
        updated_at: true,

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
            status: true,
            priority: true,
            due_date: true,
          },
        },

        attachments: {
          where: {
            deleted_at: null,
          },

          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            created_at: true,
          },

          orderBy: {
            created_at: "desc",
          },
        },
      },
    }),
  ]);

  return {
    total,

    items: logs.map((log) => ({
      id: log.id,

      logDate: log.log_date,

      hoursWorked: Number(log.hours_worked),

      workItemTitle: log.work_item_title,

      dailySummary: log.daily_summary,

      achievements: log.achievements,

      blockers: log.blockers,

      employee: log.user
        ? {
          id: log.user.id,
          firstName: log.user.firstName,
          lastName: log.user.lastName,

          fullName: [
            log.user.firstName,
            log.user.lastName,
          ]
            .filter(Boolean)
            .join(" "),

          email: log.user.email,
          employeeCode: log.user.employeeCode,
        }
        : null,

      project: log.project
        ? {
          id: log.project.id,
          name: log.project.name,
          status: log.project.status,
        }
        : null,

      task: log.task
        ? {
          id: log.task.id,
          title: log.task.title,
          status: log.task.status,
          priority: log.task.priority,
          dueDate: log.task.due_date,
        }
        : null,

      attachments: log.attachments.map((file) => ({
        id: file.id,
        fileName: file.file_name,
        fileUrl: file.file_url,
        fileSize: Number(file.file_size),
        mimeType: file.mime_type,
        createdAt: file.created_at,
      })),

      createdAt: log.created_at,
      updatedAt: log.updated_at,
    })),
  };
};