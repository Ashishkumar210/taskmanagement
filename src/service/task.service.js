const prisma = require("../config/prisma");

const { BadRequestError, NotFoundError } = require("../utils/error");

const {
  validateTaskListQuery,
} = require("../utils/task.validator");
const TaskRepo =
  require("../repository/task.repo");

const employeeAuthRepository = require("../repository/employeeAuthRepository");

const DEFAULT_PRIORITY =
  "MEDIUM";

const DEFAULT_STATUS =
  "PENDING";

/**
 * Supported priorities
 */
const VALID_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

/**
 * Supported statuses
 */
const VALID_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

/**
 * Parse checklist
 *
 * Frontend sends:
 *
 * checklist:
 * '["Create UI","Implement API","Write tests"]'
 *
 * OR:
 *
 * checklist:
 * '[{"title":"Create UI"},{"title":"Write tests"}]'
 */
const parseChecklist = (
  checklist
) => {
  if (
    checklist === undefined ||
    checklist === null ||
    checklist === ""
  ) {
    return [];
  }

  let parsed;

  try {
    parsed =
      typeof checklist === "string"
        ? JSON.parse(checklist)
        : checklist;
  } catch (error) {
    throw new BadRequestError(
      "Invalid checklist format."
    );
  }

  if (!Array.isArray(parsed)) {
    throw new BadRequestError(
      "Checklist must be an array."
    );
  }

  return parsed
    .map((item) => {
      /**
       * Support both:
       *
       * "Create API"
       *
       * and:
       *
       * { title: "Create API" }
       */
      if (
        typeof item === "string"
      ) {
        return {
          title: item.trim(),
        };
      }

      return {
        title:
          item?.title?.trim(),
      };
    })
    .filter(
      (item) =>
        item.title
    );
};

/**
 * Validate due date
 */
const validateDueDate = (
  dueDate
) => {
  if (!dueDate) {
    return null;
  }

  const date =
    new Date(dueDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new BadRequestError(
      "Invalid due date."
    );
  }

  return date;
};

/**
 * Create task
 */
exports.createTask = async ({
  organization_id,
  created_by,

  title,
  project_id,
  due_date,
  priority,
  status,
  description,
  checklist,

  file,
}) => {
  /**
   * Normalize title.
   */
  const normalizedTitle =
    title
      .trim()
      .replace(/\s+/g, " ");

  if (
    normalizedTitle.length < 2
  ) {
    throw new BadRequestError(
      "Task title must contain at least 2 characters."
    );
  }

  if (
    normalizedTitle.length > 500
  ) {
    throw new BadRequestError(
      "Task title cannot exceed 500 characters."
    );
  }

  /**
   * Priority
   */
  const normalizedPriority =
    priority ||
    DEFAULT_PRIORITY;

  if (
    !VALID_PRIORITIES.includes(
      normalizedPriority
    )
  ) {
    throw new BadRequestError(
      "Invalid task priority."
    );
  }

  /**
   * Status
   */
  const normalizedStatus =
    status ||
    DEFAULT_STATUS;

  if (
    !VALID_STATUSES.includes(
      normalizedStatus
    )
  ) {
    throw new BadRequestError(
      "Invalid task status."
    );
  }

  /**
   * Due date
   */
  const normalizedDueDate =
    validateDueDate(
      due_date
    );

  /**
   * Project
   */
  let normalizedProjectId =
    null;

  if (
    project_id !== undefined &&
    project_id !== null &&
    project_id !== ""
  ) {
    normalizedProjectId =
      Number(project_id);

    if (
      !Number.isInteger(
        normalizedProjectId
      )
    ) {
      throw new BadRequestError(
        "Invalid project."
      );
    }

    /**
     * IMPORTANT:
     *
     * Project must belong to the
     * same organization.
     */
    const project =
      await TaskRepo.findProjectById({
        project_id:
          normalizedProjectId,

        organization_id,
      });

    if (!project) {
      throw new NotFoundError(
        "Project not found."
      );
    }
  }

  /**
   * Checklist
   */
  const checklistItems =
    parseChecklist(
      checklist
    );

  /**
   * Maximum checklist items.
   */
  if (
    checklistItems.length > 100
  ) {
    throw new BadRequestError(
      "A task cannot contain more than 100 checklist items."
    );
  }

  /**
   * Validate checklist titles.
   */
  checklistItems.forEach(
    (item) => {
      if (
        item.title.length > 500
      ) {
        throw new BadRequestError(
          "Checklist item cannot exceed 500 characters."
        );
      }
    }
  );

  /**
   * File validation.
   *
   * File is OPTIONAL.
   */
  let attachment = null;

  if (file) {
    attachment =
      await TaskRepo.uploadTaskFile(
        file
      );
  }

  /**
   * Create everything in one transaction.
   */
  const task =
    await prisma.$transaction(
      async (tx) => {
        /**
         * Create task.
         */
        const createdTask =
          await TaskRepo.createTask(
            {
              organization_id,
              project_id:
                normalizedProjectId,

              title:
                normalizedTitle,

              description:
                description
                  ?.trim() || null,

              due_date:
                normalizedDueDate,

              priority:
                normalizedPriority,

              status:
                normalizedStatus,

              created_by,

              updated_by:
                created_by,
            },
            tx
          );

        /**
         * Create checklist items.
         */
        if (
          checklistItems.length
        ) {
          await TaskRepo.createChecklistItems(
            checklistItems.map(
              (
                item,
                index
              ) => ({
                task_id:
                  createdTask.id,

                organization_id,

                title:
                  item.title,

                position:
                  index,

                is_completed:
                  false,

                created_by,
              })
            ),
            tx
          );
        }

        /**
         * Save attachment metadata.
         */
        if (attachment) {
          await TaskRepo.createAttachment(
            {
              task_id:
                createdTask.id,

              organization_id,

              uploaded_by:
                created_by,

              file_name:
                attachment.file_name,

              file_url:
                attachment.file_url,

              file_size:
                attachment.file_size,

              mime_type:
                attachment.mime_type,
            },
            tx
          );
        }

        /**
         * Activity log.
         */
        await TaskRepo.createActivity(
          {
            task_id:
              createdTask.id,

            organization_id,

            user_id:
              created_by,

            action:
              "TASK_CREATED",

            new_value: {
              title:
                normalizedTitle,

              priority:
                normalizedPriority,

              status:
                normalizedStatus,
            },
          },
          tx
        );

        return createdTask;
      }
    );

  /**
   * Return complete task.
   */
  return TaskRepo.getTaskById({
    task_id:
      task.id,

    organization_id,
  });
};
















/**
 * Get task list
 */
exports.getTaskList = async ({
  organization_id,

  page = 1,

  limit = 20,

  search,

  project_id,

  status,

  priority,

  due_date_from,

  due_date_to,

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
    validateTaskListQuery({
      page,

      limit,

      search,

      project_id,

      status,

      priority,

      due_date_from,

      due_date_to,

      sortBy,

      sortOrder,
    });

  const {
    page: currentPage,

    limit: pageLimit,

    search: searchText,

    project_id: projectId,

    status: taskStatus,

    priority: taskPriority,

    due_date_from:
    dueDateFrom,

    due_date_to:
    dueDateTo,

    sortBy: orderByField,

    sortOrder:
    orderByDirection,
  } = validated;

  /**
   * Offset
   */
  const offset =
    (currentPage - 1) *
    pageLimit;

  /**
   * Fetch tasks.
   */
  const {
    tasks,

    total,
  } =
    await TaskRepo.getTaskList({
      organization_id,

      search: searchText,

      project_id:
        projectId,

      status:
        taskStatus,

      priority:
        taskPriority,

      due_date_from:
        dueDateFrom,

      due_date_to:
        dueDateTo,

      limit:
        pageLimit,

      offset,

      sortBy:
        orderByField,

      sortOrder:
        orderByDirection,
    });

  /**
   * Pagination
   */
  const totalPages =
    Math.ceil(
      total / pageLimit
    );

  return {
    items: tasks,

    pagination: {
      page:
        currentPage,

      limit:
        pageLimit,

      total,

      totalPages,

      hasNextPage:
        currentPage <
        totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};