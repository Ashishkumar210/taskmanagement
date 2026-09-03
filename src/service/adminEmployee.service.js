const {
  BadRequestError,
  ConflictError,
} = require("../utils/error");


const jwt = require("jsonwebtoken");

const repo = require("../repository/adminEmployee.repo");

const normalizePagination = ({
  page,
  limit,
}) => {
  const parsedPage =
    Number(page) || 1;

  const parsedLimit =
    Number(limit) || 10;

  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    throw new BadRequestError(
      "Page must be a positive integer."
    );
  }

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 100
  ) {
    throw new BadRequestError(
      "Limit must be between 1 and 100."
    );
  }

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
};


/**
 * Employee task list
 */
exports.getEmployeeTasks =
  async ({
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
    if (!employeeId) {
      throw new BadRequestError(
        "Employee ID is required."
      );
    }

    if (!organizationId) {
      throw new BadRequestError(
        "Organization ID is required."
      );
    }

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    /**
     * Validate project
     */
    let normalizedProjectId =
      null;

    if (projectId) {
      normalizedProjectId =
        Number(projectId);

      if (
        !Number.isInteger(
          normalizedProjectId
        ) ||
        normalizedProjectId <= 0
      ) {
        throw new BadRequestError(
          "Invalid project ID."
        );
      }
    }

    const result =
      await repo.getEmployeeTasks({
        employeeId,

        organizationId:
          Number(organizationId),

        page:
          pagination.page,

        limit:
          pagination.limit,

        search:
          search?.trim() || null,

        status:
          status || null,

        priority:
          priority || null,

        projectId:
          normalizedProjectId,

        fromDate:
          fromDate
            ? new Date(
              `${fromDate}T00:00:00.000Z`
            )
            : null,

        toDate:
          toDate
            ? new Date(
              `${toDate}T00:00:00.000Z`
            )
            : null,

        sortBy,

        sortOrder,
      });

    const totalPages =
      Math.ceil(
        result.total /
        pagination.limit
      );

    return {
      items:
        result.items,

      pagination: {
        page:
          pagination.page,

        limit:
          pagination.limit,

        total:
          result.total,

        totalPages,

        hasNextPage:
          pagination.page <
          totalPages,

        hasPreviousPage:
          pagination.page > 1,
      },
    };
  };









const TASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

const TASK_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

/**
 * Parse positive integer
 */
const parsePositiveInteger = (
  value,
  field
) => {
  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number <= 0
  ) {
    throw new BadRequestError(
      `${field} must be a positive integer.`
    );
  }

  return number;
};

/**
 * Get user's task list
 */
exports.getMyTasks = async ({
  organizationId,
  userId,
  projectId,
  status,
  priority,
  search,
  page = 1,
  limit = 10,
}) => {
  /**
   * Organization
   */
  const normalizedOrganizationId =
    parsePositiveInteger(
      organizationId,
      "organizationId"
    );

  /**
   * User
   */
  const normalizedUserId =
    parsePositiveInteger(
      userId,
      "userId"
    );

  /**
   * Project
   */
  let normalizedProjectId = null;

  if (projectId) {
    normalizedProjectId =
      parsePositiveInteger(
        projectId,
        "projectId"
      );
  }

  /**
   * Pagination
   */
  const normalizedPage =
    parsePositiveInteger(
      page,
      "page"
    );

  const normalizedLimit =
    parsePositiveInteger(
      limit,
      "limit"
    );

  if (normalizedLimit > 100) {
    throw new BadRequestError(
      "Maximum limit is 100."
    );
  }

  /**
   * Status
   */
  if (
    status &&
    !TASK_STATUSES.includes(status)
  ) {
    throw new BadRequestError(
      "Invalid task status."
    );
  }

  /**
   * Priority
   */
  if (
    priority &&
    !TASK_PRIORITIES.includes(priority)
  ) {
    throw new BadRequestError(
      "Invalid task priority."
    );
  }

  /**
   * Search
   */
  const normalizedSearch =
    search?.trim() || null;

  /**
   * Repository
   */
  const result =
    await repo.getMyTasks({
      organizationId:
        normalizedOrganizationId,

      userId:
        normalizedUserId,

      projectId:
        normalizedProjectId,

      status,

      priority,

      search:
        normalizedSearch,

      page:
        normalizedPage,

      limit:
        normalizedLimit,
    });

  /**
   * Calculate pagination
   */
  const totalPages =
    Math.ceil(
      result.total /
      normalizedLimit
    );

  /**
   * Calculate task data
   */
  const items =
    result.tasks.map((task) => {
      /**
       * Total checklist
       */
      const checklistTotal =
        task.checklist_items.length;

      /**
       * Completed checklist
       */
      const checklistCompleted =
        task.checklist_items.filter(
          (item) =>
            item.is_completed === true
        ).length;

      /**
       * Checklist progress
       */
      const checklistProgress =
        checklistTotal > 0
          ? Math.round(
            (checklistCompleted /
              checklistTotal) *
            100
          )
          : 0;

      /**
       * Total hours
       */
      const totalHours =
        task.work_logs.reduce(
          (total, log) =>
            total +
            Number(
              log.hours_worked
            ),
          0
        );

      return {
        id: task.id,

        title: task.title,

        description:
          task.description,

        dueDate:
          task.due_date,

        priority:
          task.priority,

        status:
          task.status,

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
            checklistTotal,

          completed:
            checklistCompleted,

          progress:
            checklistProgress,

          items:
            task.checklist_items.map(
              (item) => ({
                id: item.id,

                title:
                  item.title,

                isCompleted:
                  item.is_completed,

                createdAt:
                  item.created_at,

                updatedAt:
                  item.updated_at,
              })
            ),
        },

        attachments:
          task.attachments.map(
            (file) => ({
              id: file.id,

              fileName:
                file.file_name,

              fileUrl:
                file.file_url,

              fileSize:
                Number(
                  file.file_size
                ),

              mimeType:
                file.mime_type,

              uploadedBy:
                file.uploaded_by,

              createdAt:
                file.created_at,
            })
          ),

        workSummary: {
          totalWorkLogs:
            task.work_logs.length,

          totalHours:
            Number(
              totalHours.toFixed(2)
            ),
        },

        counts: {
          checklistItems:
            task._count
              .checklist_items,

          attachments:
            task._count
              .attachments,

          activityLogs:
            task._count
              .activity_logs,

          workLogs:
            task._count
              .work_logs,
        },

        createdAt:
          task.created_at,

        updatedAt:
          task.updated_at,
      };
    });

  return {
    items,

    pagination: {
      page:
        normalizedPage,

      limit:
        normalizedLimit,

      total:
        result.total,

      totalPages,

      hasNextPage:
        normalizedPage <
        totalPages,

      hasPreviousPage:
        normalizedPage > 1,
    },

    filters: {
      userId:
        normalizedUserId,

      projectId:
        normalizedProjectId,

      status:
        status || null,

      priority:
        priority || null,

      search:
        normalizedSearch,
    },
  };
};