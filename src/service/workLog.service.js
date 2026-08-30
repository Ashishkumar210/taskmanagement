const {
  BadRequestError,
  ConflictError,
} = require("../utils/error");

const WorkLogRepo =
  require("../repository/workLog.repo");

const {
  validateCreateWorkLog,
} = require("../utils/workLog.validator");

exports.createWorkLog = async ({
  organization_id,
  user_id,

  log_date,
  hours_worked,

  task_id,
  project_id,

  work_item_title,
  daily_summary,

  achievements,
  blockers,

  file,
}) => {
  /**
   * Authentication context
   */
  if (!organization_id) {
    throw new BadRequestError(
      "Organization is required."
    );
  }

  if (!user_id) {
    throw new BadRequestError(
      "Authenticated user is required."
    );
  }

  /**
   * Validate request
   */
  const validated =
    validateCreateWorkLog({
      log_date,
      hours_worked,

      task_id,
      project_id,

      work_item_title,
      daily_summary,

      achievements,
      blockers,
    });

  /**
   * Validate task and project
   * inside the same organization.
   */
  if (validated.taskId) {
    const task =
      await WorkLogRepo.findTaskForOrganization({
        task_id:
          validated.taskId,

        organization_id,
      });

    if (!task) {
      throw new BadRequestError(
        "Selected task is invalid."
      );
    }

    /**
     * If project was not explicitly
     * selected, use task's project.
     */
    if (
      !validated.projectId &&
      task.project_id
    ) {
      validated.projectId =
        task.project_id;
    }

    /**
     * If both task and project are
     * supplied, they must match.
     */
    if (
      validated.projectId &&
      task.project_id !==
      validated.projectId
    ) {
      throw new BadRequestError(
        "Selected task does not belong to the selected project."
      );
    }
  }

  /**
   * Validate project.
   */
  if (validated.projectId) {
    const project =
      await WorkLogRepo.findProjectForOrganization({
        project_id:
          validated.projectId,

        organization_id,
      });

    if (!project) {
      throw new BadRequestError(
        "Selected project is invalid."
      );
    }
  }

  /**
   * Prevent duplicate daily
   * submission for same employee.
   *
   * Remove this check if you want
   * multiple work logs per day.
   */
  const existing =
    await WorkLogRepo.findByUserAndDate({
      user_id,

      organization_id,

      log_date:
        validated.logDate,
    });

  if (existing) {
    throw new ConflictError(
      "You have already submitted a work log for this date."
    );
  }

  /**
   * Create work log
   */
  const workLog =
    await WorkLogRepo.createWorkLog({
      organization_id,

      user_id,

      log_date:
        validated.logDate,

      hours_worked:
        validated.hours,

      task_id:
        validated.taskId,

      project_id:
        validated.projectId,

      work_item_title:
        validated.workItemTitle,

      daily_summary:
        validated.dailySummary,

      achievements:
        validated.achievements,

      blockers:
        validated.blockers,
    });

  /**
   * Optional attachment
   */
  if (file) {
    await WorkLogRepo.createAttachment({
      work_log_id:
        workLog.id,

      organization_id,

      uploaded_by:
        user_id,

      file_name:
        file.originalname,

      file_url:
        file.path ||
        file.location,

      file_size:
        file.size,

      mime_type:
        file.mimetype,
    });
  }

  /**
   * Return complete result.
   */
  return WorkLogRepo.findById({
    id: workLog.id,

    organization_id,
  });
};