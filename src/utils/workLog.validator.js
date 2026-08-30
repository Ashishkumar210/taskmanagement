const {
  BadRequestError,
} = require("../utils/error");

const validateCreateWorkLog = ({
  log_date,
  hours_worked,
  task_id,
  project_id,
  work_item_title,
  daily_summary,
  achievements,
  blockers,
}) => {
  /**
   * Log date
   */
  if (!log_date) {
    throw new BadRequestError(
      "Log date is required."
    );
  }

  const logDate = new Date(log_date);

  if (Number.isNaN(logDate.getTime())) {
    throw new BadRequestError(
      "Invalid log date."
    );
  }

  /**
   * Hours
   */
  if (
    hours_worked === undefined ||
    hours_worked === null ||
    hours_worked === ""
  ) {
    throw new BadRequestError(
      "Hours worked is required."
    );
  }

  const hours = Number(hours_worked);

  if (
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    throw new BadRequestError(
      "Hours worked must be greater than 0."
    );
  }

  /**
   * Maximum daily work
   */
  if (hours > 24) {
    throw new BadRequestError(
      "Hours worked cannot exceed 24 hours."
    );
  }

  /**
   * Work item title
   */
  if (
    !work_item_title ||
    typeof work_item_title !== "string"
  ) {
    throw new BadRequestError(
      "Work item title is required."
    );
  }

  const normalizedTitle =
    work_item_title
      .trim()
      .replace(/\s+/g, " ");

  if (normalizedTitle.length < 2) {
    throw new BadRequestError(
      "Please enter a valid work item title."
    );
  }

  if (normalizedTitle.length > 500) {
    throw new BadRequestError(
      "Work item title cannot exceed 500 characters."
    );
  }

  /**
   * Daily summary
   */
  if (
    !daily_summary ||
    typeof daily_summary !== "string"
  ) {
    throw new BadRequestError(
      "Daily work summary is required."
    );
  }

  const normalizedSummary =
    daily_summary.trim();

  if (normalizedSummary.length < 5) {
    throw new BadRequestError(
      "Daily work summary is too short."
    );
  }

  /**
   * Optional IDs
   */
  let normalizedTaskId = null;

  if (
    task_id !== undefined &&
    task_id !== null &&
    task_id !== ""
  ) {
    normalizedTaskId = Number(task_id);

    if (
      !Number.isInteger(normalizedTaskId) ||
      normalizedTaskId <= 0
    ) {
      throw new BadRequestError(
        "Invalid task ID."
      );
    }
  }

  let normalizedProjectId = null;

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
      ) ||
      normalizedProjectId <= 0
    ) {
      throw new BadRequestError(
        "Invalid project ID."
      );
    }
  }

  return {
    logDate,
    hours,
    taskId: normalizedTaskId,
    projectId: normalizedProjectId,

    workItemTitle:
      normalizedTitle,

    dailySummary:
      normalizedSummary,

    achievements:
      achievements?.trim() || null,

    blockers:
      blockers?.trim() || null,
  };
};

module.exports = {
  validateCreateWorkLog,
};