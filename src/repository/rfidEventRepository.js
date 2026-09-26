
const prisma = require("../config/prisma");

const {
  getIndiaDayRange,
} = require("../utils/attendanceDate");

exports.findEmployeeByRFID = async (
  uid
) => {

  const card =
    await prisma.employeeRfidCard.findFirst({

      where: {

        uid,

        isActive: true,

        employee: {

          deletedAt: null,
        },
      },

      select: {

        employee: {

          select: {

            id: true,

            firstName: true,

            lastName: true,

            employeeCode: true,

          },
        },
      },
    });


  if (!card) {
    return null;
  }


  return card.employee;
};



exports.findByEventId = async (
  eventId
) => {

  return prisma.rfidEvent.findUnique({

    where: {
      eventId,
    },

    select: {

      id: true,

      eventId: true,

      employeeId: true,

      deviceId: true,

      uid: true,

      eventType: true,

      direction: true,

      scannedAt: true,
    },
  });
};



exports.findLastTodayEvent = async (
  employeeId,
  tx
) => {

  const db =
    tx || prisma;


  const {
    start,
    end,
  } = getIndiaDayRange();


  return db.rfidEvent.findFirst({

    where: {

      employeeId,

      scannedAt: {

        gte: start,

        lte: end,
      },
    },

    orderBy: {

      scannedAt: "desc",
    },

    select: {

      id: true,

      direction: true,

      scannedAt: true,
    },
  });
};


exports.createRFIDEvent = async (
  data,
  tx
) => {

  const db =
    tx || prisma;


  return db.rfidEvent.create({

    data: {

      eventId:
        data.eventId,

      employeeId:
        data.employeeId,

      deviceId:
        data.deviceId,

      uid:
        data.uid,

      eventType:
        data.eventType,

      direction:
        data.direction,

      scannedAt:
        data.scannedAt,
    },
  });
};


exports.updateDailyAttendance = async (
  {
    employeeId,
    direction,
    scannedAt,
  },
  tx
) => {

  const db =
    tx || prisma;


  const attendanceDate =
    getIndiaDateObject();


  const existing =
    await db.employeeAttendanceDaily.findUnique({

      where: {

        employeeId_attendanceDate: {

          employeeId,

          attendanceDate,
        },
      },
    });


  /**
   * First scan today.
   */
  if (!existing) {

    return db.employeeAttendanceDaily.create({

      data: {

        employeeId,

        attendanceDate,

        inCount:
          direction === "IN"
            ? 1
            : 0,

        outCount:
          direction === "OUT"
            ? 1
            : 0,

        firstInAt:
          direction === "IN"
            ? scannedAt
            : null,

        lastOutAt:
          direction === "OUT"
            ? scannedAt
            : null,
      },
    });
  }


  /**
   * Existing attendance.
   */
  return db.employeeAttendanceDaily.update({

    where: {

      id:
        existing.id,
    },

    data: {

      ...(direction === "IN"
        ? {
          inCount: {
            increment: 1,
          },
        }
        : {
          outCount: {
            increment: 1,
          },
        }),

      ...(direction === "IN"
        ? {
          firstInAt:
            existing.firstInAt ||
            scannedAt,
        }
        : {}),

      ...(direction === "OUT"
        ? {
          lastOutAt:
            scannedAt,
        }
        : {}),

      updatedAt:
        new Date(),
    },
  });
};






















// const prisma = require("../config/prisma");

exports.findEmployeeById = async ({
  employee_id,
}) => {
  return prisma.user.findFirst({
    where: {
      id: employee_id,
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
      email: true,
    },
  });
};

exports.findCardByUid = async ({
  uid,
}) => {
  return prisma.employeeRfidCard.findUnique({
    where: {
      uid,
    },
  });
};

exports.findCardByEmployeeId = async ({
  employee_id,
}) => {
  return prisma.employeeRfidCard.findFirst({
    where: {
      employeeId: employee_id,
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
    },
  });
};

exports.createCard = async ({
  employee_id,
  uid,
  card_name,
}) => {
  return prisma.employeeRfidCard.create({
    data: {
      employeeId: employee_id,
      uid,
      cardName: card_name || null,
      isActive: true,
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
    },
  });
};



const getIndiaDateObject = () => {
  const indiaDate = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());

  return new Date(
    `${indiaDate}T00:00:00+05:30`
  );
};