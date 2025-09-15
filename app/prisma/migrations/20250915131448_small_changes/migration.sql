/*
  Warnings:

  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `did` on the `Document` table. All the data in the column will be lost.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_pkey",
DROP COLUMN "did",
ADD COLUMN     "DID" SERIAL NOT NULL,
ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("DID");

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "content" TEXT NOT NULL;
