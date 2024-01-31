/*
  Warnings:

  - Added the required column `password` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "password" VARCHAR NOT NULL,
ADD COLUMN     "username" VARCHAR NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR;
