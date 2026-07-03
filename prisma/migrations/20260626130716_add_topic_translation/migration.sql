-- CreateTable
CREATE TABLE "topic_translation" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "topic_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_translation_topicId_languageId_key" ON "topic_translation"("topicId", "languageId");

-- AddForeignKey
ALTER TABLE "topic_translation" ADD CONSTRAINT "topic_translation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_translation" ADD CONSTRAINT "topic_translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
