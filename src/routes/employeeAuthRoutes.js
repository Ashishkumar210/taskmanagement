const express =
  require("express");

const employeeAuthController =
  require("../controllers/employeeAuth.controller");

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