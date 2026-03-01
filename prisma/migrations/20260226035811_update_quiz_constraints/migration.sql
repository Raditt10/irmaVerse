/*
  Warnings:

  - A unique constraint covering the columns `[userId,quizId]` on the table `QuizEnrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `UserAnswer` MODIFY `optionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `QuizOption` MODIFY `isCorrect` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `QuizQuestion` ADD COLUMN `isMultiple` BOOLEAN NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `QuizEnrollments_userId_quizId_key` ON `QuizEnrollments`(`userId`, `quizId`);

-- CreateIndex
CREATE UNIQUE INDEX `QuizQuestion_quizId_question_key` ON `QuizQuestion`(`quizId`, `question`);