const asyncHandler = require("../utils/asyncHandler");

const WorkLogService =
  require("../service/workLog.service");

/**
 * Create daily work log
 */
exports.createWorkLog =
  asyncHandler(async (req, res) => {
    // const userId =
    //   req.user?.user_id ||
    //   req.user?.userId || "1";

    const userId =
      req.user?.user_id ||
      req.user?.userId ||
      req.user?.id ||
      "00000000-0000-0000-0001";


    const organizationId =
      req.user?.organization_id ?? 1;

    const result =
      await WorkLogService.createWorkLog({
        organization_id:
          organizationId,

        user_id:
          userId,

        ...req.body,

        file:
          req.file || null,
      });

    return res.status(201).json({
      success: true,

      message:
        "Daily work log submitted successfully.",

      data: result,
    });
  });






/**
* Get Daily Work Logs
*
* GET /api/v1/adminlog
*
* Examples:
*
* /api/v1/adminlog
* /api/v1/adminlog?userId=5
* /api/v1/adminlog?userId=5&projectId=10
* /api/v1/adminlog?userId=5&projectId=10&taskId=101
* /api/v1/adminlog?userId=5&page=1&limit=10
*/
exports.getDailyWorkLogs = asyncHandler(
  async (req, res) => {
    const {
      userId,
      projectId,
      taskId,
      page,
      limit,
      fromDate,
      toDate,
    } = req.query;

    /**
     * Organization ID should come
     * from authenticated user/admin.
     */
    const organizationId =
      req.user?.organization_id ||
      req.user?.organizationId || 1;

    if (!organizationId) {
      throw new BadRequestError(
        "Organization ID is required."
      );
    }

    const result =
      await WorkLogService.getDailyWorkLogs({
        organizationId,
        userId,
        projectId,
        taskId,
        page,
        limit,
        fromDate,
        toDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "Daily work logs fetched successfully.",
      data: result,
    });
  }
);