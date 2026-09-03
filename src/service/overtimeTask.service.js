const prisma = require("../config/prisma");

const overtimeTaskRepo = require("../repository/overtimeTask.repo");

const validator = require("../utils/overtimeTask.validator");

const validators = require("../utils/overtimeTask.validator.list");


const {
  BadRequestError,
  NotFoundError,
} = require("../utils/error");

/**
 * Create overtime task
 */
exports.create = async ({
  organizationId,
  userId,
  body,
}) => {
  const validated =
    validator.validateCreate(body);

  const {
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
  } = validated;

  /**
   * Verify user
   */
  const user =
    await overtimeTaskRepo.findUser(
      userId
    );

  if (!user) {
    throw new NotFoundError(
      "User not found."
    );
  }

  /**
   * Verify project
   */
  if (projectId) {
    const project =
      await overtimeTaskRepo.findProject({
        projectId,
        organizationId,
      });

    if (!project) {
      throw new NotFoundError(
        "Project not found."
      );
    }
  }

  /**
   * Verify task
   */
  if (taskId) {
    const task =
      await overtimeTaskRepo.findTask({
        taskId,
        organizationId,
      });

    if (!task) {
      throw new NotFoundError(
        "Task not found."
      );
    }

    /**
     * If task belongs to a project,
     * don't allow different project.
     */
    if (
      projectId &&
      task.project_id &&
      Number(task.project_id) !==
      Number(projectId)
    ) {
      throw new BadRequestError(
        "Task does not belong to the selected project."
      );
    }
  }

  /**
   * Create inside transaction
   */
  const result =
    await prisma.$transaction(
      async (tx) => {
        return overtimeTaskRepo.create(
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
            createdBy: userId,
          },
          tx
        );
      }
    );

  return formatOvertimeTask(result);
};

/**
 * Get by ID
 */
exports.getById = async ({
  id,
  organizationId,
}) => {
  const result =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  if (!result) {
    throw new NotFoundError(
      "Overtime task not found."
    );
  }

  return formatOvertimeTask(result);
};

/**
 * List
 */
/**
 * List overtime tasks
 *
 * Supports:
 * ?userId=1
 * ?projectId=2
 * ?taskId=10
 * ?status=PENDING
 * ?priority=HIGH
 * ?search=test
 * ?page=1
 * ?limit=10
 * ?startDate=2026-09-01
 * ?endDate=2026-09-30
 */
exports.list = async ({
  organizationId,
  query = {},
}) => {

  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  const {
    userId,
    projectId,
    taskId,
    status,
    priority,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  } = query;

  /**
   * Base filter
   */
  const where = {
    organization_id: Number(organizationId),
    deleted_at: null,
  };

  /**
   * User filter
   */
  if (userId) {
    const id = Number(userId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError(
        "Invalid user ID."
      );
    }

    where.user_id = id;
  }

  /**
   * Project filter
   */
  if (projectId) {
    const id = Number(projectId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError(
        "Invalid project ID."
      );
    }

    where.project_id = id;
  }

  /**
   * Task filter
   */
  if (taskId) {
    const id = Number(taskId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError(
        "Invalid task ID."
      );
    }

    where.task_id = id;
  }

  /**
   * Status
   */
  if (status) {
    where.status = status;
  }

  /**
   * Priority
   */
  if (priority) {
    where.priority = priority;
  }

  /**
   * Search
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
    ];
  }

  /**
   * Date filter
   *
   * startDate = inclusive
   * endDate   = exclusive
   */
  if (startDate || endDate) {

    where.overtime_date = {};

    if (startDate) {
      const date = new Date(startDate);

      if (Number.isNaN(date.getTime())) {
        throw new BadRequestError(
          "Invalid startDate."
        );
      }

      where.overtime_date.gte = date;
    }

    if (endDate) {
      const date = new Date(endDate);

      if (Number.isNaN(date.getTime())) {
        throw new BadRequestError(
          "Invalid endDate."
        );
      }

      where.overtime_date.lt = date;
    }
  }

  /**
   * Safe sorting
   */
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "overtime_date",
    "title",
    "priority",
    "status",
    "estimated_hours",
    "actual_hours",
  ];

  const safeSortBy =
    allowedSortFields.includes(sortBy)
      ? sortBy
      : "overtime_date";

  const safeSortOrder =
    sortOrder === "asc"
      ? "asc"
      : "desc";

  /**
   * IMPORTANT:
   *
   * Do NOT do:
   *
   * await prisma.$transaction([
   *   await repository.count(),
   *   await repository.findMany()
   * ]);
   *
   * repository methods are already async.
   *
   * Use Promise.all().
   */
  const [total, items] = await Promise.all([
    repository.count(where),

    repository.findMany({
      where,
      skip,
      take: limit,
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage:
        page < Math.ceil(total / limit),
      hasPreviousPage:
        page > 1,
    },
  };
};

/**
 * Update
 */
exports.update = async ({
  id,
  organizationId,
  userId,
  body,
}) => {
  const validated =
    validator.validateUpdate(body);

  const existing =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  if (!existing) {
    throw new NotFoundError(
      "Overtime task not found."
    );
  }

  /**
   * Verify project
   */
  if (validated.projectId) {
    const project =
      await overtimeTaskRepo.findProject({
        projectId:
          validated.projectId,

        organizationId,
      });

    if (!project) {
      throw new NotFoundError(
        "Project not found."
      );
    }
  }

  /**
   * Verify task
   */
  if (validated.taskId) {
    const task =
      await overtimeTaskRepo.findTask({
        taskId:
          validated.taskId,

        organizationId,
      });

    if (!task) {
      throw new NotFoundError(
        "Task not found."
      );
    }

    if (
      validated.projectId &&
      task.project_id &&
      Number(task.project_id) !==
      Number(validated.projectId)
    ) {
      throw new BadRequestError(
        "Task does not belong to the selected project."
      );
    }
  }

  const data = {};

  if (
    validated.taskId !== undefined
  ) {
    data.task_id =
      validated.taskId;
  }

  if (
    validated.projectId !== undefined
  ) {
    data.project_id =
      validated.projectId;
  }

  if (
    validated.title !== undefined
  ) {
    data.title =
      validated.title;
  }

  if (
    validated.description !==
    undefined
  ) {
    data.description =
      validated.description || null;
  }

  if (
    validated.overtimeDate !==
    undefined
  ) {
    data.overtime_date =
      validated.overtimeDate;
  }

  if (
    validated.estimatedHours !==
    undefined
  ) {
    data.estimated_hours =
      validated.estimatedHours;
  }

  if (
    validated.actualHours !==
    undefined
  ) {
    data.actual_hours =
      validated.actualHours;
  }

  if (
    validated.priority !== undefined
  ) {
    data.priority =
      validated.priority;
  }

  if (
    validated.reason !== undefined
  ) {
    data.reason =
      validated.reason || null;
  }

  data.updated_by =
    Number(userId);

  await overtimeTaskRepo.update({
    id,
    organizationId,
    data,
  });

  const result =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  return formatOvertimeTask(result);
};

/**
 * Update status
 */
exports.updateStatus = async ({
  id,
  organizationId,
  userId,
  status,
}) => {
  const allowedStatuses = [
    "PENDING",
    "IN_PROGRESS",
    "IN_REVIEW",
    "BLOCKED",
    "COMPLETED",
    "CANCELLED",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new BadRequestError(
      "Invalid status."
    );
  }

  const existing =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  if (!existing) {
    throw new NotFoundError(
      "Overtime task not found."
    );
  }

  await overtimeTaskRepo.updateStatus({
    id,
    organizationId,
    status,
    updatedBy: userId,
  });

  const result =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  return formatOvertimeTask(result);
};

/**
 * Update hours
 */
exports.updateHours = async ({
  id,
  organizationId,
  userId,
  actualHours,
}) => {
  const hours =
    Number(actualHours);

  if (
    !Number.isFinite(hours) ||
    hours < 0 ||
    hours > 999.99
  ) {
    throw new BadRequestError(
      "Invalid actual hours."
    );
  }

  const existing =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  if (!existing) {
    throw new NotFoundError(
      "Overtime task not found."
    );
  }

  await overtimeTaskRepo.updateHours({
    id,
    organizationId,
    actualHours: hours,
    updatedBy: userId,
  });

  const result =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  return formatOvertimeTask(result);
};

/**
 * Remove
 */
exports.remove = async ({
  id,
  organizationId,
  userId,
}) => {
  const existing =
    await overtimeTaskRepo.findById({
      id,
      organizationId,
    });

  if (!existing) {
    throw new NotFoundError(
      "Overtime task not found."
    );
  }

  await overtimeTaskRepo.softDelete({
    id,
    organizationId,
    deletedBy: userId,
  });

  return {
    id,
    deleted: true,
  };
};

/**
 * Response formatter
 */
const formatOvertimeTask = (
  item
) => {
  if (!item) {
    return null;
  }

  return {
    id: item.id,

    title: item.title,

    description:
      item.description,

    overtimeDate:
      item.overtime_date,

    estimatedHours:
      item.estimated_hours !== null
        ? Number(
          item.estimated_hours
        )
        : null,

    actualHours:
      item.actual_hours !== null
        ? Number(
          item.actual_hours
        )
        : null,

    priority:
      item.priority,

    status:
      item.status,

    reason:
      item.reason,

    employee: item.user
      ? {
        id: item.user.id,

        firstName:
          item.user.firstName,

        lastName:
          item.user.lastName,

        fullName: [
          item.user.firstName,
          item.user.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        email:
          item.user.email,

        employeeCode:
          item.user.employeeCode,
      }
      : null,

    project: item.project
      ? {
        id: item.project.id,
        name: item.project.name,
        status:
          item.project.status,
      }
      : null,

    task: item.task
      ? {
        id: item.task.id,
        title: item.task.title,
        description:
          item.task.description,

        status:
          item.task.status,

        priority:
          item.task.priority,

        dueDate:
          item.task.due_date,

        checklist:
          item.task.checklist_items
            ? item.task.checklist_items.map(
              (checklist) => ({
                id:
                  checklist.id,

                title:
                  checklist.title,

                isCompleted:
                  checklist.is_completed,

                createdAt:
                  checklist.created_at,

                updatedAt:
                  checklist.updated_at,
              })
            )
            : [],
      }
      : null,

    createdAt:
      item.created_at,

    updatedAt:
      item.updated_at,
  };
};







exports.getOvertimeTaskList = async ({
  organization_id,
  created_by,

  page = 1,
  limit = 20,

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

  sortBy = "created_at",
  sortOrder = "desc",
}) => {
  /**
   * Organization is mandatory.
   */
  if (!organization_id) {
    throw new BadRequestError(
      "Organization is required."
    );
  }

  /**
   * Validate query.
   */
  const validated =
    validators.validateOvertimeTaskListQuery({
      page,
      limit,

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

      sortBy,
      sortOrder,
    });

  const {
    page: currentPage,
    limit: pageLimit,

    search: searchText,

    user_id: userId,
    project_id: projectId,
    task_id: taskId,

    status: overtimeStatus,
    priority: overtimePriority,

    overtime_date_from:
    overtimeDateFrom,

    overtime_date_to:
    overtimeDateTo,

    created_at_from:
    createdAtFrom,

    created_at_to:
    createdAtTo,

    sortBy: orderByField,

    sortOrder:
    orderByDirection,
  } = validated;

  /**
   * Offset pagination.
   */
  const offset =
    (currentPage - 1) * pageLimit;

  /**
   * Fetch list.
   */
  const {
    overtimeTasks,
    total,
  } =
    await overtimeTaskRepo.getOvertimeTaskList({
      organization_id,
      created_by,

      search: searchText,

      user_id: userId,
      project_id: projectId,
      task_id: taskId,

      status: overtimeStatus,
      priority: overtimePriority,

      overtime_date_from:
        overtimeDateFrom,

      overtime_date_to:
        overtimeDateTo,

      created_at_from:
        createdAtFrom,

      created_at_to:
        createdAtTo,

      limit: pageLimit,
      offset,

      sortBy: orderByField,
      sortOrder: orderByDirection,
    });

  /**
   * Pagination.
   */
  const totalPages =
    Math.ceil(total / pageLimit);

  return {
    items: overtimeTasks,

    pagination: {
      page: currentPage,
      limit: pageLimit,

      total,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};


