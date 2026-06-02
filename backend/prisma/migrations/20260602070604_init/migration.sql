/*
  Warnings:

  - You are about to drop the column `eloChange` on the `BattleResult` table. All the data in the column will be lost.
  - You are about to drop the column `attendance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `division` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `eloPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gpa` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GpaHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_userId_fkey";

-- DropForeignKey
ALTER TABLE "GpaHistory" DROP CONSTRAINT "GpaHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_userId_fkey";

-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_authorId_fkey";

-- AlterTable
ALTER TABLE "BattleResult" DROP COLUMN "eloChange";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "attendance",
DROP COLUMN "division",
DROP COLUMN "eloPoints",
DROP COLUMN "gpa",
ADD COLUMN     "gameState" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "GpaHistory";

-- DropTable
DROP TABLE "Mission";

-- DropTable
DROP TABLE "News";

-- DropEnum
DROP TYPE "MissionStatus";
