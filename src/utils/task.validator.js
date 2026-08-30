const {
  BadRequestError,
} = require("../utils/error");

const VALID_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

const VALID_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const VALID_SORT_FIELDS = [
  "title",
  "due_date",
  "priority",
  "status",
  "created_at",
  "updated_at",
];

/**
 * Validate task list query
 */
exports.validateTaskListQuery = ({
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
  const parsedPage =
    Number(page);

  const parsedLimit =
    Number(limit);

  /**
   * Page
   */
  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    throw new BadRequestError(
      "Page must be a positive integer."
    );
  }

  /**
   * Limit
   */
  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 100
  ) {
    throw new BadRequestError(
      "Limit must be between 1 and 100."
    );
  }

  /**
   * Search
   */
  if (
    search !== undefined &&
    typeof search !== "string"
  ) {
    throw new BadRequestError(
      "Search must be a string."
    );
  }

  /**
   * Project
   */
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

  /**
   * Status
   */
  if (
    status !== undefined &&
    !VALID_STATUSES.includes(status)
  ) {
    throw new BadRequestError(
      "Invalid task status."
    );
  }

  /**
   * Priority
   */
  if (
    priority !== undefined &&
    !VALID_PRIORITIES.includes(
      priority
    )
  ) {
    throw new BadRequestError(
      "Invalid task priority."
    );
  }

  /**
   * Date validation
   */
  let normalizedDueDateFrom =
    null;

  let normalizedDueDateTo =
    null;

  if (due_date_from) {
    const date =
      new Date(due_date_from);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      throw new BadRequestError(
        "Invalid due_date_from."
      );
    }

    normalizedDueDateFrom =
      date;
  }

  if (due_date_to) {
    const date =
      new Date(due_date_to);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      throw new BadRequestError(
        "Invalid due_date_to."
      );
    }

    normalizedDueDateTo =
      date;
  }

  if (
    normalizedDueDateFrom &&
    normalizedDueDateTo &&
    normalizedDueDateFrom >
    normalizedDueDateTo
  ) {
    throw new BadRequestError(
      "due_date_from cannot be greater than due_date_to."
    );
  }

  /**
   * Sort field
   */
  if (
    !VALID_SORT_FIELDS.includes(
      sortBy
    )
  ) {
    throw new BadRequestError(
      "Invalid sort field."
    );
  }

  /**
   * Sort order
   */
  const normalizedSortOrder =
    String(sortOrder).toLowerCase();

  if (
    !["asc", "desc"].includes(
      normalizedSortOrder
    )
  ) {
    throw new BadRequestError(
      "Sort order must be asc or desc."
    );
  }

  return {
    page: parsedPage,

    limit: parsedLimit,

    search:
      search?.trim() || null,

    project_id:
      normalizedProjectId,

    status:
      status || null,

    priority:
      priority || null,

    due_date_from:
      normalizedDueDateFrom,

    due_date_to:
      normalizedDueDateTo,

    sortBy,

    sortOrder:
      normalizedSortOrder,
  };
};