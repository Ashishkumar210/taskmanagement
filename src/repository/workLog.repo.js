const prisma =
  require("../config/prisma");

/**
 * Find task inside organization
 */
exports.findTaskForOrganization =
  async ({
    task_id,
    organization_id,
  }) => {
    return prisma.task.findFirst({
      where: {
        id: task_id,

        organization_id,

        deleted_at: null,
      },

      select: {
        id: true,
        project_id: true,
        title: true,
        status: true,
      },
    });
  };

/**
 * Find project inside organization
 */
exports.findProjectForOrganization =
  async ({
    project_id,
    organization_id,
  }) => {
    return prisma.project.findFirst({
      where: {
        id: project_id,

        organization_id,

        deleted_at: null,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });
  };

/**
 * Find existing daily work log
 */
exports.findByUserAndDate =
  async ({
    user_id,
    organization_id,
    log_date,
  }) => {
    return prisma.dailyWorkLog.findFirst({
      where: {
        user_id,

        organization_id,

        log_date,

        deleted_at: null,
      },

      select: {
        id: true,
        log_date: true,
      },
    });
  };

/**
 * Create work log
 */
exports.createWorkLog =
  async ({
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
  }) => {
    return prisma.dailyWorkLog.create({
      data: {
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
      },

      select: {
        id: true,

        organization_id: true,

        user_id: true,

        log_date: true,

        hours_worked: true,

        task_id: true,

        project_id: true,

        work_item_title: true,

        daily_summary: true,

        achievements: true,

        blockers: true,

        created_at: true,
      },
    });
  };

/**
 * Create attachment
 */
exports.createAttachment =
  async ({
    work_log_id,

    organization_id,

    uploaded_by,

    file_name,

    file_url,

    file_size,

    mime_type,
  }) => {
    return prisma.dailyWorkLogAttachment.create({
      data: {
        work_log_id,

        organization_id,

        uploaded_by,

        file_name,

        file_url,

        file_size: BigInt(file_size),

        mime_type,
      },
    });
  };

/**
 * Get work log
 */
exports.findById =
  async ({
    id,
    organization_id,
  }) => {
    return prisma.dailyWorkLog.findFirst({
      where: {
        id,

        organization_id,

        deleted_at: null,
      },

      select: {
        id: true,

        organization_id: true,

        user_id: true,

        log_date: true,

        hours_worked: true,

        task_id: true,

        project_id: true,

        work_item_title: true,

        daily_summary: true,

        achievements: true,

        blockers: true,

        created_at: true,

        updated_at: true,

        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },

        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        attachments: {
          where: {
            deleted_at: null,
          },

          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            created_at: true,
          },
        },
      },
    });
  };