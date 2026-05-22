import { z } from 'zod'

// ─── Document ────────────────────────────────────────────────────────────────

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  contentJson: z.record(z.unknown()).optional().default({}),
})

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.unknown()).optional(),
})

export type CreateDocumentDto = z.infer<typeof CreateDocumentSchema>
export type UpdateDocumentDto = z.infer<typeof UpdateDocumentSchema>

// ─── KnowledgeSource ─────────────────────────────────────────────────────────

export const SourceTypeSchema = z.enum(['DOCUMENT', 'FILE'])
export type SourceType = z.infer<typeof SourceTypeSchema>

export const IndexDocumentSchema = z.object({
  documentId: z.string().cuid(),
})

// ─── RAG Query ───────────────────────────────────────────────────────────────

export const RagQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500),
  topK: z.number().int().min(1).max(20).optional().default(5),
})

export type RagQueryDto = z.infer<typeof RagQuerySchema>

// ─── API Responses ───────────────────────────────────────────────────────────

export const DocumentResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  contentJson: z.record(z.unknown()),
  indexedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type DocumentResponse = z.infer<typeof DocumentResponseSchema>

export const ChunkReferenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  chunkIndex: z.number(),
  metadata: z.record(z.unknown()),
  score: z.number(),
})

export type ChunkReference = z.infer<typeof ChunkReferenceSchema>

export const RagAnswerSchema = z.object({
  answer: z.string(),
  references: z.array(ChunkReferenceSchema),
})

export type RagAnswer = z.infer<typeof RagAnswerSchema>
