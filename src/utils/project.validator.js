const {
  BadRequestError,
} = require("../utils/error");

const VALID_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "COMPLETED",
  "ARCHIVED",
];

const VALID_SORT_FIELDS = [
  "name",
  "created_at",
  "updated_at",
  "status",
];

/**
 * Validate project list query
 */
exports.validateProjectListQuery = ({
  page = 1,
  limit = 20,
  search,
  status,
  sortBy = "created_at",
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
      "Invalid project status."
    );
  }

  /**
   * Sort field
   */
  if (
    !VALID_SORT_FIELDS.includes(sortBy)
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

    sortBy,

    sortOrder:
      normalizedSortOrder,
  };
};




// const VALID_STATUSES = [
//   "ACTIVE",
//   "INACTIVE",
//   "COMPLETED",
//   "ARCHIVED",
// ];

/**
 * Validate create project
 */
exports.validateCreateProject = ({
  name,
  description,
  status,
}) => {
  /**
   * Name
   */
  if (
    !name ||
    typeof name !== "string"
  ) {
    throw new BadRequestError(
      "Project name is required."
    );
  }

  const normalizedName =
    name
      .trim()
      .replace(/\s+/g, " ");

  if (normalizedName.length < 2) {
    throw new BadRequestError(
      "Project name must contain at least 2 characters."
    );
  }

  if (normalizedName.length > 255) {
    throw new BadRequestError(
      "Project name cannot exceed 255 characters."
    );
  }

  /**
   * Description
   */
  let normalizedDescription =
    null;

  if (
    description !== undefined &&
    description !== null &&
    description !== ""
  ) {
    if (
      typeof description !== "string"
    ) {
      throw new BadRequestError(
        "Project description must be a string."
      );
    }

    normalizedDescription =
      description.trim();

    if (
      normalizedDescription.length >
      10000
    ) {
      throw new BadRequestError(
        "Project description cannot exceed 10000 characters."
      );
    }
  }

  /**
   * Status
   */
  const normalizedStatus =
    status || "ACTIVE";

  if (
    !VALID_STATUSES.includes(
      normalizedStatus
    )
  ) {
    throw new BadRequestError(
      "Invalid project status."
    );
  }

  return {
    name: normalizedName,

    description:
      normalizedDescription,

    status:
      normalizedStatus,
  };
};