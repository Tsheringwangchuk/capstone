-- CreateTable
CREATE TABLE "register_details" (
    "id" SERIAL NOT NULL,
    "employeename" TEXT NOT NULL,
    "mycid" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "employername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "register_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "register_details_mycid_key" ON "register_details"("mycid");
