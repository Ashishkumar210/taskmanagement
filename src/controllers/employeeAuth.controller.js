const { BadRequestError } = require("../utils/error");
const asyncHandler = require("../utils/asyncHandler");
const employeeAuthService = require("../service/employeeAuthService");
const jwt = require("jsonwebtoken");
const { config } = require('../config');

/**
 * Employee Signup
 *
 * Required:
 * - fullName
 * - email
 * - password
 * - confirmPassword
 *
 * Optional:
 * - employeeCode
 * - departmentId
 */
exports.signup = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    employeeCode,
    departmentId,
    password,
    confirmPassword,
    rememberMe = false
  } = req.body;

  /**
   * Required fields
   */
  if (
    !fullName ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    throw new BadRequestError(
      "Full Name, Work Email, Password and Confirm Password are required."
    );
  }

  /**
   * Password confirmation
   */
  if (password !== confirmPassword) {
    throw new BadRequestError(
      "Password and Confirm Password do not match."
    );
  }

  /**
   * Create employee account
   */
  const result = await employeeAuthService.signup({
    fullName,
    email,
    employeeCode,
    departmentId,
    password
  });


  /**
  * Store access token in HTTP-only cookie
  */
  res.cookie(
    "access_token",
    result.accessToken,
    {
      httpOnly: true,

      secure: true,

      sameSite: "none",

      /**
       * Remember me:
       *
       * true  -> persistent cookie
       * false -> session cookie
       */
      ...(rememberMe && {
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),

      path: "/",
    }
  );
  return res.status(201).json({
    success: true,
    message: "Employee account created successfully.",
    data: result,
  });
});





exports.signin = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    rememberMe = false,
  } = req.body;

  /**
   * Required fields
   */
  if (!email || !password) {
    throw new BadRequestError(
      "Work Email and Password are required."
    );
  }

  /**
   * Sign in
   */
  const result =
    await employeeAuthService.signin({
      email,
      password,
      rememberMe,
    });

  /**
   * Store access token in HTTP-only cookie
   */
  res.cookie(
    "access_token",
    result.accessToken,
    {
      httpOnly: true,

      secure: true,

      sameSite: "none",

      /**
       * Remember me:
       *
       * true  -> persistent cookie
       * false -> session cookie
       */
      ...(rememberMe && {
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),

      path: "/",
    }
  );

  return res.status(200).json({
    success: true,
    message: "Signed in successfully.",
    data: {
      user: result.user,
    },
  });
});





// const asyncHandler =
//   require("../../../utils/asyncHandler");

// const UserService =
//   require("./user.service");

/**
 * Get user list
 */
exports.getUserList =
  asyncHandler(async (req, res) => {
    const result =
      await employeeAuthService.getUserList({
        ...req.query,
      });

    return res.status(200).json({
      success: true,

      message:
        "User list fetched successfully.",

      data: result,
    });
  });


/**
 * Get user details
 */
exports.getUserDetails =
  asyncHandler(async (req, res) => {
    const userId =
      req.user?.user_id ||
      req.user?.userId || "1";

    console.log('user id===', userId);
    const result =
      await employeeAuthService.getUserDetails(
        userId
      );

    return res.status(200).json({
      success: true,

      message:
        "User details fetched successfully.",

      data: result,
    });
  });