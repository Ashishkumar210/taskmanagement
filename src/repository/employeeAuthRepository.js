// const prisma = require("../config/prisma");

// /**
//  * Find user by email
//  */
// const findByEmail = async (email) => {
//   return prisma.user.findUnique({
//     where: {
//       email,
//     },
//   });
// };

// /**
//  * Find user by employee code
//  *
//  * Employee code is optional during signup.
//  */
// const findByEmployeeCode = async (
//   employeeCode
// ) => {
//   if (!employeeCode) {
//     return null;
//   }

//   return prisma.user.findUnique({
//     where: {
//       employeeCode,
//     },
//   });
// };

// /**
//  * Find department
//  */
// const findDepartmentById = async (
//   departmentId
// ) => {
//   if (!departmentId) {
//     return null;
//   }

//   return prisma.department.findFirst({
//     where: {
//       id: Number(departmentId),
//       deletedAt: null,
//     },

//     select: {
//       id: true,
//       name: true,
//     },
//   });
// };

// /**
//  * Create employee
//  */
// const createEmployee = async ({
//   firstName,
//   lastName,
//   email,
//   employeeCode,
//   departmentId,
//   passwordHash,
// }) => {
//   return prisma.user.create({
//     data: {
//       firstName,

//       lastName,

//       email,

//       employeeCode:
//         employeeCode || null,

//       passwordHash,

//       departmentId:
//         departmentId || null,

//       /**
//        * No OTP verification is being used
//        * in this signup flow.
//        *
//        * Therefore this remains false.
//        */
//       emailVerified: false,

//       mobileVerified: false,

//       status: "ACTIVE",
//     },

//     select: {
//       id: true,

//       firstName: true,

//       lastName: true,

//       email: true,

//       employeeCode: true,

//       departmentId: true,

//       emailVerified: true,

//       mobileVerified: true,

//       status: true,

//       createdAt: true,
//     },
//   });
// };

// /**
//  * Find user by ID
//  */
// const findById = async (id) => {
//   return prisma.user.findUnique({
//     where: {
//       id,
//     },
//   });
// };

// /**
//  * Find employee for login
//  */
// const findByEmailForLogin = async (
//   email
// ) => {
//   return prisma.user.findUnique({
//     where: {
//       email,
//     },

//     select: {
//       id: true,

//       firstName: true,

//       lastName: true,

//       email: true,

//       employeeCode: true,

//       departmentId: true,

//       passwordHash: true,

//       emailVerified: true,

//       mobileVerified: true,

//       status: true,
//     },
//   });
// };



// const updateLastLogin = async (
//   userId
// ) => {
//   return prisma.user.update({
//     where: {
//       id: userId,
//     },

//     data: {
//       lastLoginAt: new Date(),
//     },

//     select: {
//       id: true,
//       lastLoginAt: true,
//     },
//   });
// };
// module.exports = {
//   findByEmail,
//   findByEmployeeCode,
//   findDepartmentById,
//   createEmployee,
//   findById,
//   findByEmailForLogin,
//   updateLastLogin
// };


const prisma = require("../config/prisma");

/**
 * Find user by email
 */
const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

/**
 * Find user by employee code
 *
 * Employee code is optional during signup.
 */
const findByEmployeeCode = async (employeeCode) => {
  if (!employeeCode) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      employeeCode,
    },
  });
};

/**
 * Find department
 */
const findDepartmentById = async (departmentId) => {
  if (!departmentId) {
    return null;
  }

  return prisma.department.findFirst({
    where: {
      id: Number(departmentId),
      deletedAt: null,
    },

    select: {
      id: true,
      name: true,
    },
  });
};

/**
 * Create employee
 */
const createEmployee = async ({
  firstName,
  lastName,
  email,
  employeeCode,
  departmentId,
  passwordHash,
}) => {
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,

      employeeCode: employeeCode || null,

      passwordHash,

      departmentId: departmentId
        ? Number(departmentId)
        : null,

      emailVerified: false,
      mobileVerified: false,

      status: "ACTIVE",
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeCode: true,
      departmentId: true,
      emailVerified: true,
      mobileVerified: true,
      status: true,
      createdAt: true,
    },
  });
};

/**
 * Find user by ID
 */
const findById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });
};

/**
 * Find employee for login
 */
const findByEmailForLogin = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeCode: true,
      departmentId: true,
      passwordHash: true,
      emailVerified: true,
      mobileVerified: true,
      status: true,
    },
  });
};

/**
 * Update last login
 */
const updateLastLogin = async (userId) => {
  return prisma.user.update({
    where: {
      id: Number(userId),
    },

    data: {
      lastLoginAt: new Date(),
    },

    select: {
      id: true,
      lastLoginAt: true,
    },
  });
};

module.exports = {
  findByEmail,
  findByEmployeeCode,
  findDepartmentById,
  createEmployee,
  findById,
  findByEmailForLogin,
  updateLastLogin,
};
