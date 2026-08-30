




const jwt = require("jsonwebtoken");
const { config } = require("../config");

const generateAccessToken = (user) => {
  if (!user || !user.id) {
    throw new Error("User information is required");
  }

  const payload = {
    id: user.id,
    email: user.email ?? null,

  };

  return jwt.sign(
    payload,
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
};






const generateAccessToken = (user) => {
  if (!user?.id) {
    throw new Error("User information is required");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,

    },
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
};

// const generateRefreshToken = (user) => {
//   if (!user?.id) {
//     throw new Error("User information is required");
//   }

//   return jwt.sign(
//     {
//       id: user.id,
//       type: "refresh",
//     },
//     config.JWT_REFRESH_SECRET,
//     {
//       expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d",
//     }
//   );
// };



const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { config } = require("../config");

const generateRefreshToken = (user, deviceId) => {
  const jti = crypto.randomUUID();

  const refreshToken = jwt.sign(
    {
      id: user.id,
      deviceId,
      type: "refresh",
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d",
      jwtid: jti,
    }
  );

  return {
    refreshToken,
    jti,
  };
};


const RedisClient = require("../config/redis");

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

const storeRefreshSession = async ({
  jti,
  userId,
  deviceId,
  userAgent,
  ip,
}) => {
  const redis = await RedisClient.connect();

  const key = `auth:refresh:${jti}`;

  await redis.set(
    key,
    JSON.stringify({
      userId,
      deviceId,
      jti,
      userAgent: userAgent || null,
      ip: ip || null,
      createdAt: new Date().toISOString(),
    }),
    "EX",
    REFRESH_TOKEN_TTL
  );

  return true;
};

const verifyAccessToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      config.JWT_ACCESS_SECRET
    );

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return null;
    }

    if (error.name === "JsonWebTokenError") {
      return null;
    }

    return null;
  }
};




const verifyRefreshToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      config.JWT_REFRESH_SECRET
    );

    if (decoded.type !== "refresh") {
      return null;
    }

    if (!decoded.jti) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

const getRefreshSession = async (jti) => {
  if (!jti) {
    return null;
  }

  const redis = await RedisClient.connect();

  const key = `auth:refresh:${jti}`;

  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const deleteRefreshSession = async (jti) => {
  const redis = await RedisClient.connect();

  await redis.del(`auth:refresh:${jti}`);
};


// const verifyRefreshToken = (token) => {
//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       config.JWT_REFRESH_SECRET
//     );

//     // Make sure an access token wasn't accidentally
//     // supplied as a refresh token.
//     if (decoded.type !== "refresh") {
//       return null;
//     }

//     return decoded;
//   } catch (error) {
//     return null;
//   }
// };
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  storeRefreshSession,
  deleteRefreshSession,
  getRefreshSession
};



// const RedisClient = require("../config/redis");

// const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

// const getRefreshKey = (jti) => {
//   return `auth:refresh:${jti}`;
// };

// const storeRefreshSession = async ({
//   jti,
//   userId,
//   deviceId,
//   userAgent,
//   ip,
// }) => {
//   const redis = await RedisClient.connect();

//   const data = {
//     jti,
//     userId,
//     deviceId,
//     userAgent: userAgent || null,
//     ip: ip || null,
//     createdAt: new Date().toISOString(),
//   };

//   await redis.set(
//     getRefreshKey(jti),
//     JSON.stringify(data),
//     "EX",
//     REFRESH_TOKEN_TTL
//   );
// };

// const consumeRefreshSession = async (jti) => {
//   if (!jti) {
//     return null;
//   }

//   const redis = await RedisClient.connect();

//   const data = await redis.getdel(
//     getRefreshKey(jti)
//   );

//   if (!data) {
//     return null;
//   }

//   try {
//     return JSON.parse(data);
//   } catch {
//     return null;
//   }
// };

// const deleteRefreshSession = async (jti) => {
//   const redis = await RedisClient.connect();

//   await redis.del(getRefreshKey(jti));
// };

// module.exports = {
//   storeRefreshSession,
//   consumeRefreshSession,
//   deleteRefreshSession,
// };


// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

// const { config } = require("../config");

// const generateAccessToken = (user, deviceId) => {
//   return jwt.sign(
//     {
//       id: user.id,
//       email: user.email,
//       deviceId,
//       type: "access",
//     },
//     config.JWT_ACCESS_SECRET,
//     {
//       expiresIn: config.JWT_ACCESS_EXPIRES_IN || "15m",
//     }
//   );
// };

// const generateRefreshToken = (user, deviceId) => {
//   const jti = crypto.randomUUID();

//   const refreshToken = jwt.sign(
//     {
//       id: user.id,
//       deviceId,
//       type: "refresh",
//     },
//     config.JWT_REFRESH_SECRET,
//     {
//       expiresIn: config.JWT_REFRESH_EXPIRES_IN || "7d",
//       jwtid: jti,
//     }
//   );

//   return {
//     refreshToken,
//     jti,
//   };
// };

// const verifyAccessToken = (token) => {
//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       config.JWT_ACCESS_SECRET
//     );

//     if (decoded.type !== "access") {
//       return null;
//     }

//     return decoded;
//   } catch {
//     return null;
//   }
// };

// const verifyRefreshToken = (token) => {
//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       config.JWT_REFRESH_SECRET
//     );

//     if (decoded.type !== "refresh") {
//       return null;
//     }

//     if (!decoded.jti) {
//       return null;
//     }

//     return decoded;
//   } catch {
//     return null;
//   }
// };

// module.exports = {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyAccessToken,
//   verifyRefreshToken,
// };