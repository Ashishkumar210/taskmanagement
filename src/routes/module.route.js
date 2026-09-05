



// const ModuleController =
//   require("../controllers/module.controller");
// const authMiddleware = require("../middlewares/auth.middleware");

// const express = require("express");
// const router = express.Router();

// router.post(
//   "/save",
//   authMiddleware,
//   ModuleController.createModule
// );

// // router.get(
// //   "/modules",
// //   authMiddleware,
// //   ModuleController.getModuleList
// // );

// // router.get(
// //   "/modules/:module_id",
// //   authMiddleware,
// //   ModuleController.getModuleById
// // );

// router.patch(
//   "/modules/:module_id/my-status",
//   authMiddleware,
//   ModuleController.updateMyModuleStatus
// );

// router.get(
//   "/modules/:module_id/activity",
//   authMiddleware,
//   ModuleController.getModuleActivity
// );


const ModuleController = require("../controllers/module.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const express = require("express");
const router = express.Router();

router.post(
  "/save",
  authMiddleware,
  ModuleController.createModule
);




router.get(
  "/list",
  authMiddleware,
  ModuleController.getModuleList
);

router.get(
  "/details/:id",
  authMiddleware,
  ModuleController.getModuleDetails
);



router.post(
  "/work-log-save",
  authMiddleware,
  ModuleController.addWorkLog
);


/**
 * Status
 */
router.patch(
  "/:id/status",
  authMiddleware,
  ModuleController.updateModuleStatus
);



/**
 * Employee assignment
 */
router.post(
  "/:id/assign",
  authMiddleware,
  ModuleController.assignEmployee
);


router.get(
  "/activity-logs",
  authMiddleware,
  ModuleController.getActivityLogs
);


router.get(
  "/module-activity-logs",
  authMiddleware,
  ModuleController.getModuleStatusLogs
);
// router.patch(
//   "/modules/:module_id/my-status",
//   authMiddleware,
//   ModuleController.updateMyModuleStatus
// );

// router.get(
//   "/modules/:module_id/activity",
//   authMiddleware,
//   ModuleController.getModuleActivity
// );

module.exports = router;
