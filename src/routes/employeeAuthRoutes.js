const express =
  require("express");

const employeeAuthController =
  require("../controllers/employeeAuth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router =
  express.Router();

/**
 * Employee Signup
 */
router.post(
  "/signup",
  employeeAuthController.signup
);


/**
 * Employee Sign In
 */
router.post(
  "/signin",
  employeeAuthController.signin
);


router.get(
  "/details",
  authMiddleware,
  employeeAuthController.getUserDetails
);

router.get(
  "/list",
  authMiddleware,
  employeeAuthController.getUserList
);




router.get(
  "/email-update",
  authMiddleware,
  employeeAuthController.updatePasswordByEmail
);
module.exports = router;




// {
//   "fullName": "Aarav Sharma",
//   "email": "aarav@company.com",
//   "employeeId": "EMP-20471",
//   "departmentId": 5,
//   "password": "Password@123",
//   "confirmPassword": "Password@123",
//   "termsAccepted": true
// }




// {
//   "email": "aarav.sharma@northwind.io",
//   "password": "Password@123",
//   "rememberMe": true
// }