const express = require("express");

const router = express.Router();

const authRoutes = require("./auth.routes");
const taskRoutes = require("./task.routes");
const empAuthRoutes = require("./employeeAuthRoutes");
const departmentRoutes = require("./department.routes");
const projectRoutes = require("./project.routes");

const workerLogsRoutes = require("./workLog.routes");
const adminEmployeeRoutes = require("./adminEmployeeRoutes");
const overtimeRoutes = require("./overtimeTask.routes");

// constRoutes = require("./module.route");
// modules
const modulesRoutes = require("./module.route");
router.use("/auths", empAuthRoutes);
router.use("/task", taskRoutes);

router.use("/task", empAuthRoutes);
router.use("/department", departmentRoutes);
router.use("/project", projectRoutes);
router.use("/worklog", workerLogsRoutes);

router.use("/adminlog", adminEmployeeRoutes);

router.use("/overtime", overtimeRoutes);
router.use("/modules", modulesRoutes);
module.exports = router;