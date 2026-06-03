-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';
