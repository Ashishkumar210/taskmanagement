const express =
  require("express");

const multer =
  require("multer");

const WorkLogController =
  require("../controllers/workLog.controller");

const router =
  express.Router();

/**
 * Temporary local storage.
 *
 * Replace with S3/object storage
 * in production.
 */
const upload =
  multer({
    dest: "uploads/work-logs/",
  });

/**
 * Submit daily work log
 */
router.post(
  "/",
  upload.single("file"),
  WorkLogController.createWorkLog
);

module.exports = router;