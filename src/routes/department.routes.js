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


router.post(
  "/save",
  DepartmentController.createDepartment
);
module.exports = router;