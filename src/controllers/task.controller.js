const asyncHandler = require("../utils/asyncHandler");
const { BadRequestError } = require("../utils/error");
const TaskService = require("../service/task.service");

/**
 * Create New Task
 *
 * Content-Type:
 * multipart/form-data
 *
 * Fields:
 * title
 * project_id
 * due_date
 * priority
 * status
 * description
 * checklist
 *
 * File:
 * file - optional
 */
exports.createTask = asyncHandler(async (req, res) => {
  const organization_id =
    req.user?.organization_id ?? 1;

  const created_by =
    req.user?.userId ?? 1;

  const {
    title,
    project_id,
    due_date,
    priority,
    status,
    description,
    checklist,
  } = req.body;

  /**
   * Task title is required.
   */
  if (
    !title ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    throw new BadRequestError(
      "Task title is required."
    );
  }

  /**
   * File is optional.
   *
   * multer will put the uploaded file
   * into req.file.
   */
  const result = await TaskService.createTask({
    organization_id,
    created_by,

    title,
    project_id,
    due_date,
    priority,
    status,
    description,
    checklist,

    file: req.file || null,
  });

  return res.status(201).json({
    success: true,
    message: "Task created successfully.",
    data: result,
  });
});





/**
 * Get task list
 */
exports.getTaskList = asyncHandler(
  async (req, res) => {
    /**
     * Organization must come from
     * authenticated user.
     *
     * Do NOT accept organization_id
     * from query params.
     */
    const organization_id =
      req.user?.organization_id ?? 1;
    created_by = req.user?.userId ?? 1;
    console.log('user======', req.user);

    const result =
      await TaskService.getTaskList({
        organization_id,
        created_by,

        ...req.query,
      });

    return res.status(200).json({
      success: true,
      message: "Task list fetched successfully.",
      data: result,
    });
  }
);