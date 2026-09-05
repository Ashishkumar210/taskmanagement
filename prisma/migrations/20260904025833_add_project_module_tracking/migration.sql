-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FRONTEND', 'BACKEND', 'TESTER', 'FULL_STACK', 'DEVOPS', 'UI_UX', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectModuleStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "project_modules" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "ProjectModuleStatus" NOT NULL DEFAULT 'PLANNED',
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "project_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_module_assignments" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "removed_at" TIMESTAMP(3),
    "removed_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_module_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_module_work_logs" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "employee_type" "EmployeeType" NOT NULL,
    "work_date" DATE NOT NULL,
    "current_work" TEXT NOT NULL,
    "completed_work" TEXT,
    "blockers" TEXT,
    "remarks" TEXT,
    "hours_worked" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_module_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_module_status_logs" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "old_status" "ProjectModuleStatus",
    "new_status" "ProjectModuleStatus" NOT NULL,
    "comment" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_module_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_modules_organization_id_idx" ON "project_modules"("organization_id");

-- CreateIndex
CREATE INDEX "project_modules_organization_id_project_id_idx" ON "project_modules"("organization_id", "project_id");

-- CreateIndex
CREATE INDEX "project_modules_organization_id_status_idx" ON "project_modules"("organization_id", "status");

-- CreateIndex
CREATE INDEX "project_modules_project_id_deleted_at_idx" ON "project_modules"("project_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_modules_project_id_code_key" ON "project_modules"("project_id", "code");

-- CreateIndex
CREATE INDEX "project_module_assignments_organization_id_idx" ON "project_module_assignments"("organization_id");

-- CreateIndex
CREATE INDEX "project_module_assignments_module_id_idx" ON "project_module_assignments"("module_id");

-- CreateIndex
CREATE INDEX "project_module_assignments_user_id_idx" ON "project_module_assignments"("user_id");

-- CreateIndex
CREATE INDEX "project_module_assignments_organization_id_module_id_idx" ON "project_module_assignments"("organization_id", "module_id");

-- CreateIndex
CREATE INDEX "project_module_assignments_organization_id_user_id_idx" ON "project_module_assignments"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "project_module_work_logs_organization_id_idx" ON "project_module_work_logs"("organization_id");

-- CreateIndex
CREATE INDEX "project_module_work_logs_organization_id_module_id_idx" ON "project_module_work_logs"("organization_id", "module_id");

-- CreateIndex
CREATE INDEX "project_module_work_logs_organization_id_user_id_idx" ON "project_module_work_logs"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "project_module_work_logs_module_id_work_date_idx" ON "project_module_work_logs"("module_id", "work_date");

-- CreateIndex
CREATE INDEX "project_module_work_logs_user_id_work_date_idx" ON "project_module_work_logs"("user_id", "work_date");

-- CreateIndex
CREATE INDEX "project_module_status_logs_organization_id_idx" ON "project_module_status_logs"("organization_id");

-- CreateIndex
CREATE INDEX "project_module_status_logs_module_id_changed_at_idx" ON "project_module_status_logs"("module_id", "changed_at");

-- CreateIndex
CREATE INDEX "project_module_status_logs_user_id_changed_at_idx" ON "project_module_status_logs"("user_id", "changed_at");

-- AddForeignKey
ALTER TABLE "project_modules" ADD CONSTRAINT "project_modules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_assignments" ADD CONSTRAINT "project_module_assignments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "project_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_assignments" ADD CONSTRAINT "project_module_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_work_logs" ADD CONSTRAINT "project_module_work_logs_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "project_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_work_logs" ADD CONSTRAINT "project_module_work_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_status_logs" ADD CONSTRAINT "project_module_status_logs_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "project_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_module_status_logs" ADD CONSTRAINT "project_module_status_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
