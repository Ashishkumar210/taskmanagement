const prisma = require("../config/prisma");

const ModuleRepository = require("../repository/projectModule.repository");

const {
  BadRequestError,
  NotFoundError,
} = require("../utils/error");

exports.createModule = async ({
  organization_id,
  project_id,
  name,
  code,
  description,
  status,
  created_by,
}) => {
  project_id = Number(project_id);

  if (!project_id) {
    throw new BadRequestError("Project ID is required.");
  }

  const project = await ModuleRepository.findProject({
    project_id,
    organization_id,
  });

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (!name || !name.trim()) {
    throw new BadRequestError("Module name is required.");
  }

  if (code) {
    const existing =
      await ModuleRepository.findModuleByCode({
        project_id,
        code: code.trim(),
      });

    if (existing) {
      throw new BadRequestError(
        "Module code already exists in this project."
      );
    }
  }

  return ModuleRepository.createModule({
    organization_id,
    project_id,
    name,
    code,
    description,
    status,
    created_by,
  });
};

exports.getModuleList = async ({
  organization_id,
  project_id,
  status,
  search,
  page = 1,
  limit = 10,
}) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  return ModuleRepository.getModuleList({
    organization_id,
    project_id,
    status,
    search,
    skip,
    take: limit,
  });
};

exports.getModuleDetails = async ({
  module_id,
  organization_id,
}) => {
  module_id = Number(module_id);

  if (!module_id) {
    throw new BadRequestError("Invalid module ID.");
  }

  const module =
    await ModuleRepository.getModuleDetails({
      module_id,
      organization_id,
    });

  if (!module) {
    throw new NotFoundError("Module not found.");
  }

  return module;
};








//const ModuleRepository = require("../repository/module.repository");

// const {
//   BadRequestError,
//   NotFoundError,
// } = require("../utils/error");

exports.assignEmployee = async ({
  organization_id,
  module_id,
  user_id,
  employee_type,
  assigned_by,
}) => {
  module_id = Number(module_id);
  user_id = Number(user_id);

  if (!module_id) {
    throw new BadRequestError("Module ID is required.");
  }

  if (!user_id) {
    throw new BadRequestError("User ID is required.");
  }

  if (!employee_type) {
    throw new BadRequestError(
      "Employee type is required."
    );
  }

  const module =
    await ModuleRepository.getModuleDetails({
      module_id,
      organization_id,
    });

  if (!module) {
    throw new NotFoundError("Module not found.");
  }

  const user =
    await ModuleRepository.findUser(user_id);

  if (!user) {
    throw new NotFoundError("Employee not found.");
  }

  const existing =
    await ModuleRepository.findAssignment({
      module_id,
      user_id,
    });

  if (existing?.is_active) {
    throw new BadRequestError(
      "Employee is already assigned to this module."
    );
  }

  if (existing && !existing.is_active) {
    return ModuleRepository.prisma?.projectModuleAssignment;
  }

  return ModuleRepository.createAssignment({
    organization_id,
    module_id,
    user_id,
    employee_type,
    assigned_by,
  });
};

exports.removeEmployee = async ({
  module_id,
  user_id,
  removed_by,
}) => {
  const result =
    await ModuleRepository.removeAssignment({
      module_id: Number(module_id),
      user_id: Number(user_id),
      removed_by,
    });

  if (!result.count) {
    throw new NotFoundError(
      "Active employee assignment not found."
    );
  }

  return result;
};







exports.addWorkLog = async ({
  organization_id,
  module_id,
  user_id,
  work_date,
  currently_working,
  completed_work,
  hours_worked,
  blockers,
}) => {
  module_id = Number(module_id);
  user_id = Number(user_id);

  const module =
    await prisma.projectModule.findFirst({
      where: {
        id: module_id,
        organization_id,
        deleted_at: null,
      },
    });

  if (!module) {
    throw new NotFoundError("Module not found.");
  }

  const assignment =
    await prisma.projectModuleAssignment.findFirst({
      where: {
        module_id,
        user_id,
        is_active: true,
      },
    });

  if (!assignment) {
    throw new BadRequestError(
      "Employee is not assigned to this module."
    );
  }

  if (
    hours_worked !== undefined &&
    Number(hours_worked) < 0
  ) {
    throw new BadRequestError(
      "Hours worked cannot be negative."
    );
  }

  return prisma.projectModuleWorkLog.create({
    data: {
      organization_id,
      module_id,
      user_id,
      work_date: new Date(work_date),
      currently_working,
      completed_work,
      hours_worked,
      blockers,
    },
  });
};




exports.getModuleWorkLogs = async ({
  organization_id,
  module_id,
  user_id,
  page = 1,
  limit = 10,
}) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const where = {
    organization_id,
    module_id: Number(module_id),

    ...(user_id
      ? {
        user_id: Number(user_id),
      }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.projectModuleWorkLog.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        work_date: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    }),

    prisma.projectModuleWorkLog.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.updateModuleStatus = async ({
  organization_id,
  module_id,
  user_id,
  status,
}) => {
  module_id = Number(module_id);
  user_id = user_id ? Number(user_id) : null;

  return prisma.$transaction(async (tx) => {
    const module = await tx.projectModule.findFirst({
      where: {
        id: module_id,
        organization_id,
        deleted_at: null,
      },
    });

    if (!module) {
      throw new NotFoundError("Module not found.");
    }

    const oldStatus = module.status;

    // No change required
    if (oldStatus === status) {
      return {
        statusChanged: false,
        previous_status: oldStatus,
        new_status: status,
        module,
      };
    }

    // Update module status
    const updated = await tx.projectModule.update({
      where: {
        id: module_id,
      },
      data: {
        status,
        updated_by: user_id,
      },
    });

    // Create status history
    await tx.projectModuleStatusLog.create({
      data: {
        organization_id,
        module_id,
        user_id,
        old_status: oldStatus,
        new_status: status,
      },
    });

    return {
      statusChanged: true,
      previous_status: oldStatus,
      new_status: status,
      module: updated,
    };
  });
};




exports.getActivityLogs = async ({
  organization_id,
  user_id,
  project_id,
  page,
  limit,
}) => {
  return ModuleRepository.getActivityLogs({
    organization_id,
    user_id,
    project_id,
    page,
    limit,
  });
};







// exports.getModuleStatusLogs = async ({
//   organization_id,
//   module_id,
//   user_id,
//   page,
//   limit,
// }) => {
//   return ModuleRepository.getModuleStatusLogs({
//     organization_id,
//     module_id,
//     user_id,
//     page,
//     limit,
//   });
// };




// exports.getModuleStatusLogs = async ({
//   organization_id,
//   project_id,
//   module_id,
//   user_id,
//   page,
//   limit,
// }) => {
//   return ModuleRepository.getModuleStatusLogs({
//     organization_id,
//     project_id,
//     module_id,
//     user_id,
//     page,
//     limit,
//   });
// };



exports.getModuleStatusLogs = async ({
  organization_id,
  project_id,
  module_id,
  user_id,
  status,
  from_date,
  to_date,
  page,
  limit,
}) => {
  return ModuleRepository.getModuleStatusLogs({
    organization_id,
    project_id,
    module_id,
    user_id,
    status,
    from_date,
    to_date,
    page,
    limit,
  });
};

