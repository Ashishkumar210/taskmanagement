const RFIDEventService =
  require("../service/rfidEventService");
const asyncHandler = require("../utils/asyncHandler");

const {
  BadRequestError,
} = require("../utils/error");

exports.createRFIDEvent =
  asyncHandler(async (req, res) => {

    const {
      event_id,
      device_id,
      uid,
      event_type,
    } = req.body;


    /**
     * Event ID
     */
    if (
      !event_id ||
      typeof event_id !== "string" ||
      !event_id.trim()
    ) {

      throw new BadRequestError(
        "Event ID is required."
      );
    }


    /**
     * Device ID
     */
    if (
      !device_id ||
      typeof device_id !== "string" ||
      !device_id.trim()
    ) {

      throw new BadRequestError(
        "Device ID is required."
      );
    }


    /**
     * UID
     */
    if (
      !uid ||
      typeof uid !== "string" ||
      !uid.trim()
    ) {

      throw new BadRequestError(
        "RFID UID is required."
      );
    }


    const result =
      await RFIDEventService.createRFIDEvent({

        event_id,

        device_id,

        uid,

        event_type,
      });


    return res.status(
      result.duplicate
        ? 200
        : 201
    ).json({

      success: true,

      message:
        result.duplicate
          ? "RFID event already processed."
          : "RFID attendance recorded successfully.",

      data: result,
    });
  });






exports.createEmployeeRfidCard =
  asyncHandler(
    async (req, res) => {

      const {
        employee_id,
        uid,
        card_name,
      } = req.body;

      const result =
        await RFIDEventService
          .createEmployeeRfidCard({
            employee_id,
            uid,
            card_name,
          });

      return res.status(201).json({
        success: true,
        message:
          "RFID card assigned to employee successfully.",
        data: result,
      });
    }
  );







