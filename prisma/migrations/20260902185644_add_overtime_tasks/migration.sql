-- CreateTable
CREATE TABLE "OvertimeTask" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "task_id" INTEGER,
    "project_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "overtime_date" DATE NOT NULL,
    "estimated_hours" DECIMAL(5,2),
    "actual_hours" DECIMAL(5,2),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "OvertimeTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_deleted_at_idx" ON "OvertimeTask"("organization_id", "deleted_at");

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_user_id_idx" ON "OvertimeTask"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_project_id_idx" ON "OvertimeTask"("organization_id", "project_id");

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_task_id_idx" ON "OvertimeTask"("organization_id", "task_id");

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_overtime_date_idx" ON "OvertimeTask"("organization_id", "overtime_date");

-- CreateIndex
CREATE INDEX "OvertimeTask_organization_id_status_idx" ON "OvertimeTask"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "OvertimeTask" ADD CONSTRAINT "OvertimeTask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeTask" ADD CONSTRAINT "OvertimeTask_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeTask" ADD CONSTRAINT "OvertimeTask_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
