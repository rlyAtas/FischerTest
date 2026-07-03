/*
  Warnings:

  - A unique constraint covering the columns `[itemId,text]` on the table `answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[topicId,text]` on the table `item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "answer_itemId_text_key" ON "answer"("itemId", "text");

-- CreateIndex
CREATE UNIQUE INDEX "item_topicId_text_key" ON "item"("topicId", "text");
