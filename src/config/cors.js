const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://tasklocal.ashish.cyou"
];

const corsOptions = {
  origin: (origin, callback) => {
    /**
     * Allow requests without Origin
     * such as Postman, curl, server-to-server.
     */
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `CORS policy: Origin ${origin} is not allowed.`
      )
    );
  },

  /**
   * Required when using cookies.
   */
  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],

  exposedHeaders: [],

  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);