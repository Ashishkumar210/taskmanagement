const express =
  require("express");

const multer =
  require("multer");

const TaskController =
  require("../controllers/task.controller");

const router =
  express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * Temporary local storage.
 *
 * For production, preferably use
 * multer memoryStorage() and upload
 * directly to S3/R2.
 */
const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter:
      (req, file, cb) => {
        const allowedTypes = [
          "application/pdf",

          "application/msword",

          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

          "application/vnd.ms-excel",

          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "text/plain",

          "image/jpeg",

          "image/png",

          "image/webp",
        ];

        if (
          !allowedTypes.includes(
            file.mimetype
          )
        ) {
          return cb(
            new Error(
              "Unsupported file type."
            )
          );
        }

        cb(null, true);
      },
  });

/**
 * Create task
 *
 * File is OPTIONAL.
 */
router.post(
  "/save",
  authMiddleware,
  upload.single("file"),
  TaskController.createTask
);



/**
 * Get task list
 */
router.get(
  "/",
  authMiddleware,
  TaskController.getTaskList
);

module.exports = router;