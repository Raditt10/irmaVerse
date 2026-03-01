/*
  Warnings:

  - Added the required column `userId` to the `MaterialInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MaterialInvite` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `MaterialInvite_userId_idx` ON `MaterialInvite`(`userId`);

-- AddForeignKey
ALTER TABLE `MaterialInvite` ADD CONSTRAINT `MaterialInvite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
