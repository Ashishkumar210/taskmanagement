// const Redis = require("ioredis");

// const { config } = require(".");
// const logger = require("./logger");

// class RedisClient {
//   static instance = null;
//   static isConnected = false;
//   constructor() {
//     //prevent direct instatiation
//   }
//   // static getInstance() {
//   //   if (!RedisClient.instance) {
//   //     RedisClient.instance = new Redis({
//   //       host: config.redis.host,
//   //       port: config.redis.port,
//   //       password: config.redis.password || undefined,
//   //       db: config.redis.db || 0,
//   //       maxRetriesPerRequest: null,
//   //       enableReadyCheck: true,
//   //       retryStrategy(times) {
//   //         return Math.min(times * 100, 5000);
//   //       },
//   //     });

//   //     RedisClient.setupEventListeners();
//   //   }

//   static getInstance() {
//     if (!RedisClient.instance) {
//       RedisClient.instance = new Redis(config.REDIS_URL, {

//         retryStrategy(times) {
//           return Math.min(times * 100, 5000);
//         },
//         maxRetriesPerRequest:3
//       });

//       RedisClient.setupEventListeners();
//       return RedisClient.instance;
//     }

//     return RedisClient.instance;
//   }

//   static setupEventListeners() {
//     RedisClient.instance.on("connect", () => {
//       logger.info("Redis connecting...");
//     });

//     RedisClient.instance.on("ready", () => {
//       RedisClient.isConnected = true;
//       logger.info("Redis connected successfully");
//     });

//     RedisClient.instance.on("error", (err) => {
//       RedisClient.isConnected = false;
//       logger.error("Redis Error:", err);
//     });

//     RedisClient.instance.on("close", () => {
//       RedisClient.isConnected = false;
//       logger.warn("Redis connection closed");
//     });

//     RedisClient.instance.on("reconnecting", () => {
//       logger.warn("Redis reconnecting...");
//     });

//     RedisClient.instance.on("end", () => {
//       RedisClient.isConnected = false;
//       logger.warn("Redis connection ended");
//     });
//   }

//   static async disconnect() {
//     if (RedisClient.instance) {
//       await RedisClient.instance.quit();
//       RedisClient.instance = null;
//       RedisClient.isConnected = false;
//       logger.info("Redis disconnected");
//     }
//   }
// }

// module.exports = RedisClient;




// const Redis = require("ioredis");

// const { config } = require("./index");
// const logger = require("./logger");

// class RedisClient {
//   static instance = null;
//   static isConnected = false;

//   constructor() {
//     throw new Error("Use RedisClient.getInstance() instead of new RedisClient()");
//   }

//   static getInstance() {
//     if (!RedisClient.instance) {
//       if (!config.REDIS_URL) {
//         throw new Error("REDIS_URL is not configured");
//       }

//       RedisClient.instance = new Redis(config.REDIS_URL, {
//         lazyConnect: true,
//         maxRetriesPerRequest: 3,
//         enableReadyCheck: true,
//         retryStrategy(times) {
//           return Math.min(times * 100, 5000);
//         },
//       });

//       RedisClient.setupEventListeners();
//     }

//     return RedisClient.instance;
//   }

//   static async connect() {
//     const redis = RedisClient.getInstance();

//     if (!RedisClient.isConnected) {
//       await redis.connect();
//     }
// redis.on("ready", () => console.log("✅ Redis connected"));
// redis.on("error", (err) => console.error("Redis error:", err));
//     return redis;
//   }

//   static setupEventListeners() {
//     const redis = RedisClient.instance;

//     redis.on("connect", () => {
//       logger.info("Redis connecting...");
//     });

//     redis.on("ready", () => {
//       RedisClient.isConnected = true;
//       logger.info("Redis connected successfully.");
//     });

//     redis.on("error", (err) => {
//       RedisClient.isConnected = false;
//       logger.error(`Redis error: ${err.message}`);
//     });

//     redis.on("close", () => {
//       RedisClient.isConnected = false;
//       logger.warn("Redis connection closed.");
//     });

//     redis.on("reconnecting", () => {
//       logger.warn("Redis reconnecting...");
//     });

//     redis.on("end", () => {
//       RedisClient.isConnected = false;
//       logger.warn("Redis connection ended.");
//     });
//   }

//   static async disconnect() {
//     if (RedisClient.instance) {
//       await RedisClient.instance.quit();
//       RedisClient.instance = null;
//       RedisClient.isConnected = false;
//       logger.info("Redis disconnected.");
//     }
//   }
// }

// module.exports = RedisClient;




const Redis = require("ioredis");
const { config } = require("./index");
const logger = require("./logger");

class RedisClient {
  static instance = null;
  static isConnected = false;

  constructor() {
    throw new Error("Use RedisClient.getInstance()");
  }

  static getInstance() {
    if (!RedisClient.instance) {
      if (!config.REDIS_URL) {
        throw new Error("REDIS_URL is not configured");
      }

      RedisClient.instance = new Redis(config.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          return Math.min(times * 100, 5000);
        },
      });

      RedisClient.setupEventListeners();
    }

    return RedisClient.instance;
  }

  static async connect() {
    const redis = RedisClient.getInstance();

    if (redis.status === "wait") {
      await redis.connect();
    }

    return redis;
  }

  static setupEventListeners() {
    const redis = RedisClient.instance;

    redis.on("connect", () => {
      logger.info("Redis connecting...");
    });

    redis.on("ready", () => {
      RedisClient.isConnected = true;
      logger.info("Redis connected successfully.");
    });

    redis.on("error", (err) => {
      RedisClient.isConnected = false;
      logger.error(`Redis error: ${err.message}`);
    });

    redis.on("close", () => {
      RedisClient.isConnected = false;
      logger.warn("Redis connection closed.");
    });

    redis.on("reconnecting", () => {
      logger.warn("Redis reconnecting...");
    });

    redis.on("end", () => {
      RedisClient.isConnected = false;
      logger.warn("Redis connection ended.");
    });
  }

  static async disconnect() {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      RedisClient.isConnected = false;
      logger.info("Redis disconnected.");
    }
  }
}

module.exports = RedisClient;