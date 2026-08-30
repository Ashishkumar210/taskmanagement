const express = require("express");

const ProjectController =
  require("../controllers/project.controller");

const router =
  express.Router();

/**
 * Project list
 */
router.get(
  "/",
  ProjectController.getProjectList
);

module.exports = router;