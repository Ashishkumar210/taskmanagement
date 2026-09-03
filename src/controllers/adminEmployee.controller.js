const asyncHandler = require("../utils/asyncHandler");

const service =
  require("../service/adminEmployee.service");


/**
 * Admin:
 * Employee task list
 */
exports.getEmployeeTasks =
  asyncHandler(
    async (req, res) => {
      // const {
      //   userId,
      // } = Number(req.query);

      const userId = Number(req.query.userId);

      const {
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
      } = req.query;

      const organizationId =
        req.user?.organization_id ||
        req.user?.organizationId || 1;

      const result =
        await service.getEmployeeTasks({
          employeeId:
            userId,

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
        });

      return res.status(200).json({
        success: true,

        message:
          "Employee tasks fetched successfully.",

        data: result,
      });
    }
  );






/**
 * Get My Tasks
 *
 * GET /api/v1/tasks/my-tasks
 */
exports.getMyTasks = asyncHandler(async (req, res) => {
  const {
    userId,
    projectId,
    status,
    priority,
    search,
    page,
    limit,
  } = req.query;

  /**
   * Organization should come
   * from authenticated user.
   */
  const organizationId =
    req.user?.organization_id ||
    req.user?.organizationId || 1;

  if (!organizationId) {
    throw new BadRequestError(
      "Organization ID is required."
    );
  }

  if (!userId) {
    throw new BadRequestError(
      "userId is required."
    );
  }

  const result =
    await service.getMyTasks({
      organizationId,

      userId,

      projectId,

      status,

      priority,

      search,

      page,

      limit,
    });

  return res.status(200).json({
    success: true,

    message:
      "Tasks fetched successfully.",

    data: result,
  });
});