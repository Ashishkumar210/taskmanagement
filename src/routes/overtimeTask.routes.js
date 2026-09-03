

// Use your existing authentication middleware




const express = require("express");
const router = express.Router();

const { create, getOvertimeTaskList } = require("../controllers/overtimeTask.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/save",
  authMiddleware,
  create);
// router.post("/verify-otp", verifyOTP);


// router.get("/list",
//   authMiddleware,
//   list);


router.get("/overtime-list",
  authMiddleware,
  getOvertimeTaskList);
module.exports = router;