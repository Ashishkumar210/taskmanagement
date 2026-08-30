const express = require("express");

const ProjectController =
  require("../controllers/project.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router =
  express.Router();

/**
 * Project list
 */
router.get(
  "/",
  authMiddleware,
  ProjectController.getProjectList
);


/**
 * Create project
 */
router.post(
  "/save",
  ProjectController.createProject
);

module.exports = router;