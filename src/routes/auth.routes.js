// const express = require("express");
// const router = express.Router();

// // const { sendOtp } = require("../controllers/auth.controller");

// const controller = require("../controllers/auth.controller");

// console.log(controller);
// console.log(controller);
// // router.post("/send-otp", sendOtp);

// module.exports = router;



const express = require("express");
const router = express.Router();

const { sendOTP, verifyOTP } = require("../controllers/auth.controller");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;