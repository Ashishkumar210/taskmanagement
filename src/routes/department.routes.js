const express =
  require("express");

const DepartmentController =
  require("../controllers/department.controller");

const router =
  express.Router();

/**
 * Department list
 */
router.get(
  "/",
  DepartmentController.getDepartmentList
);

module.exports = router;