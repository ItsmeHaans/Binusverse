/*
  Warnings:

  - Added the required column `updatedAt` to the `PvpSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PvpSession" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "BattleResult_userId_mode_idx" ON "BattleResult"("userId", "mode");

-- CreateIndex
CREATE INDEX "BattleResult_createdAt_idx" ON "BattleResult"("createdAt");

-- CreateIndex
CREATE INDEX "ForumComment_postId_idx" ON "ForumComment"("postId");

-- CreateIndex
CREATE INDEX "ForumComment_userId_idx" ON "ForumComment"("userId");

-- CreateIndex
CREATE INDEX "ForumPost_userId_idx" ON "ForumPost"("userId");
