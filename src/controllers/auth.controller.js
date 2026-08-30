const { BadRequestError } = require('../utils/error');
const asyncHandler = require('../utils/asyncHandler');
const { config } = require('../config');
const authService = require('../service/authService')


exports.sendOTP = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    throw new BadRequestError("All fields are required.");
  }

  if (password !== confirmPassword) {
    throw new BadRequestError("Password and Confirm Password do not match.");
  }

  const { otpSessionId } = await authService.sendOTP(
    firstName,
    lastName,
    email,
    password
  );

  res.cookie("otp_session", otpSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: config.OTP_TTL * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully.",
  });
});



exports.verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new BadRequestError("OTP is required.");
  }

  const otpSessionId = req.cookies.otp_session;
  console.log("OTP FROM BODY:", otp);
  console.log("COOKIES:", req.cookies);



  console.log("OTP SESSION FROM COOKIE:", otpSessionId);
  // console.log("OTP DATA:", otpData);
  if (!otpSessionId) {
    throw new BadRequestError(
      "OTP session has expired or is invalid.",
      "OTP_SESSION_INVALID"
    );
  }

  const result = await authService.verifyOTP(
    otp,
    otpSessionId
  );

  // OTP successfully verified
  res.clearCookie("otp_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    data: result,
  });
});




// const crypto = require("crypto");

// // exports.login = asyncHandler(async (req, res) => {
// //   const {
// //     email,
// //     password,
// //     deviceId,
// //   } = req.body;

// //   if (!email || !password) {
// //     throw new BadRequestError(
// //       "Email and password are required.",
// //       "LOGIN_FIELDS_REQUIRED"
// //     );
// //   }

// //   // Generate one if client doesn't provide it
// //   const finalDeviceId =
// //     deviceId || crypto.randomUUID();

// //   const deviceInfo = {
// //     userAgent: req.get("User-Agent") || null,
// //     ip:
// //       req.headers["x-forwarded-for"]
// //         ?.split(",")[0]
// //         ?.trim() ||
// //       req.socket.remoteAddress ||
// //       null,
// //     accept: req.get("Accept") || null,
// //   };

// //   const result = await authService.login(
// //     email,
// //     password,
// //     finalDeviceId,
// //     deviceInfo
// //   );

// //   // Access token
// //   res.cookie("access_token", result.accessToken, {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "strict",
// //     maxAge: 15 * 60 * 1000,
// //   });

// //   // Refresh token
// //   res.cookie("refresh_token", result.refreshToken, {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "strict",
// //     maxAge: 7 * 24 * 60 * 60 * 1000,
// //   });

// //   return res.status(200).json({
// //     success: true,
// //     message: "Login successful.",
// //     data: {
// //       user: {
// //         id: result.user.id,
// //         firstName: result.user.firstName,
// //         lastName: result.user.lastName,
// //         email: result.user.email,
// //         role: result.user.role,
// //       },
// //       deviceId: result.deviceId,
// //     },
// //   });
// // });

// const authService = require("../service/authService");
// const asyncHandler = require("../utils/asyncHandler");

// const { config } = require("../config");

exports.login = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    deviceId,
  } = req.body;

  const userAgent = req.get("User-Agent");

  const ip =
    req.headers["x-forwarded-for"]
      ?.split(",")[0]
      ?.trim() ||
    req.socket.remoteAddress;

  const result = await authService.login({
    email,
    password,
    deviceId,
    userAgent,
    ip,
  });

  // -----------------------------
  // Access token cookie
  // -----------------------------

  res.cookie("access_token", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  // -----------------------------
  // Refresh token cookie
  // -----------------------------

  res.cookie(
    "refresh_token",
    result.refreshToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: result.user,
      deviceId: result.deviceId,
    },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    throw new UnauthorizedError(
      "Refresh token is required.",
      "REFRESH_TOKEN_REQUIRED"
    );
  }

  // Verify JWT
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new UnauthorizedError(
      "Invalid or expired refresh token.",
      "REFRESH_TOKEN_INVALID"
    );
  }

  // Check jti in Redis
  const session = await getRefreshSession(
    decoded.jti
  );

  if (!session) {
    throw new UnauthorizedError(
      "Refresh token has been revoked.",
      "REFRESH_TOKEN_REVOKED"
    );
  }

  // Make sure session belongs to same user/device
  if (
    session.userId !== decoded.id ||
    session.deviceId !== decoded.deviceId
  ) {
    throw new UnauthorizedError(
      "Invalid refresh session.",
      "REFRESH_SESSION_INVALID"
    );
  }

  // Get user
  const user = await authRepository.findById(
    decoded.id
  );

  if (!user) {
    throw new UnauthorizedError(
      "User not found.",
      "USER_NOT_FOUND"
    );
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(
    user,
    decoded.deviceId
  );

  // Generate new refresh token + new jti
  const {
    refreshToken: newRefreshToken,
    jti: newJti,
  } = generateRefreshToken(
    user,
    decoded.deviceId
  );

  // Delete OLD refresh session
  await deleteRefreshSession(decoded.jti);

  // Store NEW refresh session
  await storeRefreshSession({
    jti: newJti,
    userId: user.id,
    deviceId: decoded.deviceId,
    userAgent: req.get("User-Agent"),
    ip:
      req.headers["x-forwarded-for"]
        ?.split(",")[0]
        ?.trim() ||
      req.socket.remoteAddress,
  });

  // Set access token
  res.cookie("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  // Set new refresh token
  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully.",
  });
});