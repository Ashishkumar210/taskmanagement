const { DateTime } = require("luxon");

const INDIA_TIMEZONE = "Asia/Kolkata";

exports.getIndiaDayRange = () => {

  const now =
    DateTime.now().setZone(
      INDIA_TIMEZONE
    );

  const start =
    now.startOf("day");

  const end =
    now.endOf("day");

  return {
    date: start.toISODate(),

    start: start
      .toUTC()
      .toJSDate(),

    end: end
      .toUTC()
      .toJSDate(),
  };
};


exports.getIndiaDateObject = () => {

  const now =
    DateTime.now().setZone(
      INDIA_TIMEZONE
    );

  /**
   * PostgreSQL DATE.
   *
   * Use UTC midnight for the
   * date-only Prisma value.
   */
  return new Date(
    `${now.toISODate()}T00:00:00.000Z`
  );
};