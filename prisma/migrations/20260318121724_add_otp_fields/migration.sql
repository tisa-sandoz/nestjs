/*
  Warnings:

  - You are about to drop the column `isVerifiied` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerifiied",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
