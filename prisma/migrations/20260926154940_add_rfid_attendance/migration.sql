-- CreateTable
CREATE TABLE "employee_rfid_cards" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "uid" VARCHAR(100) NOT NULL,
    "card_name" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_rfid_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfid_events" (
    "id" SERIAL NOT NULL,
    "event_id" VARCHAR(255) NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "device_id" VARCHAR(100) NOT NULL,
    "uid" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(50) NOT NULL DEFAULT 'RFID_SCAN',
    "direction" VARCHAR(10) NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfid_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance_daily" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "in_count" INTEGER NOT NULL DEFAULT 0,
    "out_count" INTEGER NOT NULL DEFAULT 0,
    "first_in_at" TIMESTAMP(3),
    "last_out_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_attendance_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_rfid_cards_uid_key" ON "employee_rfid_cards"("uid");

-- CreateIndex
CREATE INDEX "employee_rfid_cards_employee_id_idx" ON "employee_rfid_cards"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "rfid_events_event_id_key" ON "rfid_events"("event_id");

-- CreateIndex
CREATE INDEX "rfid_events_employee_id_idx" ON "rfid_events"("employee_id");

-- CreateIndex
CREATE INDEX "rfid_events_employee_id_scanned_at_idx" ON "rfid_events"("employee_id", "scanned_at");

-- CreateIndex
CREATE INDEX "rfid_events_uid_idx" ON "rfid_events"("uid");

-- CreateIndex
CREATE INDEX "rfid_events_device_id_idx" ON "rfid_events"("device_id");

-- CreateIndex
CREATE INDEX "employee_attendance_daily_employee_id_idx" ON "employee_attendance_daily"("employee_id");

-- CreateIndex
CREATE INDEX "employee_attendance_daily_attendance_date_idx" ON "employee_attendance_daily"("attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_attendance_daily_employee_id_attendance_date_key" ON "employee_attendance_daily"("employee_id", "attendance_date");

-- AddForeignKey
ALTER TABLE "employee_rfid_cards" ADD CONSTRAINT "employee_rfid_cards_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfid_events" ADD CONSTRAINT "rfid_events_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance_daily" ADD CONSTRAINT "employee_attendance_daily_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
