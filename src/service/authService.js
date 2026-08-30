


const bcrypt = require("bcryptjs");

const { BadRequestError, ConflictError } = require("../utils/error");
const authRepository = require("../repository/authRepository");
const { sendOtpEmail } = require("../utils/email");
const { generateAndStoreOtp } = require("../utils/otp");
const RedisClient = require('../config/redis');
const {

  hmacFor,
} = require("../utils/otp");

const sendOTP = async (firstName, lastName, email, password) => {
  // Check if email already exists
  const existingUser = await authRepository.findByEmail(email);

  if (existingUser) {
    throw new ConflictError("Email already registered.");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate OTP & store in Redis
  const { otp, otpSessionId } = await generateAndStoreOtp({
    firstName,
    lastName,
    email,
    passwordHash,
  });

  // Send OTP
  await sendOtpEmail(email, otp);

  return {
    otpSessionId,
  };
};


/**
 * Get OTP details from Redis
 */
// async function getOtpDetails(otpSessionId) {
//   if (!otpSessionId) {
//     return null;
//   }

//   const redis = await RedisClient.connect();

//   const key = `otp:session:${otpSessionId}`;

//   const rowData = await redis.get(key);
//   console.log('row data', rowData);

//   if (!rowData) {
//     return null;
//   }

//   try {
//     const otpData = JSON.parse(rowData);

//     return otpData;
//   } catch (error) {
//     return null;
//   }
// }


async function getOtpDetails(otpSessionId) {
  if (!otpSessionId) {
    return null;
  }

  const redis = await RedisClient.connect();

  const key = `otp:session:${otpSessionId}`;

  console.log("OTP Redis key:", key);

  const rowData = await redis.get(key);

  console.log("OTP row data:", rowData);


  // console.log("========== GET OTP DEBUG ==========");
  // console.log("OTP SESSION ID:", otpSessionId);
  // console.log("OTP Redis key:", key);
  // console.log("Redis status:", redis.status);
  // console.log("Redis DB:", redis.options.db);
  // console.log("Redis host:", redis.options.host);
  // console.log("Redis port:", redis.options.port);

  if (!rowData) {
    return null;
  }

  try {
    const otpData = JSON.parse(rowData);

    // Make sure the stored session matches
    if (otpData.sessionId !== otpSessionId) {
      return null;
    }

    return otpData;
  } catch (error) {
    console.error(
      "Failed to parse OTP Redis data:",
      error.message
    );

    return null;
  }
}

// async function verifyOTP(otp, otpSessionId) {
//   const otpData = await getOtpDetails(otpSessionId);

//   if (!otpData) {
//     throw new BadRequestError(
//       "OTP is invalid or expired.",
//       "OTP_INVALID"
//     );
//   }

//   if (otpData.attempts >= 5) {
//     throw new TooManyRequestsError(
//       "Too many incorrect OTP attempts.",
//       "OTP_ATTEMPTS_EXCEEDED"
//     );
//   }

//   const expectedHash = hmacFor(
//     otpData.identifier,
//     otp
//   );

//   if (expectedHash !== otpData.hash) {
//     const redis = await RedisClient.connect();

//     otpData.attempts += 1;

//     await redis.set(
//       `otp:${otpData.identifier}`,
//       JSON.stringify(otpData),
//       "KEEPTTL"
//     );

//     throw new BadRequestError(
//       "Invalid OTP.",
//       "OTP_INVALID"
//     );
//   }

//   const redis = await RedisClient.connect();

//   // OTP is correct — remove OTP from Redis
//   await redis.del(
//     `otp:${otpData.identifier}`,
//     `otp:session:${otpSessionId}`
//   );

//   return {
//     verified: true,
//     email: otpData.identifier,
//   };
// }

async function verifyOTP(otp, otpSessionId) {
  const redis = await RedisClient.connect();

  // Get OTP details using session ID
  const otpData = await getOtpDetails(otpSessionId);

  if (!otpData) {
    throw new BadRequestError(
      "OTP is invalid or expired.",
      "OTP_INVALID"
    );
  }

  // Check maximum attempts
  if (otpData.attempts >= 5) {
    await redis.del(
      `otp:session:${otpSessionId}`
    );

    throw new TooManyRequestsError(
      "Too many incorrect OTP attempts. Please request a new OTP.",
      "OTP_ATTEMPTS_EXCEEDED"
    );
  }

  // Generate hash from submitted OTP
  const expectedHash = hmacFor(
    otpData.identifier,
    otp
  );

  // Invalid OTP
  if (expectedHash !== otpData.hash) {
    otpData.attempts += 1;

    // IMPORTANT:
    // Update the SAME key that was originally stored
    await redis.set(
      `otp:session:${otpSessionId}`,
      JSON.stringify(otpData),
      "KEEPTTL"
    );


    // console.log("========== REDIS DEBUG ==========");
    // console.log("REDIS URL:", config.REDIS_URL);
    // console.log("REDIS STATUS:", redis.status);
    // console.log("REDIS DB:", redis.options.db);
    // console.log("OTP KEY:", key);
    // console.log("GET:", await redis.get(key));
    // console.log("TTL:", await redis.ttl(key));
    // console.log("=================================");
    throw new BadRequestError(
      "Invalid OTP.",
      "OTP_INVALID"
    );
  }

  // OTP is correct
  await redis.del(
    `otp:session:${otpSessionId}`
  );
  console.log('otpdata--', otpData);
  const user = await authRepository.createUser({
    // firstName: otpData.firstName,
    // lastName: otpData.lastName,
    email: otpData.identifier,
    passwordHash: otpData.hash,
  });

  return {
    verified: true,
    email: otpData.identifier,
  };
}











// const bcrypt = require("bcryptjs");

// const {
//   BadRequestError,
//   UnauthorizedError,
// } = require("../utils/error");

// const authRepository = require("../repository/authRepository");
// const {
//   generateAccessToken,
//   generateRefreshToken,
// } = require("../utils/token");

// // const login = async (email, password, deviceId, deviceInfo = {}) => {
// //   if (!email || !password) {
// //     throw new BadRequestError(
// //       "Email and password are required.",
// //       "LOGIN_FIELDS_REQUIRED"
// //     );
// //   }

// //   // 1. Find user
// //   const user = await authRepository.findByEmail(email);

// //   if (!user) {
// //     throw new UnauthorizedError(
// //       "Invalid email or password.",
// //       "INVALID_CREDENTIALS"
// //     );
// //   }

// //   // 2. Compare password
// //   const passwordMatched = await bcrypt.compare(
// //     password,
// //     user.passwordHash
// //   );

// //   if (!passwordMatched) {
// //     throw new UnauthorizedError(
// //       "Invalid email or password.",
// //       "INVALID_CREDENTIALS"
// //     );
// //   }

// //   // 3. Device ID
// //   if (!deviceId) {
// //     throw new BadRequestError(
// //       "Device ID is required.",
// //       "DEVICE_ID_REQUIRED"
// //     );
// //   }

// //   // 4. Generate tokens
// //   const accessToken = generateAccessToken(
// //     user,
// //     deviceId
// //   );

// //   const refreshToken = generateRefreshToken(
// //     user,
// //     deviceId
// //   );

// //   // 5. Return authentication information
// //   return {
// //     user,
// //     accessToken,
// //     refreshToken,
// //     deviceId,
// //     deviceInfo,
// //   };
// // };

// const bcrypt = require("bcryptjs");

// const {
//   BadRequestError,
//   UnauthorizedError,
// } = require("../utils/error");

// const authRepository = require("../repository/authRepository");

// const {
//   generateAccessToken,
//   generateRefreshToken,
// } = require("../utils/token");

// const {
//   storeRefreshSession,
// } = require("../utils/refreshTokenStore");

const login = async ({
  email,
  password,
  deviceId,
  userAgent,
  ip,
}) => {
  // -----------------------------
  // Validate input
  // -----------------------------

  if (!email || !password) {
    throw new BadRequestError(
      "Email and password are required.",
      "LOGIN_FIELDS_REQUIRED"
    );
  }

  // -----------------------------
  // Find user
  // -----------------------------

  const user = await authRepository.findByEmail(
    email
  );

  if (!user) {
    throw new UnauthorizedError(
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  // -----------------------------
  // Check password
  // -----------------------------

  const passwordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordValid) {
    throw new UnauthorizedError(
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  // -----------------------------
  // Device ID
  // -----------------------------

  const finalDeviceId =
    deviceId || crypto.randomUUID();

  // -----------------------------
  // Generate access token
  // -----------------------------

  const accessToken =
    generateAccessToken(
      user,
      finalDeviceId
    );

  // -----------------------------
  // Generate refresh token
  // -----------------------------

  const {
    refreshToken,
    jti,
  } = generateRefreshToken(
    user,
    finalDeviceId
  );

  // -----------------------------
  // Store refresh session
  // -----------------------------

  await storeRefreshSession({
    jti,
    userId: user.id,
    deviceId: finalDeviceId,
    userAgent,
    ip,
  });

  return {
    accessToken,
    refreshToken,
    deviceId: finalDeviceId,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  };
};

// module.exports = {
//   login,
// };


module.exports = {
  sendOTP,
  verifyOTP, login
};




// import {
//   findUserByEmail,
//   createUser,
// } from '../repository/authRepository.js';

// import {
//   publishUserEvent,
// } from '../kafka/kafka.producer.js';

// import {
//   KafkaEvents,
// } from '../kafka/kafka.events.js';


// await publishUserEvent({
//   event:
//     KafkaEvents.USER_REGISTERED,

//   organization_id,

//   user_id:
//     user.user_id,

//   data: {
//     name: user.name,

//     email: user.email,
//   },
// });