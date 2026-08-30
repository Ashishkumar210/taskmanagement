




const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const { config } = require("./config");
const logger = require("./config/logger");

const { corsMiddleware } = require("./middlewares/cors.middleware");
const errorHandler = require("./middlewares/error.middleware");
const { reqLogger } = require("./middlewares/req.middleware");
const authRoutes = require('./routes/auth.routes')
const allRoutes = require("./routes");
const app = express();
console.log("Step 2");
// Security
app.use(helmet());

// Middleware
app.use(corsMiddleware);
app.use(reqLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", allRoutes);


// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: config.SERVICE_NAME,
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// Default Route
app.get("/", (req, res) => {
  res.send(`Hello from ${config.SERVICE_NAME}`);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  console.log("3. Inside startServer");

  try {
    console.log("4. Before app.listen");

    const server = app.listen(config.PORT, () => {
      console.log("5. Server listening");
      logger.info(
        `${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`
      );
    });

    console.log("6. After app.listen");
  } catch (err) {
    console.error(err);
  }
};

startServer();

console.log("7. End of file");

// startServer();