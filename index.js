// const express = require("express");

// const helmet = require("helmet");
// const cookieParser = require('cookie-parser');
// const { config } = require('./config');
// const logger = require('./config/logger');

// const { corsMiddleware } = require('./middlewaares/cors.middleware');
// const errorHandler = require('./middlewares/error.middleware');
// const { reqLogger } = require('middlewares/req.middleware');

// // const compression = require("compression");
// // const morgan = require("morgan");
// // const dotenv = require("dotenv");
// // const cors = require("cors");

// // dotenv.config();

// const app = express();

// // Middleware

// app.use(helmet());
// app.use(corsMiddleware);
// app.use(reqLogger);
// app.use(cookieParser);
// app.use(express.json);

// // app.use(cors());

// // app.use(compression());
// // app.use(morgan("dev"));

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // Health Check
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     service: 'user-service',
//     status: 'UP',
//     timestamp: new Date().toISOString(),
//   });
// });

// // Default Route
// app.get('/', (req, res) => {
//   res.send('Hello from index.js of user-services')
// });


// app.use(errorHandler);
// const startServer = async () => {
//   try {

//     const server = app.listen(config.PORT, () => {
//       logger.info(`${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`);
//     })

//   } catch (error) {
//     logger.error('failed to start server', error);
//     process.exist(1);
//   }
// }
// startServer();


// // // 404 Handler
// // app.use((req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: 'Route not found',
// //   });
// // });

// // // Global Error Handler
// // app.use((err, req, res, next) => {
// //   console.error(err);

// //   res.status(err.status || 500).json({
// //     success: false,
// //     message: err.message || 'Internal Server Error',
// //   });
// // });

// // const PORT = process.env.PORT || 5005;

// // app.listen(PORT, () => {
// //   console.log(`🚀 WhatsApp Service running on port ${PORT}`);
// // });




// const express = require("express");
// const helmet = require("helmet");
// const cookieParser = require("cookie-parser");

// const { config } = require("./src/config");
// const logger = require("./src/config/logger");

// const { corsMiddleware } = require("./src/middlewares/cors.middleware");
// const errorHandler = require("./src/middlewares/error.middleware");
// const { reqLogger } = require("./src/middlewares/req.middleware");
// const authRoutes = require('./src/routes/auth.routes')
// const app = express();

// // Security
// app.use(helmet());

// // Middleware
// app.use(corsMiddleware);
// app.use(reqLogger);
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use('api/v1/auth', authRoutes)

// // Health Check
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     service: config.SERVICE_NAME,
//     status: "UP",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Default Route
// app.get("/", (req, res) => {
//   res.send(`Hello from ${config.SERVICE_NAME}`);
// });

// // 404 Handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// // Global Error Handler
// app.use(errorHandler);

// const startServer = async () => {
//   try {
//     const server = app.listen(config.PORT, () => {
//       logger.info(
//         `${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`
//       );
//     });

//     process.on("SIGINT", () => {
//       logger.info("Shutting down server...");
//       server.close(() => process.exit(0));
//     });

//     process.on("SIGTERM", () => {
//       logger.info("Shutting down server...");
//       server.close(() => process.exit(0));
//     });
//   } catch (error) {
//     logger.error("Failed to start server", error);
//     process.exit(1);
//   }
// };

// startServer();