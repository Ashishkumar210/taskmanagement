const DepartmentRepo =
  require("../repository/department.repo");

const {
  validateDepartmentListQuery, validateCreateDepartment
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





/**
 * Create department
 */
exports.createDepartment =
  async ({
    name,
    code,
  }) => {
    /**
     * Validate input
     */
    const validated =
      validateCreateDepartment({
        name,
        code,
      });

    /**
     * Check duplicate name
     */
    const existingByName =
      await DepartmentRepo.findByName(
        validated.name
      );

    if (existingByName) {
      throw new ConflictError(
        "Department name already exists."
      );
    }

    /**
     * Check duplicate code
     *
     * Only when code is provided.
     */
    if (validated.code) {
      const existingByCode =
        await DepartmentRepo.findByCode(
          validated.code
        );

      if (existingByCode) {
        throw new ConflictError(
          "Department code already exists."
        );
      }
    }

    /**
     * Create department
     */
    const department =
      await DepartmentRepo.createDepartment({
        name:
          validated.name,

        code:
          validated.code,
      });

    /**
     * Return safe response
     */
    return {
      id:
        department.id,

      name:
        department.name,

      code:
        department.code,

      createdAt:
        department.createdAt,

      updatedAt:
        department.updatedAt,
    };
  };