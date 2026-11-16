-- CreateIndex
CREATE INDEX "Note_userId_createdAt_id_idx" ON "Note"("userId", "createdAt" DESC, "id" DESC);
