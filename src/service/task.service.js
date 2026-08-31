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

  created_by,
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

      created_by,

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




/**
 * Get task details
 */
exports.getTaskDetails =
  async ({
    task_id,
    organization_id,
  }) => {
    /**
     * Organization validation
     */
    if (!organization_id) {
      throw new BadRequestError(
        "Organization is required."
      );
    }

    /**
     * Validate task ID
     */
    // const taskId =
    //   validateTaskId(task_id);

    /**
     * Get task
     */
    const task =
      await TaskRepo.getTaskDetails({
        task_id: task_id,

        organization_id,
      });

    if (!task) {
      throw new NotFoundError(
        "Task not found."
      );
    }

    /**
     * Checklist statistics
     */
    const checklist =
      task.checklist_items || [];

    const totalChecklistItems =
      checklist.length;

    const completedChecklistItems =
      checklist.filter(
        (item) =>
          item.is_completed === true
      ).length;

    /**
     * Progress
     *
     * Currently your schema doesn't
     * contain a progress column.
     *
     * Therefore progress is calculated
     * from checklist completion.
     */
    const progress =
      totalChecklistItems > 0
        ? Math.round(
          (completedChecklistItems /
            totalChecklistItems) *
          100
        )
        : task.status ===
          "COMPLETED"
          ? 100
          : 0;

    /**
     * Format checklist
     */
    const checklistItems =
      checklist.map(
        (item) => ({
          id:
            item.id,

          title:
            item.title,

          isCompleted:
            item.is_completed,

          createdAt:
            item.created_at,

          updatedAt:
            item.updated_at,
        })
      );

    /**
     * Format attachments
     */
    const attachments =
      (task.attachments || []).map(
        (attachment) => ({
          id:
            attachment.id,

          fileName:
            attachment.file_name,

          fileUrl:
            attachment.file_url,

          fileSize:
            Number(
              attachment.file_size
            ),

          mimeType:
            attachment.mime_type,

          uploadedBy:
            attachment.uploaded_by,

          createdAt:
            attachment.created_at,

          updatedAt:
            attachment.updated_at,
        })
      );

    /**
     * Format activity
     */
    const activity =
      (task.activity_logs || []).map(
        (item) => ({
          id:
            item.id,

          userId:
            item.user_id,

          action:
            item.action,

          oldValue:
            item.old_value,

          newValue:
            item.new_value,

          metadata:
            item.metadata,

          createdAt:
            item.created_at,
        })
      );

    return {
      id:
        task.id,

      organizationId:
        task.organization_id,

      title:
        task.title,

      description:
        task.description,

      status:
        task.status,

      priority:
        task.priority,

      startDate:
        task.created_at,

      dueDate:
        task.due_date,

      project: task.project
        ? {
          id:
            task.project.id,

          name:
            task.project.name,

          description:
            task.project
              .description,

          status:
            task.project.status,
        }
        : null,

      /**
       * Currently created_by represents
       * the person who created/assigned
       * the task.
       */
      assignedBy:
        task.created_by,

      createdBy:
        task.created_by,

      updatedBy:
        task.updated_by,

      progress,

      checklist: {
        total:
          totalChecklistItems,

        completed:
          completedChecklistItems,

        remaining:
          totalChecklistItems -
          completedChecklistItems,

        items:
          checklistItems,
      },

      attachments,

      activity,

      /**
       * Comment table is not yet
       * present in your schema.
       */
      commentsCount: 0,

      createdAt:
        task.created_at,

      updatedAt:
        task.updated_at,
    };
  };





/**
 * Update task status
 */
exports.updateTaskStatus = async ({
  task_id,

  organization_id,

  user_id,

  status,
}) => {
  /**
   * Validate authentication
   */
  if (!user_id) {
    throw new BadRequestError(
      "Authenticated user is required."
    );
  }

  const normalizedUserId =
    Number(user_id);

  if (
    !Number.isInteger(
      normalizedUserId
    ) ||
    normalizedUserId <= 0
  ) {
    throw new BadRequestError(
      "Invalid authenticated user."
    );
  }

  /**
   * Validate organization
   */
  if (!organization_id) {
    throw new BadRequestError(
      "Organization is required."
    );
  }

  const normalizedOrganizationId =
    Number(organization_id);

  if (
    !Number.isInteger(
      normalizedOrganizationId
    ) ||
    normalizedOrganizationId <= 0
  ) {
    throw new BadRequestError(
      "Invalid organization."
    );
  }

  /**
   * Validate task ID
   */
  // const taskId =
  //   validateTaskId(task_id);

  /**
   * Validate status
   */
  // const newStatus =
  //   validateTaskStatus(status);

  /**
   * Find task
   */
  const task =
    await TaskRepo.findTaskById({
      task_id: task_id,

      organization_id:
        normalizedOrganizationId,
    });

  if (!task) {
    throw new NotFoundError(
      "Task not found."
    );
  }

  /**
   * No change required
   */
  if (
    task.status === status
  ) {
    return {
      task,

      statusChanged: false,

      previousStatus:
        task.status,

      currentStatus:
        task.status,
    };
  }

  /**
   * Update task + activity log
   */
  let updatedTask;

  try {
    updatedTask =
      await TaskRepo.updateTaskStatus({
        task_id: task_id,

        organization_id:
          normalizedOrganizationId,

        user_id:
          normalizedUserId,

        old_status:
          task.status,

        new_status:
          status,
      });
  } catch (error) {
    /**
     * Concurrent update
     */
    if (
      error.message ===
      "Task status was changed by another request."
    ) {
      throw new ConflictError(
        "Task status was changed by another request. Please refresh and try again."
      );
    }

    throw error;
  }

  /**
   * Notification hook
   *
   * Later connect this with:
   *
   * BullMQ
   * Kafka
   * Notification Service
   *
   * Do not make notification failure
   * rollback the task transaction.
   */
  try {
    // await NotificationService.taskStatusChanged({
    //   taskId: updatedTask.id,
    //   organizationId: normalizedOrganizationId,
    //   changedBy: normalizedUserId,
    //   previousStatus: task.status,
    //   currentStatus: newStatus,
    // });
  } catch (error) {
    console.error(
      "Task status notification failed:",
      error
    );
  }

  return {
    task: updatedTask,

    statusChanged: true,

    previousStatus:
      task.status,

    currentStatus:
      status,
  };
};