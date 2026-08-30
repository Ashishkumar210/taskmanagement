const prisma = require("../config/prisma");

/**
 * ============================================================
 * PROJECT
 * ============================================================
 */

/**
 * Find project by ID
 *
 * Organization isolation is important.
 */
exports.findProjectById = async ({
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
      organization_id: true,
    },
  });
};


/**
 * ============================================================
 * TASK
 * ============================================================
 */

/**
 * Create task
 *
 * Supports normal Prisma client or transaction client.
 */
exports.createTask = async (
  data,
  tx = prisma
) => {
  return tx.task.create({
    data,
  });
};


/**
 * Get task by ID
 *
 * Organization isolation is applied to the Task.
 */
exports.getTaskById = async ({
  task_id,
  organization_id,
}) => {
  return prisma.task.findFirst({
    where: {
      id: task_id,
      organization_id,
      deleted_at: null,
    },

    include: {
      /**
       * Project
       */
      project: {
        select: {
          id: true,
          name: true,
        },
      },

      /**
       * Checklist items
       *
       * TaskChecklistItem does NOT have:
       * - organization_id
       * - position
       * - created_by
       */
      checklist_items: {
        where: {
          deleted_at: null,
        },

        orderBy: {
          id: "asc",
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
       * Activity logs
       */
      activity_logs: {
        where: {
          deleted_at: null,
        },

        orderBy: {
          created_at: "desc",
        },

        select: {
          id: true,
          user_id: true,
          action: true,
          old_value: true,
          new_value: true,
          metadata: true,
          created_at: true,
        },
      },
    },
  });
};


/**
 * ============================================================
 * CHECKLIST
 * ============================================================
 */

/**
 * Create checklist items
 *
 * TaskChecklistItem schema:
 *
 * id
 * task_id
 * title
 * is_completed
 * created_at
 * updated_at
 * deleted_at
 *
 * Therefore DO NOT send:
 * - organization_id
 * - position
 * - created_by
 */
exports.createChecklistItems = async (
  data,
  tx = prisma
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      count: 0,
    };
  }

  return tx.taskChecklistItem.createMany({
    data: data.map((item) => ({
      task_id: item.task_id,
      title: item.title,
      is_completed:
        item.is_completed ?? false,
    })),
  });
};


/**
 * ============================================================
 * ATTACHMENT
 * ============================================================
 */

/**
 * Create attachment metadata.
 *
 * TaskAttachment requires:
 * - task_id
 * - organization_id
 * - uploaded_by
 * - file_name
 * - file_url
 * - file_size
 * - mime_type
 */
exports.createAttachment = async (
  data,
  tx = prisma
) => {
  return tx.taskAttachment.create({
    data,
  });
};


/**
 * ============================================================
 * ACTIVITY
 * ============================================================
 */

/**
 * Create task activity log.
 *
 * TaskActivityLog requires:
 * - task_id
 * - organization_id
 * - user_id
 * - action
 */
exports.createActivity = async (
  data,
  tx = prisma
) => {
  return tx.taskActivityLog.create({
    data,
  });
};


/**
 * ============================================================
 * FILE UPLOAD
 * ============================================================
 */

/**
 * Upload task file.
 *
 * IMPORTANT:
 * Replace this implementation with your
 * S3 / Cloudflare R2 / MinIO / other
 * object-storage implementation.
 */
exports.uploadTaskFile = async (
  file
) => {
  if (!file) {
    return null;
  }

  return {
    file_name: file.originalname,

    file_url:
      file.location ||
      file.path ||
      null,

    file_size: file.size,

    mime_type: file.mimetype,
  };
};






/**
 * Get task list
 */
exports.getTaskList = async ({
  organization_id,

  search,

  project_id,

  status,

  priority,

  due_date_from,

  due_date_to,

  limit,

  offset,

  sortBy,

  sortOrder,
}) => {
  /**
   * Base filter
   *
   * Organization isolation is mandatory.
   */
  const where = {
    organization_id,

    deleted_at: null,
  };

  /**
   * Search by task title
   * or description.
   */
  if (search) {
    where.OR = [
      {
        title: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        description: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },
    ];
  }

  /**
   * Project filter
   */
  if (project_id) {
    where.project_id =
      project_id;
  }

  /**
   * Status filter
   */
  if (status) {
    where.status =
      status;
  }

  /**
   * Priority filter
   */
  if (priority) {
    where.priority =
      priority;
  }

  /**
   * Due date filter
   */
  if (
    due_date_from ||
    due_date_to
  ) {
    where.due_date = {};

    if (due_date_from) {
      where.due_date.gte =
        due_date_from;
    }

    if (due_date_to) {
      where.due_date.lte =
        due_date_to;
    }
  }

  /**
   * Sorting
   *
   * sortBy is already whitelisted
   * by validator.
   */
  const orderBy = {
    [sortBy]:
      sortOrder,
  };

  /**
   * Fetch tasks and total
   * in parallel.
   */
  const [
    tasks,
    total,
  ] = await Promise.all([
    prisma.task.findMany({
      where,

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

        project: {
          select: {
            id: true,

            name: true,

            status: true,
          },
        },

        _count: {
          select: {
            checklist_items: {
              where: {
                deleted_at: null,
              },
            },

            attachments: {
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

    prisma.task.count({
      where,
    }),
  ]);

  /**
   * Format response
   */
  const formattedTasks =
    tasks.map(
      (task) => ({
        id:
          task.id,

        organization_id:
          task.organization_id,

        project_id:
          task.project_id,

        title:
          task.title,

        description:
          task.description,

        due_date:
          task.due_date,

        priority:
          task.priority,

        status:
          task.status,

        created_by:
          task.created_by,

        updated_by:
          task.updated_by,

        created_at:
          task.created_at,

        updated_at:
          task.updated_at,

        project:
          task.project,

        checklistCount:
          task._count
            .checklist_items,

        attachmentCount:
          task._count
            .attachments,
      })
    );

  return {
    tasks:
      formattedTasks,

    total,
  };
};