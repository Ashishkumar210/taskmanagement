const prisma = require("../config/prisma");

const RFIDEventRepo =
  require("../repository/rfidEventRepository");
const {
  BadRequestError,
} = require("../utils/error");
// const {
//   getIndiaDayRange,
// } = require("../utils/attendanceDate");

// exports.createRFIDEvent = async ({
//   event_id,
//   device_id,
//   uid,
//   event_type,
// }) => {

//   const eventId =
//     event_id.trim();

//   const deviceId =
//     device_id.trim();

//   const normalizedUid =
//     uid
//       .trim()
//       .toUpperCase();

//   const eventType =
//     event_type?.trim() ||
//     "RFID_SCAN";


//   /**
//    * Validate RFID UID.
//    */
//   const uidRegex =
//     /^([0-9A-F]{2}:)*[0-9A-F]{2}$/i;


//   if (
//     !uidRegex.test(
//       normalizedUid
//     )
//   ) {

//     throw new BadRequestError(
//       "Invalid RFID UID."
//     );
//   }


//   /**
//    * Check duplicate.
//    */
//   const existingEvent =
//     await RFIDEventRepo.findByEventId(
//       eventId
//     );


//   if (existingEvent) {

//     const employee =
//       await RFIDEventRepo.findEmployeeByRFID(
//         existingEvent.uid
//       );


//     const {
//       date,
//     } = getIndiaDayRange();


//     return {

//       duplicate: true,

//       employee: employee
//         ? {
//           id:
//             employee.id,

//           name:
//             [
//               employee.firstName,
//               employee.lastName,
//             ]
//               .filter(Boolean)
//               .join(" "),

//           employee_code:
//             employee.employeeCode,
//         }
//         : null,

//       event: {

//         event_id:
//           existingEvent.eventId,

//         direction:
//           existingEvent.direction,

//         scanned_at:
//           existingEvent.scannedAt,
//       },

//       message:
//         "This event was already processed.",
//     };
//   }


//   /**
//    * Find employee.
//    */
//   const employee =
//     await RFIDEventRepo.findEmployeeByRFID(
//       normalizedUid
//     );


//   if (!employee) {

//     throw new NotFoundError(
//       "RFID card is not registered with any employee."
//     );
//   }


//   /**
//    * Transaction.
//    */
//   const result =
//     await prisma.$transaction(
//       async (tx) => {

//         /**
//          * IMPORTANT:
//          *
//          * Lock this employee during
//          * attendance processing.
//          *
//          * This prevents two scans
//          * arriving at exactly the
//          * same time from both
//          * becoming IN.
//          */
//         await tx.$queryRaw`
//           SELECT pg_advisory_xact_lock(
//             ${employee.id}
//           )
//         `;


//         /**
//          * Get today's last scan.
//          */
//         const lastEvent =
//           await RFIDEventRepo
//             .findLastTodayEvent(
//               employee.id,
//               tx
//             );


//         /**
//          * Determine direction.
//          */
//         const direction =
//           !lastEvent ||
//             lastEvent.direction === "OUT"
//             ? "IN"
//             : "OUT";


//         const scannedAt =
//           new Date();


//         /**
//          * Create event.
//          */
//         const event =
//           await RFIDEventRepo.createRFIDEvent(

//             {
//               eventId,

//               employeeId:
//                 employee.id,

//               deviceId,

//               uid:
//                 normalizedUid,

//               eventType,

//               direction,

//               scannedAt,
//             },

//             tx
//           );


//         /**
//          * Update daily summary.
//          */
//         const daily =
//           await RFIDEventRepo
//             .updateDailyAttendance(

//               {
//                 employeeId:
//                   employee.id,

//                 direction,

//                 scannedAt,
//               },

//               tx
//             );


//         return {
//           event,
//           daily,
//         };
//       }
//     );


//   /**
//    * Calculate status.
//    */
//   const status =
//     result.daily.inCount >
//       result.daily.outCount
//       ? "INSIDE"
//       : "OUTSIDE";


//   const employeeName =
//     [
//       employee.firstName,
//       employee.lastName,
//     ]
//       .filter(Boolean)
//       .join(" ");


//   return {

//     duplicate: false,

//     employee: {

//       id:
//         employee.id,

//       name:
//         employeeName,

//       employee_code:
//         employee.employeeCode,
//     },

//     event: {

//       event_id:
//         result.event.eventId,

//       uid:
//         result.event.uid,

//       direction:
//         result.event.direction,

//       scanned_at:
//         result.event.scannedAt,
//     },

//     attendance: {

//       date:
//         result.daily.attendanceDate,

//       in_count:
//         result.daily.inCount,

//       out_count:
//         result.daily.outCount,

//       status,

//       first_in_at:
//         result.daily.firstInAt,

//       last_out_at:
//         result.daily.lastOutAt,
//     },
//   };
// };







/**
 * Get India day range.
 *
 * Used for duplicate / daily attendance
 * calculations when needed outside SQL.
 */
// const getIndiaDayRanges = () => {
//   const now =
//     new Date();

//   const indiaDate =
//     new Intl.DateTimeFormat(
//       "en-CA",
//       {
//         timeZone:
//           "Asia/Kolkata",
//       }
//     ).format(now);

//   const start =
//     new Date(
//       `${indiaDate}T00:00:00+05:30`
//     );

//   const end =
//     new Date(
//       `${indiaDate}T23:59:59.999+05:30`
//     );

//   return {
//     start,
//     end,
//     date: indiaDate,
//   };
// };


/**
 * Create employee RFID card.
 */
exports.createEmployeeRfidCard =
  async ({
    employee_id,
    uid,
    card_name,
  }) => {

    if (!employee_id) {
      throw new BadRequestError(
        "Employee ID is required."
      );
    }

    if (!uid) {
      throw new BadRequestError(
        "RFID UID is required."
      );
    }

    const normalizedUid =
      uid
        .trim()
        .toUpperCase();

    /**
     * Validate UID.
     */
    const uidRegex =
      /^([0-9A-F]{2}:)*[0-9A-F]{2}$/i;

    if (
      !uidRegex.test(
        normalizedUid
      )
    ) {
      throw new BadRequestError(
        "Invalid RFID UID."
      );
    }

    /**
     * Check employee.
     */
    const employee =
      await RFIDEventRepo.findEmployeeById({
        employee_id,
      });

    if (!employee) {
      throw new NotFoundError(
        "Employee not found."
      );
    }

    /**
     * Check whether card already exists.
     */
    const existingCard =
      await RFIDEventRepo.findCardByUid({
        uid: normalizedUid,
      });

    if (existingCard) {
      throw new ConflictError(
        "This RFID card is already registered."
      );
    }

    /**
     * Check whether employee already
     * has an RFID card.
     */
    const employeeCard =
      await RFIDEventRepo.findCardByEmployeeId({
        employee_id,
      });

    if (employeeCard) {
      throw new ConflictError(
        "This employee already has an RFID card."
      );
    }

    /**
     * Create card.
     */
    return RFIDEventRepo.createCard({
      employee_id,
      uid: normalizedUid,
      card_name,
    });
  };


/**
 * Create RFID event.
 */
exports.createRFIDEvent =
  async ({
    event_id,
    device_id,
    uid,
    event_type,
  }) => {

    /**
     * Basic validation.
     */
    if (!event_id) {
      throw new BadRequestError(
        "Event ID is required."
      );
    }

    if (!device_id) {
      throw new BadRequestError(
        "Device ID is required."
      );
    }

    if (!uid) {
      throw new BadRequestError(
        "RFID UID is required."
      );
    }

    const eventId =
      event_id
        .trim();

    const deviceId =
      device_id
        .trim();

    const normalizedUid =
      uid
        .trim()
        .toUpperCase();

    const eventType =
      event_type?.trim() ||
      "RFID_SCAN";


    /**
     * Validate RFID UID.
     */
    const uidRegex =
      /^([0-9A-F]{2}:)*[0-9A-F]{2}$/i;

    if (
      !uidRegex.test(
        normalizedUid
      )
    ) {
      throw new BadRequestError(
        "Invalid RFID UID."
      );
    }


    /**
     * Check duplicate event.
     */
    const existingEvent =
      await RFIDEventRepo.findByEventId(
        eventId
      );

    if (existingEvent) {

      const employee =
        await RFIDEventRepo.findEmployeeByRFID(
          existingEvent.uid
        );

      return {
        duplicate: true,

        employee: employee
          ? {
            id:
              employee.id,

            name:
              [
                employee.firstName,
                employee.lastName,
              ]
                .filter(Boolean)
                .join(" "),

            employee_code:
              employee.employeeCode,
          }
          : null,

        event: {
          event_id:
            existingEvent.eventId,

          direction:
            existingEvent.direction,

          scanned_at:
            existingEvent.scannedAt,
        },

        message:
          "This event was already processed.",
      };
    }


    /**
     * Find employee by RFID.
     */
    const employee =
      await RFIDEventRepo.findEmployeeByRFID(
        normalizedUid
      );

    if (!employee) {
      throw new NotFoundError(
        "RFID card is not registered with any employee."
      );
    }


    /**
     * Transaction.
     *
     * Advisory lock ensures that
     * simultaneous RFID scans for the
     * same employee are processed
     * sequentially.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {

          /**
           * IMPORTANT:
           *
           * pg_advisory_xact_lock returns
           * PostgreSQL VOID.
           *
           * Therefore use $executeRaw,
           * NOT $queryRaw.
           */
          await tx.$executeRaw`
            SELECT pg_advisory_xact_lock(
              ${employee.id}
            )
          `;


          /**
           * Check duplicate again
           * inside the transaction.
           *
           * This is important because two
           * requests could arrive together.
           */
          const duplicateEvent =
            await RFIDEventRepo.findByEventId(
              eventId,
              tx
            );

          if (duplicateEvent) {
            return {
              duplicate: true,
              event:
                duplicateEvent,
            };
          }


          /**
           * Get today's last event.
           */
          const lastEvent =
            await RFIDEventRepo.findLastTodayEvent(
              employee.id,
              tx
            );


          /**
           * Determine direction.
           *
           * No previous event -> IN
           *
           * Previous OUT -> IN
           *
           * Previous IN -> OUT
           */
          const direction =
            !lastEvent ||
              lastEvent.direction === "OUT"
              ? "IN"
              : "OUT";


          const scannedAt =
            new Date();


          /**
           * Create event.
           */
          const event =
            await RFIDEventRepo.createRFIDEvent(
              {
                eventId,

                employeeId:
                  employee.id,

                deviceId,

                uid:
                  normalizedUid,

                eventType,

                direction,

                scannedAt,
              },

              tx
            );


          /**
           * Update daily attendance.
           */
          const daily =
            await RFIDEventRepo.updateDailyAttendance(
              {
                employeeId:
                  employee.id,

                direction,

                scannedAt,
              },

              tx
            );


          return {
            duplicate: false,

            event,

            daily,
          };
        }
      );


    /**
     * If another request inserted
     * this event while we were processing,
     * return duplicate response.
     */
    if (result.duplicate) {

      const duplicateEmployee =
        await RFIDEventRepo.findEmployeeByRFID(
          result.event.uid
        );

      return {
        duplicate: true,

        employee: duplicateEmployee
          ? {
            id:
              duplicateEmployee.id,

            name:
              [
                duplicateEmployee.firstName,
                duplicateEmployee.lastName,
              ]
                .filter(Boolean)
                .join(" "),

            employee_code:
              duplicateEmployee.employeeCode,
          }
          : null,

        event: {
          event_id:
            result.event.eventId,

          direction:
            result.event.direction,

          scanned_at:
            result.event.scannedAt,
        },

        message:
          "This event was already processed.",
      };
    }


    /**
     * Calculate current employee status.
     */
    const status =
      result.daily.inCount >
        result.daily.outCount
        ? "INSIDE"
        : "OUTSIDE";


    const employeeName =
      [
        employee.firstName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(" ");


    return {
      duplicate: false,

      employee: {
        id:
          employee.id,

        name:
          employeeName,

        employee_code:
          employee.employeeCode,
      },

      event: {
        event_id:
          result.event.eventId,

        uid:
          result.event.uid,

        direction:
          result.event.direction,

        scanned_at:
          result.event.scannedAt,
      },

      attendance: {
        date:
          result.daily.attendanceDate,

        in_count:
          result.daily.inCount,

        out_count:
          result.daily.outCount,

        status,

        first_in_at:
          result.daily.firstInAt,

        last_out_at:
          result.daily.lastOutAt,
      },
    };
  };


exports.createEmployeeRfidCard = async ({
  employee_id,
  uid,
  card_name,
}) => {

  // -----------------------------------------
  // Validate employee ID
  // -----------------------------------------

  const employeeId = Number(employee_id);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new BadRequestError(
      "Invalid employee ID."
    );
  }

  // -----------------------------------------
  // Validate UID
  // -----------------------------------------

  if (
    !uid ||
    typeof uid !== "string"
  ) {
    throw new BadRequestError(
      "RFID UID is required."
    );
  }

  const normalizedUid = uid
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalizedUid) {
    throw new BadRequestError(
      "RFID UID is required."
    );
  }

  if (normalizedUid.length > 100) {
    throw new BadRequestError(
      "RFID UID cannot exceed 100 characters."
    );
  }

  // -----------------------------------------
  // Validate card name
  // -----------------------------------------

  const normalizedCardName =
    typeof card_name === "string"
      ? card_name.trim()
      : null;

  if (
    normalizedCardName &&
    normalizedCardName.length > 255
  ) {
    throw new BadRequestError(
      "Card name cannot exceed 255 characters."
    );
  }

  // -----------------------------------------
  // Check employee
  // -----------------------------------------

  const employee =
    await RFIDEventRepo.findEmployeeById({
      employee_id: employeeId,
    });

  if (!employee) {
    throw new NotFoundError(
      "Employee not found."
    );
  }

  // -----------------------------------------
  // Check whether UID already exists
  // -----------------------------------------

  const existingCard =
    await RFIDEventRepo.findCardByUid({
      uid: normalizedUid,
    });

  if (existingCard) {

    throw new ConflictError(
      "This RFID card is already assigned to an employee."
    );
  }

  // -----------------------------------------
  // Check whether employee already has a card
  // -----------------------------------------

  const employeeCard =
    await RFIDEventRepo.findCardByEmployeeId({
      employee_id: employeeId,
    });

  if (employeeCard) {
    throw new ConflictError(
      "This employee already has an RFID card assigned."
    );
  }

  // -----------------------------------------
  // Create card
  // -----------------------------------------

  const card =
    await RFIDEventRepo.createCard({
      employee_id: employeeId,
      uid: normalizedUid,
      card_name: normalizedCardName,
    });

  return card;
};