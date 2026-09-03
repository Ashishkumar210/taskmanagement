const {
  TaskPriority,
  TaskStatus,
} = require("@prisma/client");

const ALLOWED_SORT_FIELDS = [
  "id",
  "title",
  "overtime_date",
  "estimated_hours",
  "actual_hours",
  "priority",
  "status",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_ORDERS = ["asc", "desc"];

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const isValidDateOnly = (value) => {
  if (!value) return false;

  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime());
};

const validatePositiveInteger = (value, fieldName) => {
  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    const number = Number(value);

    if (
      !Number.isInteger(number) ||
      number <= 0
    ) {
      throw new BadRequestError(
        `${fieldName} must be a positive integer.`
      );
    }

    return number;
  }

  return undefined;
};

exports.validateOvertimeTaskListQuery = ({
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
  const currentPage = Number(page);
  const pageLimit = Number(limit);

  /**
   * Pagination
   */
  if (
    !Number.isInteger(currentPage) ||
    currentPage <= 0
  ) {
    throw new BadRequestError(
      "Page must be a positive integer."
    );
  }

  if (
    !Number.isInteger(pageLimit) ||
    pageLimit <= 0
  ) {
    throw new BadRequestError(
      "Limit must be a positive integer."
    );
  }

  /**
   * Protect database from huge page sizes.
   */
  if (pageLimit > 100) {
    throw new BadRequestError(
      "Limit cannot exceed 100."
    );
  }

  /**
   * IDs
   */
  const userId = validatePositiveInteger(
    user_id,
    "user_id"
  );

  const projectId = validatePositiveInteger(
    project_id,
    "project_id"
  );

  const taskId = validatePositiveInteger(
    task_id,
    "task_id"
  );

  /**
   * Status
   */
  if (
    status &&
    !Object.values(TaskStatus).includes(status)
  ) {
    throw new BadRequestError(
      `Invalid status. Allowed values: ${Object.values(
        TaskStatus
      ).join(", ")}`
    );
  }

  /**
   * Priority
   */
  if (
    priority &&
    !Object.values(TaskPriority).includes(priority)
  ) {
    throw new BadRequestError(
      `Invalid priority. Allowed values: ${Object.values(
        TaskPriority
      ).join(", ")}`
    );
  }

  /**
   * Search
   */
  const searchText =
    typeof search === "string"
      ? search.trim()
      : undefined;

  if (searchText && searchText.length > 255) {
    throw new BadRequestError(
      "Search cannot exceed 255 characters."
    );
  }

  /**
   * Overtime date validation
   */
  if (
    overtime_date_from &&
    !isValidDateOnly(overtime_date_from)
  ) {
    throw new BadRequestError(
      "overtime_date_from must be in YYYY-MM-DD format."
    );
  }

  if (
    overtime_date_to &&
    !isValidDateOnly(overtime_date_to)
  ) {
    throw new BadRequestError(
      "overtime_date_to must be in YYYY-MM-DD format."
    );
  }

  if (
    overtime_date_from &&
    overtime_date_to &&
    overtime_date_from > overtime_date_to
  ) {
    throw new BadRequestError(
      "overtime_date_from cannot be greater than overtime_date_to."
    );
  }

  /**
   * Created date validation
   */
  if (
    created_at_from &&
    !isValidDate(created_at_from)
  ) {
    throw new BadRequestError(
      "created_at_from must be a valid date."
    );
  }

  if (
    created_at_to &&
    !isValidDate(created_at_to)
  ) {
    throw new BadRequestError(
      "created_at_to must be a valid date."
    );
  }

  /**
   * Sorting
   */
  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new BadRequestError(
      `Invalid sortBy. Allowed values: ${ALLOWED_SORT_FIELDS.join(
        ", "
      )}`
    );
  }

  if (
    !ALLOWED_SORT_ORDERS.includes(
      String(sortOrder).toLowerCase()
    )
  ) {
    throw new BadRequestError(
      "sortOrder must be either asc or desc."
    );
  }

  return {
    page: currentPage,
    limit: pageLimit,

    search: searchText,

    user_id: userId,
    project_id: projectId,
    task_id: taskId,

    status,
    priority,

    overtime_date_from,
    overtime_date_to,

    created_at_from,
    created_at_to,

    sortBy,
    sortOrder:
      String(sortOrder).toLowerCase(),
  };
};