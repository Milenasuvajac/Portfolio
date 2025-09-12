-- CreateTable
CREATE TABLE "public"."User" (
    "UID" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UID")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "PID" SERIAL NOT NULL,
    "technologies" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("PID")
);

-- CreateTable
CREATE TABLE "public"."Experience" (
    "EID" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "myResp" TEXT NOT NULL,
    "company" TEXT NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("EID")
);

-- CreateTable
CREATE TABLE "public"."Technology" (
    "TID" SERIAL NOT NULL,
    "icon" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("TID")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "MID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contact" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("MID")
);

-- CreateTable
CREATE TABLE "public"."Info" (
    "IID" SERIAL NOT NULL,
    "photo" TEXT,
    "text" TEXT NOT NULL,
    "visibility" BOOLEAN NOT NULL,
    "contact" TEXT NOT NULL,
    "cv" TEXT NOT NULL,

    CONSTRAINT "Info_pkey" PRIMARY KEY ("IID")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "did" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "document" TEXT NOT NULL,
    "comment" TEXT,
    "issuer" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("did")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "public"."Technology"("name");
