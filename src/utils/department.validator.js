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