// const { TooManyRequestsError } = require("./error");
// const otpGenerator = require("otp-generator");
// const Redis = require("../config/redis"); // Your Redis client
// const { config } = require("../config");
// const HMAC_SECRETE = config.HMAC_SECRETE


// const crypto = require("crypto");
// const otpGenerator = require("otp-generator");

// const { TooManyRequestsError, BadRequestError } = require("./error");
// // const Redis = require("../config/redis");


// const RedisClient = require("../config/redis");
// const { config } = require("../config");

// const HMAC_SECRET = config.HMAC_SECRET;

// function hmacFor(identifier, otp) {
//   return crypto
//     .createHmac("sha256", HMAC_SECRET)
//     .update(`${identifier}:${otp}`)
//     .digest("hex");
// }

// async function generateAndStoreOtp(meta) {
//   const redis = await RedisClient.connect();

//   const identifier = meta.email || meta.mobile;

//   if (!identifier) {
//     throw new BadRequestError(
//       "Email or mobile is required.",
//       "IDENTIFIER_REQUIRED"
//     );
//   }

//   const rateKey = `otp:rate:${identifier}`;
//   const otpKey = `otp:${identifier}`;

//   // Rate limit
//   const sentCount = Number((await Redis.get(rateKey)) || 0);

//   if (sentCount >= 5) {
//     throw new TooManyRequestsError(
//       "Too many OTP requests. Please try again later.",
//       "OTP_RATE_LIMIT"
//     );
//   }

//   // Generate OTP
//   const otp = otpGenerator.generate(6, {
//     upperCaseAlphabets: false,
//     lowerCaseAlphabets: false,
//     specialChars: false,
//     digits: true,
//   });

//   // Session ID
//   const otpSessionId = crypto.randomUUID();

//   // Hash OTP
//   const otpHash = hmacFor(identifier, otp);

//   // Store only hash
//   await Redis.set(
//     otpKey,
//     JSON.stringify({
//       sessionId: otpSessionId,
//       hash: otpHash,
//       attempts: 0,
//     }),
//     "EX",
//     300
//   );

//   // Increment rate counter
//   const count = await Redis.incr(rateKey);

//   if (count === 1) {
//     await Redis.expire(rateKey, 3600);
//   }

//   return {
//     otp,
//     otpSessionId,
//   };
// }

// module.exports = {
//   generateAndStoreOtp,
// };


const crypto = require("crypto");
const otpGenerator = require("otp-generator");

const { TooManyRequestsError, BadRequestError } = require("./error");
const RedisClient = require("../config/redis");
const { config } = require("../config");

const HMAC_SECRET = config.HMAC_SECRET;
const { redis } = require('../config/redis');

function hmacFor(identifier, otp) {
  return crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${identifier}:${otp}`)
    .digest("hex");
}

async function generateAndStoreOtp(meta) {
  const redis = await RedisClient.connect();

  const identifier = meta.email || meta.mobile;

  if (!identifier) {
    throw new BadRequestError(
      "Email or mobile is required.",
      "IDENTIFIER_REQUIRED"
    );
  }
  const otpSessionId = crypto.randomUUID();

  const rateKey = `otp:rate:${identifier}`;
  // const otpKey = `otp:${identifier}`;
  const otpKey = `otp:session:${otpSessionId}`;

  // Rate limit
  const sentCount = Number((await redis.get(rateKey)) || '0', 10);

  if (sentCount >= 5) {
    throw new TooManyRequestsError(
      "Too many OTP requests. Please try again later.",
      "OTP_RATE_LIMIT"
    );
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });

  // Session ID


  // Hash OTP
  const otpHash = hmacFor(identifier, otp);

  // Store only hash
  // await redis.set(
  //   otpKey,
  //   JSON.stringify({
  //     sessionId: otpSessionId,
  //     hash: otpHash,
  //     attempts: 0,
  //   }),
  //   "EX",
  //   300
  // );

  await redis.set(
    otpKey,
    JSON.stringify({
      sessionId: otpSessionId,
      identifier,
      hash: otpHash,
      attempts: 0,
    }),
    "EX",
    300
  );

  console.log("========== OTP REDIS DEBUG ==========");
  console.log("OTP SESSION ID:", otpSessionId);
  console.log("OTP REDIS KEY:", otpKey);
  console.log("REDIS STATUS:", redis.status);
  console.log("REDIS DB:", redis.options.db);
  console.log("REDIS PING:", await redis.ping());
  console.log("REDIS GET:", await redis.get(otpKey));
  console.log("REDIS TTL:", await redis.ttl(otpKey));
  console.log("======================================");
  const storedData = await redis.get(otpKey);

  console.log("STORED REDIS DATA:", storedData);

  // Increment rate counter
  const count = await redis.incr(rateKey);

  if (count === 1) {
    await redis.expire(rateKey, 3600);
  }
  console.log(otpSessionId);
  return {
    otp,
    otpSessionId,
  };
}


async function verifyOtp(otp, otpSessionId) {

  const rowData = await redis.get(`otp:session:$(otpSessionId)`)
  if (!rowData) return null;


}
module.exports = {
  generateAndStoreOtp,
  verifyOtp,
  hmacFor
};