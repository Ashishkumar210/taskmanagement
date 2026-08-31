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