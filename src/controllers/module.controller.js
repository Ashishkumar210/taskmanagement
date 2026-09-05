const asyncHandler = require("../utils/asyncHandler");

const {
  BadRequestError,
} = require("../utils/error");

const ModuleService = require("../service/module.service");

/**
 * Create module
 */
exports.createModule = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const created_by =
      req.user?.userId ??
      req.user?.user_id ??
      req.user?.id ??
      1;

    const {
      project_id,
      name,
      code,
      description,
      status,
    } = req.body;

    if (!project_id) {
      throw new BadRequestError(
        "Project ID is required."
      );
    }

    if (!name || !name.trim()) {
      throw new BadRequestError(
        "Module name is required."
      );
    }

    const result =
      await ModuleService.createModule({
        organization_id,
        project_id,
        name,
        code,
        description,
        status,
        created_by,
      });

    return res.status(201).json({
      success: true,
      message: "Module created successfully.",
      data: result,
    });
  }
);

/**
 * Module list
 */
exports.getModuleList = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const result =
      await ModuleService.getModuleList({
        organization_id,
        ...req.query,
      });

    return res.status(200).json({
      success: true,
      message: "Module list fetched successfully.",
      data: result,
    });
  }
);

/**
 * Module details
 */
exports.getModuleDetails = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const module_id = Number(req.params.id);

    if (!module_id) {
      throw new BadRequestError(
        "Invalid module ID."
      );
    }

    const result =
      await ModuleService.getModuleDetails({
        module_id,
        organization_id,
      });

    return res.status(200).json({
      success: true,
      message: "Module details fetched successfully.",
      data: result,
    });
  }
);




exports.addWorkLog = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const user_id =
      req.user?.userId ??
      req.user?.user_id ??
      req.user?.id;

    const module_id = Number(req.params.id);

    const {
      work_date,
      currently_working,
      completed_work,
      hours_worked,
      blockers,
    } = req.body;

    if (!module_id) {
      throw new BadRequestError(
        "Invalid module ID."
      );
    }

    if (!work_date) {
      throw new BadRequestError(
        "Work date is required."
      );
    }

    if (
      !currently_working &&
      !completed_work
    ) {
      throw new BadRequestError(
        "Currently working or completed work is required."
      );
    }

    const result =
      await ModuleService.addWorkLog({
        organization_id,
        module_id,
        user_id,
        work_date,
        currently_working,
        completed_work,
        hours_worked,
        blockers,
      });

    return res.status(201).json({
      success: true,
      message:
        "Module work log created successfully.",
      data: result,
    });
  }
);

exports.getModuleWorkLogs = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const module_id = Number(req.params.id);

    const result =
      await ModuleService.getModuleWorkLogs({
        organization_id,
        module_id,
        ...req.query,
      });

    return res.status(200).json({
      success: true,
      message:
        "Module work logs fetched successfully.",
      data: result,
    });
  }
);



exports.updateModuleStatus = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const user_id =
      req.user?.userId ??
      req.user?.user_id ??
      req.user?.id;

    const module_id = Number(req.params.id);

    const { status } = req.body;

    if (!module_id || Number.isNaN(module_id)) {
      throw new BadRequestError(
        "Invalid module ID."
      );
    }

    if (!status) {
      throw new BadRequestError(
        "Status is required."
      );
    }

    const result =
      await ModuleService.updateModuleStatus({
        organization_id,
        module_id,
        user_id,
        status,
      });

    return res.status(200).json({
      success: true,
      message: result.statusChanged
        ? "Module status updated successfully."
        : "Module is already in this status.",
      data: result,
    });
  }
);




exports.assignEmployee = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const assigned_by =
      req.user?.userId ??
      req.user?.user_id ??
      req.user?.id ??
      1;

    const module_id = Number(req.params.id);

    const {
      user_id,
      employee_type,
    } = req.body;

    if (!module_id) {
      throw new BadRequestError(
        "Invalid module ID."
      );
    }

    const result =
      await ModuleService.assignEmployee({
        organization_id,
        module_id,
        user_id,
        employee_type,
        assigned_by,
      });

    return res.status(201).json({
      success: true,
      message:
        "Employee assigned to module successfully.",
      data: result,
    });
  }
);



exports.updateModuleStatus = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const user_id =
      req.user?.userId ??
      req.user?.user_id ??
      req.user?.id;

    const module_id = Number(req.params.id);

    const { status } = req.body;

    if (!module_id) {
      throw new BadRequestError(
        "Invalid module ID."
      );
    }

    if (!status) {
      throw new BadRequestError(
        "Status is required."
      );
    }

    const result =
      await ModuleService.updateModuleStatus({
        organization_id,
        module_id,
        user_id,
        status,
      });

    return res.status(200).json({
      success: true,
      message: result.statusChanged
        ? "Module status updated successfully."
        : "Module is already in this status.",
      data: result,
    });
  }
);





// const asyncHandler = require("../utils/asyncHandler");
// const AdminLogService = require("../services/adminLog.service");
// const {
//   BadRequestError,
// } = require("../utils/errors");

exports.getActivityLogs = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const {
      user_id,
      project_id,
      page = 1,
      limit = 10,
    } = req.query;

    if (
      user_id &&
      Number.isNaN(Number(user_id))
    ) {
      throw new BadRequestError(
        "Invalid user_id."
      );
    }

    if (
      project_id &&
      Number.isNaN(Number(project_id))
    ) {
      throw new BadRequestError(
        "Invalid project_id."
      );
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      Number.isNaN(pageNumber) ||
      pageNumber < 1
    ) {
      throw new BadRequestError(
        "Invalid page."
      );
    }

    if (
      Number.isNaN(limitNumber) ||
      limitNumber < 1
    ) {
      throw new BadRequestError(
        "Invalid limit."
      );
    }

    const result =
      await ModuleService.getActivityLogs({
        organization_id,

        user_id: user_id
          ? Number(user_id)
          : undefined,

        project_id: project_id
          ? Number(project_id)
          : undefined,

        page: pageNumber,
        limit: limitNumber,
      });

    return res.status(200).json({
      success: true,
      message:
        "Activity logs fetched successfully.",
      data: result,
    });
  }
);






exports.getModuleStatusLogs = asyncHandler(
  async (req, res) => {
    const organization_id =
      req.user?.organization_id ?? 1;

    const {
      module_id,
      user_id,
      page = 1,
      limit = 10,
    } = req.query;

    if (module_id && Number.isNaN(Number(module_id))) {
      throw new BadRequestError(
        "Invalid module_id."
      );
    }

    if (user_id && Number.isNaN(Number(user_id))) {
      throw new BadRequestError(
        "Invalid user_id."
      );
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1 || Number.isNaN(pageNumber)) {
      throw new BadRequestError(
        "Invalid page."
      );
    }

    if (limitNumber < 1 || Number.isNaN(limitNumber)) {
      throw new BadRequestError(
        "Invalid limit."
      );
    }

    const result =
      await ModuleService
        .getModuleStatusLogs({
          organization_id,

          module_id: module_id
            ? Number(module_id)
            : undefined,

          user_id: user_id
            ? Number(user_id)
            : undefined,

          page: pageNumber,
          limit: limitNumber,
        });

    return res.status(200).json({
      success: true,
      message:
        "Module activity logs fetched successfully.",
      data: result,
    });
  }
);








// exports.removeEmployee = asyncHandler(
//   async (req, res) => {
//     const removed_by =
//       req.user?.userId ??
//       req.user?.user_id ??
//       req.user?.id ??
//       1;

//     const module_id = Number(req.params.id);
//     const user_id = Number(req.params.user_id);

//     if (!module_id || !user_id) {
//       throw new BadRequestError(
//         "Invalid module or user ID."
//       );
//     }

//     const result =
//       await AssignmentService.removeEmployee({
//         module_id,
//         user_id,
//         removed_by,
//       });

//     return res.status(200).json({
//       success: true,
//       message:
//         "Employee removed from module successfully.",
//       data: result,
//     });
//   }
// );