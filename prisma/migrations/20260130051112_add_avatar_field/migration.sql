-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `lastSeen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `chat_conversations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chat_conversations_userId_idx`(`userId`),
    INDEX `chat_conversations_instructorId_idx`(`instructorId`),
    UNIQUE INDEX `chat_conversations_userId_instructorId_key`(`userId`, `instructorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `attachmentUrl` VARCHAR(191) NULL,
    `attachmentType` VARCHAR(191) NULL,
    `isEdited` BOOLEAN NOT NULL DEFAULT false,
    `editedAt` DATETIME(3) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_messages_conversationId_idx`(`conversationId`),
    INDEX `chat_messages_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_conversations` ADD CONSTRAINT `chat_conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_conversations` ADD CONSTRAINT `chat_conversations_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
