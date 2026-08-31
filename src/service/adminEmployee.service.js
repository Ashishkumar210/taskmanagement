const {
  BadRequestError,
  ConflictError,
} = require("../utils/error");


const jwt = require("jsonwebtoken");

const repo = require("../repository/adminEmployee.repo");

const normalizePagination = ({
  page,
  limit,
}) => {
  const parsedPage =
    Number(page) || 1;

  const parsedLimit =
    Number(limit) || 10;

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

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
};


/**
 * Employee task list
 */
exports.getEmployeeTasks =
  async ({
    employeeId,
    organizationId,
    page,
    limit,
    search,
    status,
    priority,
    projectId,
    fromDate,
    toDate,
    sortBy,
    sortOrder,
  }) => {
    if (!employeeId) {
      throw new BadRequestError(
        "Employee ID is required."
      );
    }

    if (!organizationId) {
      throw new BadRequestError(
        "Organization ID is required."
      );
    }

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    /**
     * Validate project
     */
    let normalizedProjectId =
      null;

    if (projectId) {
      normalizedProjectId =
        Number(projectId);

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

    const result =
      await repo.getEmployeeTasks({
        employeeId,

        organizationId:
          Number(organizationId),

        page:
          pagination.page,

        limit:
          pagination.limit,

        search:
          search?.trim() || null,

        status:
          status || null,

        priority:
          priority || null,

        projectId:
          normalizedProjectId,

        fromDate:
          fromDate
            ? new Date(
              `${fromDate}T00:00:00.000Z`
            )
            : null,

        toDate:
          toDate
            ? new Date(
              `${toDate}T00:00:00.000Z`
            )
            : null,

        sortBy,

        sortOrder,
      });

    const totalPages =
      Math.ceil(
        result.total /
        pagination.limit
      );

    return {
      items:
        result.items,

      pagination: {
        page:
          pagination.page,

        limit:
          pagination.limit,

        total:
          result.total,

        totalPages,

        hasNextPage:
          pagination.page <
          totalPages,

        hasPreviousPage:
          pagination.page > 1,
      },
    };
  };