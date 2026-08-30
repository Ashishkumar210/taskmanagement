const asyncHandler = require("../utils/asyncHandler");
const DepartmentService = require("../service/department.service");

/**
 * Get department list
 */
exports.getDepartmentList = asyncHandler(
  async (req, res) => {
    const result =
      await DepartmentService.getDepartmentList({
        ...req.query,
      });

    return res.status(200).json({
      success: true,
      message: "Department list fetched successfully.",
      data: result,
    });
  }
);




/**
 * Create department
 */
exports.createDepartment =
  asyncHandler(async (req, res) => {
    const result =
      await DepartmentService.createDepartment({
        name: req.body.name,
        code: req.body.code,
      });

    return res.status(201).json({
      success: true,
      message:
        "Department created successfully.",
      data: result,
    });
  });