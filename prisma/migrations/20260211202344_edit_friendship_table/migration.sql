/*
  Warnings:

  - You are about to drop the column `user1Id` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `addresseeId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Friendship` DROP FOREIGN KEY `Friendship_user1Id_fkey`;

-- DropForeignKey
ALTER TABLE `Friendship` DROP FOREIGN KEY `Friendship_user2Id_fkey`;

-- DropIndex
DROP INDEX `Friendship_user1Id_fkey` ON `Friendship`;

-- DropIndex
DROP INDEX `Friendship_user2Id_fkey` ON `Friendship`;

-- AlterTable
ALTER TABLE `Friendship` DROP COLUMN `user1Id`,
    DROP COLUMN `user2Id`,
    ADD COLUMN `addresseeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `requesterId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('Pending', 'Accepted', 'Rejected', 'Blocked') NOT NULL;

-- AlterTable
ALTER TABLE `Material` MODIFY `grade` ENUM('X', 'XI', 'XII', 'XIII', 'Alumni') NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `class` ENUM('X', 'XI', 'XII', 'XIII', 'Alumni') NOT NULL DEFAULT 'X',
    ADD COLUMN `visibility` ENUM('Visible', 'Invisible', 'Idle') NOT NULL DEFAULT 'Visible';

-- CreateIndex
CREATE INDEX `Friendship_requesterId_idx` ON `Friendship`(`requesterId`);

-- CreateIndex
CREATE INDEX `Friendship_addresseeId_idx` ON `Friendship`(`addresseeId`);

-- CreateIndex
CREATE INDEX `Friendship_status_idx` ON `Friendship`(`status`);

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_addresseeId_fkey` FOREIGN KEY (`addresseeId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
