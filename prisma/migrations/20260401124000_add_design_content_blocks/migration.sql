-- CreateTable
CREATE TABLE "DesignContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "markdown" TEXT,
    "linkUrl" TEXT,
    "linkTitle" TEXT,
    "linkPreviewImage" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSizeBytes" INTEGER,
    "fileMimeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DesignContentBlock_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DesignContentBlock_designId_order_idx" ON "DesignContentBlock"("designId", "order");
