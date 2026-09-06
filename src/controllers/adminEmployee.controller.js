const asyncHandler = require("../utils/asyncHandler");

const service =
  require("../service/adminEmployee.service");
const { BadRequestError } = require('../utils/error');


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

      let userId = Number(req.query.userId);

      if (userId == null) {
        userId = req.user?.user_id ||
          req.user?.userId || "1";
      }
      console.log('user id----------', userId);
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
  let {
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
  if (userId == null) {
    userId = req.user?.user_id ||
      req.user?.userId || "1";
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







// import { asyncHandler } from "../utils/asyncHandler.js";
// import { BadRequestError } from "../utils/ApiError.js";
// import ModuleDashboardService from "../service/moduleDashboard.service.js";

const PROJECT_MODULE_STATUSES = [
  "PLANNED",

  "DESIGN_WEB",
  "DEVELOPMENT_WEB",
  "IN_REVIEW_WEB",
  "TESTING_WEB",

  "DESIGN_APK",
  "DEVELOPMENT_APK",
  "IN_REVIEW_APK",
  "TESTING_APK",

  "DEVELOPMENT_BACKEND",
  "IN_REVIEW_BACKEND",
  "TESTING_BACKEND",

  "BLOCKED",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",

  "RE_DESIGN",

  // Legacy statuses
  "IN_PROGRESS",
  "IN_REVIEW",
  "TESTING",
];

const EMPLOYEE_TYPES = [
  "FRONTEND",
  "BACKEND",
  "TESTER",
  "FULL_STACK",
  "DEVOPS",
  "UI_UX",
  "OTHER",
];

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const parsePositiveInt = (value, fieldName) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestError(
      `Invalid ${fieldName}.`
    );
  }

  return parsed;
};

exports.getModuleDashboard = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id
      || 1;

    if (!organization_id) {
      throw new BadRequestError(
        "Organization is required."
      );
    }

    const {
      project_id,
      module_id,
      user_id,
      status,
      employee_type,
      from_date,
      to_date,
      page = 1,
      limit = 10,
    } = req.query;

    const projectId = parsePositiveInt(
      project_id,
      "project_id"
    );

    const moduleId = parsePositiveInt(
      module_id,
      "module_id"
    );

    const userId = parsePositiveInt(
      user_id,
      "user_id"
    );

    const pageNumber = parsePositiveInt(
      page,
      "page"
    ) ?? 1;

    const limitNumber = parsePositiveInt(
      limit,
      "limit"
    ) ?? 10;

    if (limitNumber > 100) {
      throw new BadRequestError(
        "limit cannot be greater than 100."
      );
    }

    if (
      status &&
      !PROJECT_MODULE_STATUSES.includes(status)
    ) {
      throw new BadRequestError(
        "Invalid status."
      );
    }

    if (
      employee_type &&
      !EMPLOYEE_TYPES.includes(employee_type)
    ) {
      throw new BadRequestError(
        "Invalid employee_type."
      );
    }

    if (
      from_date &&
      !isValidDateOnly(from_date)
    ) {
      throw new BadRequestError(
        "Invalid from_date. Expected YYYY-MM-DD."
      );
    }

    if (
      to_date &&
      !isValidDateOnly(to_date)
    ) {
      throw new BadRequestError(
        "Invalid to_date. Expected YYYY-MM-DD."
      );
    }

    if (
      from_date &&
      to_date &&
      from_date > to_date
    ) {
      throw new BadRequestError(
        "from_date cannot be greater than to_date."
      );
    }

    const result =
      await service.getDashboard({
        organization_id,

        project_id: projectId,
        module_id: moduleId,
        user_id: userId,

        status: status || undefined,
        employee_type:
          employee_type || undefined,

        from_date: from_date || undefined,
        to_date: to_date || undefined,

        page: pageNumber,
        limit: limitNumber,
      });

    return res.status(200).json({
      success: true,
      message:
        "Module dashboard fetched successfully.",
      data: result,
    });
  }
);




// const asyncHandler = require("../utils/asyncHandler");
// const {
//   BadRequestError,
// } = require("../utils/ApiError");

// const DailyWorkLogService = require("../service/dailyWorkLog.service");

// const EMPLOYEE_TYPES = [
//   "FRONTEND",
//   "BACKEND",
//   "TESTER",
//   "FULL_STACK",
//   "DEVOPS",
//   "UI_UX",
//   "OTHER",
// ];

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

// const parsePositiveInt = (value, field) => {
//   if (
//     value === undefined ||
//     value === null ||
//     value === ""
//   ) {
//     return undefined;
//   }

//   const number = Number(value);

//   if (!Number.isInteger(number) || number < 1) {
//     throw new BadRequestError(
//       `Invalid ${field}.`
//     );
//   }

//   return number;
// };

exports.getWorklogDashboard = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id || 1;

    if (!organization_id) {
      throw new BadRequestError(
        "Organization is required."
      );
    }

    const {
      project_id,
      module_id,
      user_id,
      employee_type,
      from_date,
      to_date,
      page = 1,
      limit = 20,
    } = req.query;

    const projectId = parsePositiveInt(
      project_id,
      "project_id"
    );

    const moduleId = parsePositiveInt(
      module_id,
      "module_id"
    );

    const userId = parsePositiveInt(
      user_id,
      "user_id"
    );

    const pageNumber =
      parsePositiveInt(page, "page") ?? 1;

    const limitNumber =
      parsePositiveInt(limit, "limit") ?? 20;

    if (limitNumber > 100) {
      throw new BadRequestError(
        "limit cannot be greater than 100."
      );
    }

    if (
      employee_type &&
      !EMPLOYEE_TYPES.includes(employee_type)
    ) {
      throw new BadRequestError(
        "Invalid employee_type."
      );
    }

    if (
      from_date &&
      !isValidDate(from_date)
    ) {
      throw new BadRequestError(
        "Invalid from_date. Expected YYYY-MM-DD."
      );
    }

    if (
      to_date &&
      !isValidDate(to_date)
    ) {
      throw new BadRequestError(
        "Invalid to_date. Expected YYYY-MM-DD."
      );
    }

    if (
      from_date &&
      to_date &&
      from_date > to_date
    ) {
      throw new BadRequestError(
        "from_date cannot be greater than to_date."
      );
    }

    const result =
      await service.getWorklogDashboard({
        organization_id,

        project_id: projectId,
        module_id: moduleId,
        user_id: userId,
        employee_type:
          employee_type || undefined,

        from_date,
        to_date,

        page: pageNumber,
        limit: limitNumber,
      });

    return res.status(200).json({
      success: true,
      message:
        "Worklog dashboard fetched successfully.",
      data: result,
    });
  }
);

