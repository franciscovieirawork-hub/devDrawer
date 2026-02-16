-- AlterTable
ALTER TABLE "Planner" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicSlug" TEXT;

-- CreateTable
CREATE TABLE "PlannerShare" (
    "id" TEXT NOT NULL,
    "plannerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planner_publicSlug_key" ON "Planner"("publicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerShare_plannerId_userId_key" ON "PlannerShare"("plannerId", "userId");

-- AddForeignKey
ALTER TABLE "PlannerShare" ADD CONSTRAINT "PlannerShare_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "Planner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerShare" ADD CONSTRAINT "PlannerShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
