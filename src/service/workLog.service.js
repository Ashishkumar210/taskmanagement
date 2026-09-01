const {
  BadRequestError,
  ConflictError,
} = require("../utils/error");

const WorkLogRepo =
  require("../repository/workLog.repo");

const {
  validateCreateWorkLog,
} = require("../utils/workLog.validator");

exports.createWorkLog = async ({
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

  file,
}) => {
  /**
   * Authentication context
   */
  if (!organization_id) {
    throw new BadRequestError(
      "Organization is required."
    );
  }

  if (!user_id) {
    throw new BadRequestError(
      "Authenticated user is required."
    );
  }

  /**
   * Validate request
   */
  const validated =
    validateCreateWorkLog({
      log_date,
      hours_worked,

      task_id,
      project_id,

      work_item_title,
      daily_summary,

      achievements,
      blockers,
    });

  /**
   * Validate task and project
   * inside the same organization.
   */
  if (validated.taskId) {
    const task =
      await WorkLogRepo.findTaskForOrganization({
        task_id:
          validated.taskId,

        organization_id,
      });

    if (!task) {
      throw new BadRequestError(
        "Selected task is invalid."
      );
    }

    /**
     * If project was not explicitly
     * selected, use task's project.
     */
    if (
      !validated.projectId &&
      task.project_id
    ) {
      validated.projectId =
        task.project_id;
    }

    /**
     * If both task and project are
     * supplied, they must match.
     */
    if (
      validated.projectId &&
      task.project_id !==
      validated.projectId
    ) {
      throw new BadRequestError(
        "Selected task does not belong to the selected project."
      );
    }
  }

  /**
   * Validate project.
   */
  if (validated.projectId) {
    const project =
      await WorkLogRepo.findProjectForOrganization({
        project_id:
          validated.projectId,

        organization_id,
      });

    if (!project) {
      throw new BadRequestError(
        "Selected project is invalid."
      );
    }
  }

  /**
   * Prevent duplicate daily
   * submission for same employee.
   *
   * Remove this check if you want
   * multiple work logs per day.
   */
  // const existing =
  //   await WorkLogRepo.findByUserAndDate({
  //     user_id,

  //     organization_id,

  //     log_date:
  //       validated.logDate,
  //   });
  const existing =
    await WorkLogRepo.findByUserAndDateAndProject({
      user_id,
      organization_id,
      project_id: validated.projectId,
      log_date: validated.logDate,
    });

  if (existing) {
    throw new ConflictError(
      "You have already submitted a work log for this project on this date."
    );
  }

  if (existing) {
    throw new ConflictError(
      "You have already submitted a work log for this date."
    );
  }

  /**
   * Create work log
   */
  const workLog =
    await WorkLogRepo.createWorkLog({
      organization_id,

      user_id,

      log_date:
        validated.logDate,

      hours_worked:
        validated.hours,

      task_id:
        validated.taskId,

      project_id:
        validated.projectId,

      work_item_title:
        validated.workItemTitle,

      daily_summary:
        validated.dailySummary,

      achievements:
        validated.achievements,

      blockers:
        validated.blockers,
    });

  /**
   * Optional attachment
   */
  if (file) {
    await WorkLogRepo.createAttachment({
      work_log_id:
        workLog.id,

      organization_id,

      uploaded_by:
        user_id,

      file_name:
        file.originalname,

      file_url:
        file.path ||
        file.location,

      file_size:
        file.size,

      mime_type:
        file.mimetype,
    });
  }

  /**
   * Return complete result.
   */
  return WorkLogRepo.findById({
    id: workLog.id,

    organization_id,
  });
};








/**
 * Convert query parameter into
 * positive integer.
 */
const parsePositiveInteger = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new BadRequestError(
      `${fieldName} must be a positive integer.`
    );
  }

  return parsedValue;
};

/**
 * Validate pagination.
 */
const parsePagination = ({
  page,
  limit,
}) => {
  let parsedPage = 1;
  let parsedLimit = 10;

  if (
    page !== undefined &&
    page !== ""
  ) {
    parsedPage = parsePositiveInteger(
      page,
      "page"
    );
  }

  if (
    limit !== undefined &&
    limit !== ""
  ) {
    parsedLimit = parsePositiveInteger(
      limit,
      "limit"
    );
  }

  if (parsedLimit > 100) {
    throw new BadRequestError(
      "limit cannot be greater than 100."
    );
  }

  return {
    page: parsedPage || 1,
    limit: parsedLimit || 10,
  };
};

/**
 * Validate date.
 *
 * Expected:
 * YYYY-MM-DD
 */
const parseDate = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new BadRequestError(
      `${fieldName} must be in YYYY-MM-DD format.`
    );
  }

  const date = new Date(
    `${value}T00:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(
      `Invalid ${fieldName}.`
    );
  }

  return date;
};

/**
 * Get Daily Work Logs
 */
exports.getDailyWorkLogs = async ({
  organizationId,
  userId,
  projectId,
  taskId,
  page,
  limit,
  fromDate,
  toDate,
}) => {
  /**
   * Organization
   */
  const normalizedOrganizationId =
    parsePositiveInteger(
      organizationId,
      "organizationId"
    );

  if (!normalizedOrganizationId) {
    throw new BadRequestError(
      "Organization ID is required."
    );
  }

  /**
   * Optional filters
   */
  const normalizedUserId =
    parsePositiveInteger(
      userId,
      "userId"
    );

  const normalizedProjectId =
    parsePositiveInteger(
      projectId,
      "projectId"
    );

  const normalizedTaskId =
    parsePositiveInteger(
      taskId,
      "taskId"
    );

  /**
   * Pagination
   */
  const pagination =
    parsePagination({
      page,
      limit,
    });

  /**
   * Date filters
   */
  const startDate =
    parseDate(
      fromDate,
      "fromDate"
    );

  let endDate =
    parseDate(
      toDate,
      "toDate"
    );

  /**
   * Repository uses:
   *
   * log_date >= startDate
   * log_date < endDate
   *
   * So make toDate exclusive.
   */
  if (endDate) {
    endDate = new Date(endDate);

    endDate.setUTCDate(
      endDate.getUTCDate() + 1
    );
  }

  /**
   * Validate date range
   */
  if (
    startDate &&
    endDate &&
    startDate >= endDate
  ) {
    throw new BadRequestError(
      "fromDate must be before toDate."
    );
  }

  /**
   * Fetch from repository
   */
  const result =
    await WorkLogRepo.getDailyWorkLogs({
      organizationId:
        normalizedOrganizationId,

      userId:
        normalizedUserId,

      projectId:
        normalizedProjectId,

      taskId:
        normalizedTaskId,

      page:
        pagination.page,

      limit:
        pagination.limit,

      startDate,

      endDate,
    });

  /**
   * Pagination calculation
   */
  const totalPages =
    Math.ceil(
      result.total /
      pagination.limit
    );

  return {
    items: result.items,

    pagination: {
      page: pagination.page,

      limit: pagination.limit,

      total: result.total,

      totalPages,

      hasNextPage:
        pagination.page <
        totalPages,

      hasPreviousPage:
        pagination.page > 1,
    },

    filters: {
      userId:
        normalizedUserId,

      projectId:
        normalizedProjectId,

      taskId:
        normalizedTaskId,

      fromDate:
        fromDate || null,

      toDate:
        toDate || null,
    },
  };
};