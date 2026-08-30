const bcrypt = require("bcryptjs");

const {
  BadRequestError,
  ConflictError,
} = require("../utils/error");


const jwt = require("jsonwebtoken");

const employeeAuthRepository = require("../repository/employeeAuthRepository");
const { config } = require('../config');

/**
 * Normalize email
 */
const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

/**
 * Normalize employee code
 *
 * Employee code is optional.
 *
 * Example:
 * emp-20471 -> EMP-20471
 */
const normalizeEmployeeCode = (employeeCode) => {
  if (
    employeeCode === undefined ||
    employeeCode === null ||
    typeof employeeCode !== "string" ||
    employeeCode.trim() === ""
  ) {
    return null;
  }

  return employeeCode
    .trim()
    .toUpperCase();
};

/**
 * Normalize full name
 */
const normalizeFullName = (fullName) => {
  return fullName
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * Split full name
 *
 * Example:
 *
 * Aarav Sharma
 *
 * firstName = Aarav
 * lastName  = Sharma
 */
const splitFullName = (fullName) => {
  const parts = fullName.split(" ");

  const firstName = parts.shift();

  const lastName = parts.length
    ? parts.join(" ")
    : null;

  return {
    firstName,
    lastName,
  };
};

/**
 * Employee Signup
 */
exports.signup = async ({
  fullName,
  email,
  employeeCode,
  departmentId,
  password,
}) => {
  /**
   * Basic validation
   */
  if (
    !fullName ||
    typeof fullName !== "string"
  ) {
    throw new BadRequestError(
      "Full name is required."
    );
  }

  if (
    !email ||
    typeof email !== "string"
  ) {
    throw new BadRequestError(
      "Work email is required."
    );
  }

  if (
    !password ||
    typeof password !== "string"
  ) {
    throw new BadRequestError(
      "Password is required."
    );
  }

  /**
   * Normalize values
   */
  const normalizedFullName =
    normalizeFullName(fullName);

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedEmployeeCode =
    normalizeEmployeeCode(employeeCode);

  /**
   * Full name validation
   */
  if (normalizedFullName.length < 2) {
    throw new BadRequestError(
      "Please enter a valid full name."
    );
  }

  if (normalizedFullName.length > 150) {
    throw new BadRequestError(
      "Full name cannot exceed 150 characters."
    );
  }

  /**
   * Email validation
   */
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(normalizedEmail)
  ) {
    throw new BadRequestError(
      "Please enter a valid work email."
    );
  }

  /**
   * Employee code validation
   *
   * DB:
   * VarChar(50)
   */
  if (
    normalizedEmployeeCode &&
    normalizedEmployeeCode.length > 50
  ) {
    throw new BadRequestError(
      "Employee code cannot exceed 50 characters."
    );
  }

  /**
   * Password validation
   */
  if (password.length < 8) {
    throw new BadRequestError(
      "Password must contain at least 8 characters."
    );
  }

  if (password.length > 128) {
    throw new BadRequestError(
      "Password cannot exceed 128 characters."
    );
  }

  /**
   * Check email
   */
  const existingUser =
    await employeeAuthRepository.findByEmail(
      normalizedEmail
    );

  if (existingUser) {
    throw new ConflictError(
      "Work email is already registered."
    );
  }

  /**
   * Check employee code
   *
   * Only when supplied.
   */
  if (normalizedEmployeeCode) {
    const existingEmployee =
      await employeeAuthRepository.findByEmployeeCode(
        normalizedEmployeeCode
      );

    if (existingEmployee) {
      throw new ConflictError(
        "Employee code is already registered."
      );
    }
  }

  /**
   * Department validation
   */
  let normalizedDepartmentId = null;

  if (
    departmentId !== undefined &&
    departmentId !== null &&
    departmentId !== ""
  ) {
    normalizedDepartmentId =
      Number(departmentId);

    if (
      !Number.isInteger(
        normalizedDepartmentId
      ) ||
      normalizedDepartmentId <= 0
    ) {
      throw new BadRequestError(
        "Invalid department ID."
      );
    }

    const department =
      await employeeAuthRepository.findDepartmentById(
        normalizedDepartmentId
      );

    if (!department) {
      throw new BadRequestError(
        "Selected department is invalid."
      );
    }
  }

  /**
   * Split full name
   */
  const {
    firstName,
    lastName,
  } = splitFullName(
    normalizedFullName
  );

  /**
   * Hash password
   */
  const passwordHash =
    await bcrypt.hash(password, 12);

  /**
   * Create employee
   */
  const user =
    await employeeAuthRepository.createEmployee({
      firstName,
      lastName,
      email: normalizedEmail,
      employeeCode:
        normalizedEmployeeCode,
      departmentId:
        normalizedDepartmentId,
      passwordHash,
    });

  /**
   * Safe response
   *
   * Never return passwordHash.
   */
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    employeeCode: user.employeeCode,
    departmentId: user.departmentId,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
};







/**
 * Employee Sign In
 */
exports.signin = async ({
  email,
  password,
  rememberMe = false,
}) => {
  /**
   * Validate email
   */
  if (
    !email ||
    typeof email !== "string"
  ) {
    throw new BadRequestError(
      "Work email is required."
    );
  }

  /**
   * Validate password
   */
  if (
    !password ||
    typeof password !== "string"
  ) {
    throw new BadRequestError(
      "Password is required."
    );
  }

  /**
   * Normalize email
   */
  const normalizedEmail =
    normalizeEmail(email);

  /**
   * Validate email format
   */
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(
      normalizedEmail
    )
  ) {
    throw new BadRequestError(
      "Please enter a valid work email."
    );
  }

  /**
   * Find user
   */
  const user =
    await employeeAuthRepository.findByEmailForLogin(
      normalizedEmail
    );

  /**
   * Don't reveal whether
   * the email exists.
   */
  if (!user) {
    throw new UnauthorizedError(
      "Invalid email or password."
    );
  }

  /**
   * Check account status
   */
  if (user.status !== "ACTIVE") {
    throw new UnauthorizedError(
      "Your employee account is not active."
    );
  }

  /**
   * Compare password
   */
  const passwordMatch =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!passwordMatch) {
    throw new UnauthorizedError(
      "Invalid email or password."
    );
  }

  /**
   * Update last login
   */
  await employeeAuthRepository.updateLastLogin(
    user.id
  );

  /**
   * Generate JWT
   */
  const accessToken =
    jwt.sign(
      {
        userId: user.id,

        email: user.email,

        employeeCode:
          user.employeeCode,

        departmentId:
          user.departmentId,
      },

      config.JWT_ACCESS_SECRET,

      {
        expiresIn: rememberMe
          ? config.JWT_ACCESS_EXPIRES_IN
          : config.JWT_ACCESS_EXPIRES_IN,
      }
    );

  /**
   * Return safe user data
   */
  return {
    accessToken,

    user: {
      id: user.id,

      firstName:
        user.firstName,

      lastName:
        user.lastName,

      email:
        user.email,

      employeeCode:
        user.employeeCode,

      departmentId:
        user.departmentId,

      status:
        user.status,

      lastLoginAt:
        new Date(),
    },
  };
};