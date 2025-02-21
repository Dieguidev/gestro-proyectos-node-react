-- DropForeignKey
ALTER TABLE `teamproject` DROP FOREIGN KEY `TeamProject_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `teamproject` DROP FOREIGN KEY `TeamProject_userId_fkey`;

-- DropIndex
DROP INDEX `TeamProject_projectId_fkey` ON `teamproject`;

-- AddForeignKey
ALTER TABLE `TeamProject` ADD CONSTRAINT `TeamProject_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamProject` ADD CONSTRAINT `TeamProject_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
