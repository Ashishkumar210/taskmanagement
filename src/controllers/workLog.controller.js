const asyncHandler = require("../utils/asyncHandler");

const WorkLogService =
  require("../service/workLog.service");

/**
 * Create daily work log
 */
exports.createWorkLog =
  asyncHandler(async (req, res) => {
    const userId =
      req.user?.user_id ||
      req.user?.userId || 1;

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