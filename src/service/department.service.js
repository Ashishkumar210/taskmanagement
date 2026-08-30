const DepartmentRepo =
  require("../repository/department.repo");

const {
  validateDepartmentListQuery,
} = require("../utils/department.validator");

/**
 * Get department list
 */
exports.getDepartmentList = async ({
  page = 1,
  limit = 20,
  search,
}) => {
  /**
   * Validate and normalize query
   */
  const validated =
    validateDepartmentListQuery({
      page,
      limit,
      search,
    });

  const {
    page: currentPage,
    limit: pageLimit,
    search: searchText,
  } = validated;

  /**
   * Calculate offset
   */
  const offset =
    (currentPage - 1) * pageLimit;

  /**
   * Fetch departments
   */
  const {
    departments,
    total,
  } = await DepartmentRepo.getDepartmentList({
    search: searchText,
    limit: pageLimit,
    offset,
  });

  /**
   * Pagination
   */
  const totalPages =
    Math.ceil(
      total / pageLimit
    );

  return {
    items: departments,

    pagination: {
      page: currentPage,
      limit: pageLimit,
      total,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};