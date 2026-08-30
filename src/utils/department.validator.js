const {
  BadRequestError,
} = require("../utils/error");

/**
 * Validate department list query
 */
exports.validateDepartmentListQuery = ({
  page = 1,
  limit = 20,
  search,
}) => {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

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

  if (
    search !== undefined &&
    typeof search !== "string"
  ) {
    throw new BadRequestError(
      "Search must be a string."
    );
  }

  return {
    page: parsedPage,
    limit: parsedLimit,
    search:
      search?.trim() || null,
  };
};




/**
 * Validate create department
 */
exports.validateCreateDepartment = ({
  name,
  code,
}) => {
  /**
   * Department name
   */
  if (
    !name ||
    typeof name !== "string"
  ) {
    throw new BadRequestError(
      "Department name is required."
    );
  }

  const normalizedName =
    name
      .trim()
      .replace(/\s+/g, " ");

  if (normalizedName.length < 2) {
    throw new BadRequestError(
      "Department name must contain at least 2 characters."
    );
  }

  if (normalizedName.length > 100) {
    throw new BadRequestError(
      "Department name cannot exceed 100 characters."
    );
  }

  /**
   * Department code is optional.
   */
  let normalizedCode = null;

  if (
    code !== undefined &&
    code !== null &&
    code !== ""
  ) {
    if (typeof code !== "string") {
      throw new BadRequestError(
        "Department code must be a string."
      );
    }

    normalizedCode =
      code
        .trim()
        .toUpperCase();

    if (normalizedCode.length < 2) {
      throw new BadRequestError(
        "Department code must contain at least 2 characters."
      );
    }

    if (normalizedCode.length > 50) {
      throw new BadRequestError(
        "Department code cannot exceed 50 characters."
      );
    }

    /**
     * Allow:
     *
     * ENG
     * PROD-ENG
     * HR01
     *
     * Reject special characters.
     */
    const codeRegex =
      /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

    if (!codeRegex.test(normalizedCode)) {
      throw new BadRequestError(
        "Department code can contain only letters, numbers and hyphens."
      );
    }
  }

  return {
    name: normalizedName,
    code: normalizedCode,
  };
};