INSERT INTO "DesignContentBlock" (
  "id",
  "designId",
  "type",
  "order",
  "markdown",
  "createdAt",
  "updatedAt"
)
SELECT
  lower(hex(randomblob(16))),
  d."id",
  'markdown',
  0,
  d."content",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Design" d
WHERE trim(d."content") <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "DesignContentBlock" b WHERE b."designId" = d."id"
  );

UPDATE "Design"
SET "content" = '';
