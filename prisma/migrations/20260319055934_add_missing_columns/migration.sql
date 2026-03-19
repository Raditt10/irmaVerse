-- DropForeignKey
ALTER TABLE `material` DROP FOREIGN KEY `Material_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `material_quizzes` DROP FOREIGN KEY `material_quizzes_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `materialinvite` DROP FOREIGN KEY `MaterialInvite_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `rekapan` DROP FOREIGN KEY `rekapan_materialId_fkey`;

-- AlterTable
ALTER TABLE `activity_logs` MODIFY `type` ENUM('quiz_completed', 'material_read', 'course_enrolled', 'program_enrolled', 'attendance_marked', 'badge_earned', 'level_up', 'friend_added', 'forum_post', 'streak_maintained', 'profile_completed', 'admin_user_managed', 'admin_program_managed', 'admin_material_managed', 'admin_news_managed', 'admin_schedule_managed', 'admin_competition_managed', 'admin_admin_managed') NOT NULL;

-- AlterTable
ALTER TABLE `material` ADD COLUMN `kajianOrder` INTEGER NULL;

-- AlterTable
ALTER TABLE `material_quizzes` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `programs` ADD COLUMN `totalKajian` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `rekapan` MODIFY `materialId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `jabatan` VARCHAR(191) NULL,
    MODIFY `role` ENUM('user', 'admin', 'super_admin', 'instruktur') NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE `feature_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('feature_request', 'bug_report') NOT NULL DEFAULT 'feature_request',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('open', 'in_progress', 'completed', 'closed') NOT NULL DEFAULT 'open',
    `priority` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    `votes` INTEGER NOT NULL DEFAULT 0,
    `response` TEXT NULL,
    `respondedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `feature_requests_userId_idx`(`userId`),
    INDEX `feature_requests_status_idx`(`status`),
    INDEX `feature_requests_type_idx`(`type`),
    INDEX `feature_requests_createdAt_idx`(`createdAt`),
    INDEX `feature_requests_respondedBy_idx`(`respondedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_grades` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `class_grades_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `Material_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material_quizzes` ADD CONSTRAINT `material_quizzes_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `material`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materialinvite` ADD CONSTRAINT `MaterialInvite_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rekapan` ADD CONSTRAINT `rekapan_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `material`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_requests` ADD CONSTRAINT `feature_requests_respondedBy_fkey` FOREIGN KEY (`respondedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
