-- CreateEnum
CREATE TYPE "ProcessingMethod" AS ENUM ('WASHED', 'NATURAL', 'HONEY', 'SEMI_WASHED', 'WET_HULLED');

-- CreateEnum
CREATE TYPE "AcidityLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "BodyLevel" AS ENUM ('FULL', 'MEDIUM', 'LIGHT', 'LIGHT_TO_MEDIUM', 'MEDIUM_TO_FULL', 'DELICATE', 'CREAMY');

-- CreateEnum
CREATE TYPE "HarvestMonth" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

-- AlterTable
ALTER TABLE "CoffeeType"
ADD COLUMN "altitude" TEXT,
ADD COLUMN "processing" "ProcessingMethod",
ADD COLUMN "acidity" "AcidityLevel",
ADD COLUMN "body" "BodyLevel",
ADD COLUMN "harvestSeason" "HarvestMonth"[] DEFAULT ARRAY[]::"HarvestMonth"[],
ADD COLUMN "gradesAvailable" TEXT,
ADD COLUMN "tastingNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "badgeText" TEXT;
