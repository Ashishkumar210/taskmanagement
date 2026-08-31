const {
  BadRequestError,
} = require("../utils/error");

const VALID_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "BLOCKED",
];

const VALID_SORT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "employeeCode",
  "createdAt",
  "lastLoginAt",
  "status",
];

/**
 * Validate user list query
 */
exports.validateUserListQuery = ({
  page = 1,
  limit = 20,
  search,
  status,
  departmentId,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

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
   * Status
   */
  if (
    status !== undefined &&
    !VALID_STATUSES.includes(status)
  ) {
    throw new BadRequestError(
      "Invalid user status."
    );
  }

  /**
   * Department
   */
  let normalizedDepartmentId = null;

  if (
    departmentId !== undefined &&
    departmentId !== null &&
    departmentId !== ""
  ) {
    normalizedDepartmentId =
      Number(departmentId);

    if (
      !Number.isInteger(
        normalizedDepartmentId
      ) ||
      normalizedDepartmentId <= 0
    ) {
      throw new BadRequestError(
        "Invalid department ID."
      );
    }
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

    status:
      status || null,

    departmentId:
      normalizedDepartmentId,

    sortBy,

    sortOrder:
      normalizedSortOrder,
  };
};


/**
 * Validate user ID
 */
exports.validateUserId = (id) => {
  // if (!id || typeof id !== "string") {
  //   throw new BadRequestError(
  //     "User ID is required."
  //   );
  // }

  /**
   * PostgreSQL UUID validation
   */
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new BadRequestError(
      "Invalid user ID."
    );
  }

  return id;
};