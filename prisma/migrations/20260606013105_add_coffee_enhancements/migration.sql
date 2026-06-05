-- CreateEnum
CREATE TYPE "CoffeeGradeStatus" AS ENUM ('AVAILABLE', 'COMING_SOON', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "CoffeeGrade" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "qualityLevel" TEXT NOT NULL,
    "defects" TEXT NOT NULL,
    "status" "CoffeeGradeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeTypeGrade" (
    "coffeeTypeId" INTEGER NOT NULL,
    "coffeeGradeId" INTEGER NOT NULL,

    CONSTRAINT "CoffeeTypeGrade_pkey" PRIMARY KEY ("coffeeTypeId", "coffeeGradeId")
);

-- DropColumn
ALTER TABLE "CoffeeType" DROP COLUMN "gradesAvailable";

-- AddForeignKey
ALTER TABLE "CoffeeTypeGrade" ADD CONSTRAINT "CoffeeTypeGrade_coffeeTypeId_fkey" FOREIGN KEY ("coffeeTypeId") REFERENCES "CoffeeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeTypeGrade" ADD CONSTRAINT "CoffeeTypeGrade_coffeeGradeId_fkey" FOREIGN KEY ("coffeeGradeId") REFERENCES "CoffeeGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
