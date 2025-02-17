/*
  Warnings:

  - You are about to drop the column `userId` on the `project` table. All the data in the column will be lost.
  - Added the required column `managerId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_userId_fkey`;

-- DropIndex
DROP INDEX `Project_userId_fkey` ON `project`;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `userId`,
    ADD COLUMN `managerId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `VerificationToken_expiresAt_idx` ON `VerificationToken`(`expiresAt`);

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
