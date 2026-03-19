-- AlterTable
ALTER TABLE `material` ADD COLUMN `classGradeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `programs` ADD COLUMN `classGradeId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `material_classGradeId_idx` ON `material`(`classGradeId`);

-- CreateIndex
CREATE INDEX `programs_classGradeId_idx` ON `programs`(`classGradeId`);

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `material_classGradeId_fkey` FOREIGN KEY (`classGradeId`) REFERENCES `class_grades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_classGradeId_fkey` FOREIGN KEY (`classGradeId`) REFERENCES `class_grades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
