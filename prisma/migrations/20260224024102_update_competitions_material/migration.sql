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
ALTER TABLE `Material` ADD COLUMN `content` LONGTEXT NULL,
    ADD COLUMN `link` VARCHAR(191) NULL,
    ADD COLUMN `materialType` VARCHAR(191) NULL,
    ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MaterialInvite` ADD COLUMN `reason` TEXT NULL;

-- CreateIndex
CREATE INDEX `Material_parentId_fkey` ON `Material`(`parentId`);

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Material`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
