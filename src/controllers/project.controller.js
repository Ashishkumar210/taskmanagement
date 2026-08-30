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
    console.log('user---', req.user);

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






/**
 * Create project
 */
exports.createProject =
  asyncHandler(async (req, res) => {
    /**
     * Organization must come from
     * authenticated user.
     */
    const organization_id =
      req.user?.organization_id ?? 1;

    const user_id =
      req.user?.user_id ||
      req.user?.userId;

    const result =
      await ProjectService.createProject({
        organization_id,
        user_id,

        name:
          req.body.name,

        description:
          req.body.description,

        status:
          req.body.status,
      });

    return res.status(201).json({
      success: true,

      message:
        "Project created successfully.",

      data: result,
    });
  });