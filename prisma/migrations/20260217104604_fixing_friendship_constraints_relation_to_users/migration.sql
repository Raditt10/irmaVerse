/*
  Warnings:

  - The values [Accepted] on the enum `Friendship_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Friendship` DROP FOREIGN KEY `Friendship_addresseeId_fkey`;

-- DropForeignKey
ALTER TABLE `Friendship` DROP FOREIGN KEY `Friendship_requesterId_fkey`;

-- AlterTable
ALTER TABLE `Friendship` MODIFY `status` ENUM('Pending', 'Friend', 'Rejected', 'Blocked') NOT NULL;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `fk_friendship_requester` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `fk_friendship_addressee` FOREIGN KEY (`addresseeId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
