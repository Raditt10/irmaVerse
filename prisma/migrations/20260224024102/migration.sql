-- AlterTable
ALTER TABLE `competitions` ADD COLUMN `contactEmail` VARCHAR(191) NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NULL,
    ADD COLUMN `contactPerson` VARCHAR(191) NULL,
    ADD COLUMN `judgingCriteria` JSON NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `maxParticipants` INTEGER NULL,
    ADD COLUMN `prizes` JSON NULL,
    ADD COLUMN `requirements` JSON NULL,
    ADD COLUMN `schedules` JSON NULL;

-- AlterTable
ALTER TABLE `material` ADD COLUMN `content` LONGTEXT NULL,
    ADD COLUMN `link` VARCHAR(191) NULL,
    ADD COLUMN `materialType` VARCHAR(191) NULL,
    ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `materialinvite` ADD COLUMN `reason` TEXT NULL;

-- CreateIndex
CREATE INDEX `Material_parentId_fkey` ON `material`(`parentId`);

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `Material_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `material`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
