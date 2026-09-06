const express =
  require("express");



const adminEmployeeController =
  require("../controllers/adminEmployee.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router =
  express.Router();

/**
 * Temporary local storage.
 *
 * Replace with S3/object storage
 * in production.
 */


/**
 * Submit daily work log
 */
router.get(
  "/",

  authMiddleware,

  adminEmployeeController.getEmployeeTasks
);





router.get(
  "/task-list",
  authMiddleware,
  adminEmployeeController.getMyTasks
);


router.get(
  "/module-dashboard",
  authMiddleware,
  adminEmployeeController.getModuleDashboard
);



router.get(
  "/worklog-dashboard",
  authMiddleware,
  adminEmployeeController.getWorklogDashboard
);
module.exports = router;