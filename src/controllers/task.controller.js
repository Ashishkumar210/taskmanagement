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




/**
 * Get task details
 */
exports.getTaskDetails =
  asyncHandler(
    async (req, res) => {
      const taskId = Number(req.params.id);

      const task_id =
        taskId;

      const organization_id =
        req.user?.organization_id ?? 1;

      const result =
        await TaskService.getTaskDetails({
          task_id,

          organization_id,
        });

      return res.status(200).json({
        success: true,

        message:
          "Task details fetched successfully.",

        data: result,
      });
    }
  );






/**
 * Update task status
 */
exports.updateTaskStatus =
  asyncHandler(
    async (req, res) => {
      // const {
      //   id,
      // } = req.params;

      const id = Number(req.params.id);

      const {
        status,
      } = req.body;

      /**
       * Depending on your JWT middleware,
       * use the property that contains
       * the authenticated user ID.
       */
      const user_id =
        req.user?.user_id ||
        req.user?.userId ||
        req.user?.id;

      const organization_id =
        req.user?.organization_id ||
        req.user?.organizationId || 1;

      const result =
        await TaskService.updateTaskStatus({
          task_id: id,

          organization_id,

          user_id,

          status,
        });

      return res.status(200).json({
        success: true,

        message:
          result.statusChanged
            ? "Task status updated successfully."
            : "Task is already in this status.",

        data: result,
      });
    }
  );