const { BadRequestError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");

const overtimeTaskService =
  require("../service/overtimeTask.service");

/**
 * Get organization ID
 */
const getOrganizationId = (req) => {
  const organizationId =
    req.user?.organizationId ||
    req.user?.organization_id ||
    req.organizationId || 1;

  if (!organizationId) {
    throw new BadRequestError(
      "Organization ID is required."
    );
  }

  const id =
    Number(organizationId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new BadRequestError(
      "Invalid organization ID."
    );
  }

  return id;
};

/**
 * Get authenticated user
 */
const getUserId = (req) => {
  const userId =
    req.user?.userId ||
    req.user?.id;

  if (!userId) {
    throw new BadRequestError(
      "Authenticated user is required."
    );
  }

  const id =
    Number(userId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new BadRequestError(
      "Invalid authenticated user ID."
    );
  }

  return id;
};

/**
 * Validate ID
 */
const getParamId = (req) => {
  const id =
    Number(req.params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new BadRequestError(
      "Invalid overtime task ID."
    );
  }

  return id;
};

/**
 * POST
 * /api/v1/overtime-tasks
 */
exports.create = asyncHandler(
  async (req, res) => {
    const organizationId =
      getOrganizationId(req);

    const userId =
      getUserId(req);

    const result =
      await overtimeTaskService.create({
        organizationId,
        userId,
        body: req.body,
      });

    return res.status(201).json({
      success: true,

      message:
        "Overtime task created successfully.",

      data: result,
    });
  }
);

/**
 * GET
 * /api/v1/overtime-tasks
 */
exports.getOvertimeTaskList = asyncHandler(async (req, res) => {
  /**
   * Organization must come from authenticated user.
   *
   * Do NOT accept organization_id from query params.
   */
  const organization_id = req.user?.organization_id || 1;

  const created_by = req.user?.userId;

  if (!organization_id) {
    throw new BadRequestError("Organization is required.");
  }

  const result = await overtimeTaskService.getOvertimeTaskList({
    organization_id,
    created_by,

    page: req.query.page,
    limit: req.query.limit,

    search: req.query.search,

    user_id: req.query.user_id,
    project_id: req.query.project_id,
    task_id: req.query.task_id,

    status: req.query.status,
    priority: req.query.priority,

    overtime_date_from: req.query.overtime_date_from,
    overtime_date_to: req.query.overtime_date_to,

    created_at_from: req.query.created_at_from,
    created_at_to: req.query.created_at_to,

    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  });

  return res.status(200).json({
    success: true,
    message: "Overtime task list fetched successfully.",
    data: result,
  });
});

/**
 * GET
 * /api/v1/overtime-tasks/:id
 */
exports.getById = asyncHandler(
  async (req, res) => {
    const organizationId =
      getOrganizationId(req);

    const id =
      getParamId(req);

    const result =
      await overtimeTaskService.getById({
        id,
        organizationId,
      });

    return res.status(200).json({
      success: true,

      message:
        "Overtime task fetched successfully.",

      data: result,
    });
  }
);

/**
 * PUT
 * /api/v1/overtime-tasks/:id
 */
exports.update = asyncHandler(
  async (req, res) => {
    const organizationId =
      getOrganizationId(req);

    const userId =
      getUserId(req);

    const id =
      getParamId(req);

    const result =
      await overtimeTaskService.update({
        id,
        organizationId,
        userId,
        body: req.body,
      });

    return res.status(200).json({
      success: true,

      message:
        "Overtime task updated successfully.",

      data: result,
    });
  }
);

/**
 * PATCH
 * /api/v1/overtime-tasks/:id/status
 */
exports.updateStatus =
  asyncHandler(
    async (req, res) => {
      const organizationId =
        getOrganizationId(req);

      const userId =
        getUserId(req);

      const id =
        getParamId(req);

      const result =
        await overtimeTaskService.updateStatus(
          {
            id,
            organizationId,
            userId,
            status:
              req.body.status,
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "Overtime task status updated successfully.",

        data: result,
      });
    }
  );

/**
 * PATCH
 * /api/v1/overtime-tasks/:id/hours
 */
exports.updateHours =
  asyncHandler(
    async (req, res) => {
      const organizationId =
        getOrganizationId(req);

      const userId =
        getUserId(req);

      const id =
        getParamId(req);

      const result =
        await overtimeTaskService.updateHours(
          {
            id,
            organizationId,
            userId,
            actualHours:
              req.body.actualHours,
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "Overtime task hours updated successfully.",

        data: result,
      });
    }
  );

/**
 * DELETE
 * /api/v1/overtime-tasks/:id
 */
exports.remove = asyncHandler(
  async (req, res) => {
    const organizationId =
      getOrganizationId(req);

    const userId =
      getUserId(req);

    const id =
      getParamId(req);

    const result =
      await overtimeTaskService.remove({
        id,
        organizationId,
        userId,
      });

    return res.status(200).json({
      success: true,

      message:
        "Overtime task deleted successfully.",

      data: result,
    });
  }
);