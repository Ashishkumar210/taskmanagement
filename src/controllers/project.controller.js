const asyncHandler = require("../utils/asyncHandler");

const ProjectService = require("../service/project.service");

/**
 * Get project list
 */
exports.getProjectList = asyncHandler(
  async (req, res) => {
    /**
     * Organization must come from
     * authenticated user/session.
     *
     * Never accept organization_id
     * from req.query.
     */
    const organization_id =
      req.user?.organization_id ?? 1;

    const result =
      await ProjectService.getProjectList({
        organization_id,
        ...req.query,
      });

    return res.status(200).json({
      success: true,
      message:
        "Project list fetched successfully.",
      data: result,
    });
  }
);