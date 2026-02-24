/*
  Warnings:

  - You are about to drop the `CourseEnrollment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `capacity` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CourseEnrollment` DROP FOREIGN KEY `CourseEnrollment_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `CourseEnrollment` DROP FOREIGN KEY `CourseEnrollment_userId_fkey`;

-- AlterTable
ALTER TABLE `Material` ADD COLUMN `capacity` INTEGER NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `CourseEnrollment`;

-- CreateTable
CREATE TABLE `CourseEnrollments` (
    `id` VARCHAR(191) NOT NULL,
    `materialId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `instructorArrival` VARCHAR(191) NOT NULL,
    `StartAt` DATETIME(3) NOT NULL,
    `EndTime` DATETIME(3) NOT NULL,
    `role` ENUM('user', 'instructor', 'assistant') NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CourseEnrollments_userId_idx`(`userId`),
    UNIQUE INDEX `CourseEnrollments_materialId_userId_key`(`materialId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseSurvey` (
    `id` VARCHAR(191) NOT NULL,
    `courseEnrollId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rate` VARCHAR(191) NOT NULL,
    `relevance` VARCHAR(191) NOT NULL,
    `clarity` VARCHAR(191) NOT NULL,
    `feedback` VARCHAR(191) NULL,

    UNIQUE INDEX `CourseSurvey_courseEnrollId_key`(`courseEnrollId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friendship` (
    `id` VARCHAR(191) NOT NULL,
    `user1Id` VARCHAR(191) NOT NULL,
    `user2Id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CourseEnrollments` ADD CONSTRAINT `CourseEnrollments_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollments` ADD CONSTRAINT `CourseEnrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseSurvey` ADD CONSTRAINT `CourseSurvey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseSurvey` ADD CONSTRAINT `CourseSurvey_courseEnrollId_fkey` FOREIGN KEY (`courseEnrollId`) REFERENCES `CourseEnrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
