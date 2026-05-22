import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { QdrantClient } from '@qdrant/js-client-rest'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { extractPlainText, chunkText } from '@mars-memory-archive/shared'
import type { TiptapDocument } from '@mars-memory-archive/shared'

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name)
  private readonly qdrant: QdrantClient
  private readonly embeddings: OpenAIEmbeddings
  private readonly llm: ChatOpenAI
  private readonly collectionName: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.qdrant = new QdrantClient({ url: this.config.get('QDRANT_URL', 'http://localhost:6333') })
    this.collectionName = this.config.get('QDRANT_COLLECTION', 'militaria_chunks')

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.config.get('OPENAI_API_KEY'),
      configuration: { baseURL: this.config.get('OPENAI_BASE_URL') },
      modelName: this.config.get('EMBEDDING_MODEL', 'text-embedding-3-small'),
    })

    this.llm = new ChatOpenAI({
      openAIApiKey: this.config.get('OPENAI_API_KEY'),
      configuration: { baseURL: this.config.get('OPENAI_BASE_URL') },
      modelName: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
      streaming: true,
    })
  }

  /**
   * Index a document into the knowledge base.
   * Uses SHA-256 checksum to avoid duplicates — if same content is re-indexed,
   * performs a full replacement (delete old source + chunks + vectors, then rebuild).
   */
  async indexDocument(documentId: string): Promise<void> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`)

    const tiptapDoc = doc.contentJson as unknown as TiptapDocument
    const plainText = extractPlainText(tiptapDoc)
    const checksum = createHash('sha256').update(plainText).digest('hex')

    this.logger.log(`Indexing document "${doc.title}" [checksum: ${checksum.slice(0, 8)}...]`)

    // Full-replacement dedup: delete existing source with same checksum
    const existing = await this.prisma.knowledgeSource.findUnique({ where: { checksum } })
    if (existing) {
      this.logger.log(`Duplicate detected — replacing existing source ${existing.id}`)
      // Delete vectors from Qdrant first
      const chunks = await this.prisma.knowledgeChunk.findMany({ where: { sourceId: existing.id } })
      if (chunks.length > 0) {
        await this.qdrant.delete(this.collectionName, {
          points: chunks.map((c) => c.vectorPointId),
        })
      }
      await this.prisma.knowledgeSource.delete({ where: { id: existing.id } })
    }

    // Ensure Qdrant collection exists
    await this.ensureCollection()

    // Create KnowledgeSource record
    const source = await this.prisma.knowledgeSource.create({
      data: {
        type: 'DOCUMENT',
        title: doc.title,
        documentId: doc.id,
        checksum,
      },
    })

    // Chunk the text and embed
    const chunks = chunkText(plainText)
    this.logger.log(`Created ${chunks.length} chunks for indexing`)

    for (const chunk of chunks) {
      const vectorPointId = uuidv4()
      const [embedding] = await this.embeddings.embedDocuments([chunk.text])

      const metadata = {
        documentId: doc.id,
        documentTitle: doc.title,
        sourceId: source.id,
        chunkIndex: chunk.index,
      }

      // Store chunk in PostgreSQL (primary storage)
      await this.prisma.knowledgeChunk.create({
        data: {
          sourceId: source.id,
          chunkIndex: chunk.index,
          text: chunk.text,
          vectorPointId,
          metadata,
        },
      })

      // Store vector in Qdrant (index only — not primary storage)
      await this.qdrant.upsert(this.collectionName, {
        points: [{ id: vectorPointId, vector: embedding, payload: metadata }],
      })
    }

    // Mark document as indexed
    await this.prisma.document.update({
      where: { id: documentId },
      data: { indexedAt: new Date() },
    })

    this.logger.log(`Document "${doc.title}" successfully indexed with ${chunks.length} chunks`)
  }

  /**
   * RAG query: vector search → retrieve chunks → stream LLM answer with citations.
   * Yields SSE events: { type: 'chunk', content: string } | { type: 'references', data: [...] }
   */
  async *queryStream(query: string, topK = 5): AsyncGenerator<string> {
    const [queryEmbedding] = await this.embeddings.embedDocuments([query])

    const searchResult = await this.qdrant.search(this.collectionName, {
      vector: queryEmbedding,
      limit: topK,
      with_payload: true,
    })

    if (searchResult.length === 0) {
      yield `data: ${JSON.stringify({ type: 'chunk', content: '暂未找到相关档案记录。' })}\n\n`
      return
    }

    // Retrieve full chunk texts from PostgreSQL (Qdrant is only used as index)
    const chunkIds = searchResult.map((r) => r.id as string)
    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: { vectorPointId: { in: chunkIds } },
    })

    const references = searchResult.map((result, i) => {
      const chunk = chunks.find((c) => c.vectorPointId === result.id)
      return {
        id: chunk?.id ?? '',
        text: chunk?.text ?? '',
        chunkIndex: chunk?.chunkIndex ?? i,
        metadata: (chunk?.metadata as Record<string, unknown>) ?? {},
        score: result.score,
      }
    })

    const context = references.map((r, i) => `[${i + 1}] ${r.text}`).join('\n\n')

    const prompt = `你是一位军品（Militaria）专家助手，专注于历史军事装备的鉴定与研究。
请根据以下档案馆参考资料，用中文回答用户的问题。在回答中需引用参考来源，用 [1]、[2] 等格式标注。

参考资料：
${context}

用户问题：${query}

请给出专业、准确的回答，并在适当位置引用参考来源编号：`

    // Stream LLM response
    const stream = await this.llm.stream(prompt)
    for await (const chunk of stream) {
      const text = typeof chunk.content === 'string' ? chunk.content : ''
      if (text) {
        yield `data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`
      }
    }

    // Send references at the end
    yield `data: ${JSON.stringify({ type: 'references', data: references })}\n\n`
    yield `data: [DONE]\n\n`
  }

  private async ensureCollection(): Promise<void> {
    const collections = await this.qdrant.getCollections()
    const exists = collections.collections.some((c) => c.name === this.collectionName)
    if (!exists) {
      await this.qdrant.createCollection(this.collectionName, {
        vectors: { size: 1536, distance: 'Cosine' },
      })
      this.logger.log(`Created Qdrant collection: ${this.collectionName}`)
    }
  }
}
