const express =
  require("express");

const router =
  express.Router();

const RFIDEventController =
  require("../controllers/rfidEventController");


router.post(
  "/events",
  RFIDEventController.createRFIDEvent
);




router.post(
  "/save",
  RFIDEventController.createEmployeeRfidCard
);

module.exports = router;