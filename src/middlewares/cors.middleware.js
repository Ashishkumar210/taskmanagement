// const cors = require('cors');
// const { config } = require('../config');

// const corsMiddleware = cors({
//   origin: config.ALLOWED_ORIGINS.split(','),
//   Credential: true,
//   methods: ['GET', 'POST', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-type',
//     'Accept',
//     'Authorization',

//   ],
// })


// const cors = require("cors");
// const { config } = require("../config");

// const corsMiddleware = cors({
//   origin: config.ALLOWED_ORIGINS.split(","),
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Accept",
//     "Authorization",
//   ],
// });

// module.exports = {
//   corsMiddleware,
// };


const cors = require("cors");
const { config } = require("../config");

const allowedOrigins = config.ALLOWED_ORIGINS;

const corsMiddleware = cors({
  origin(origin, callback) {
    // Allow Postman, curl, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
});

module.exports = {
  corsMiddleware,
};