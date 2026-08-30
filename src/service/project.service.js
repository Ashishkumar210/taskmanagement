const ProjectRepo =
  require("../repository/project.repo");

const {
  validateProjectListQuery,
} = require("../utils/project.validator");

const {
  BadRequestError,
} = require("../utils/error");

/**
 * Get project list
 */
exports.getProjectList = async ({
  organization_id,

  page = 1,
  limit = 20,

  search,
  status,

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
    validateProjectListQuery({
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

  const {
    page: currentPage,
    limit: pageLimit,
    search: searchText,
    status: projectStatus,
    sortBy: orderByField,
    sortOrder: orderByDirection,
  } = validated;

  /**
   * Calculate offset.
   */
  const offset =
    (currentPage - 1) *
    pageLimit;

  /**
   * Fetch projects.
   */
  const {
    projects,
    total,
  } =
    await ProjectRepo.getProjectList({
      organization_id,

      search: searchText,

      status: projectStatus,

      limit: pageLimit,

      offset,

      sortBy: orderByField,

      sortOrder: orderByDirection,
    });

  /**
   * Pagination.
   */
  const totalPages =
    Math.ceil(
      total / pageLimit
    );

  return {
    items: projects,

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