import { Controller, Post, Param, Get, Query, Res, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { Response } from 'express'
import { KnowledgeService } from './knowledge.service'

@ApiTags('Knowledge')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('index/:documentId')
  @HttpCode(202)
  @ApiOperation({ summary: 'Index a document into the RAG knowledge base (checksum dedup)' })
  async indexDocument(@Param('documentId') documentId: string) {
    await this.knowledgeService.indexDocument(documentId)
    return { message: 'Document indexed successfully' }
  }

  @Get('query')
  @ApiOperation({ summary: 'RAG query — streams SSE response with citations' })
  @ApiQuery({ name: 'q', description: 'Search query', example: 'M1 钢盔前接缝与后接缝如何断代？' })
  @ApiQuery({ name: 'topK', required: false, description: 'Number of chunks to retrieve', example: 5 })
  async query(
    @Query('q') query: string,
    @Query('topK') topK: string,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.flushHeaders()

    const k = topK ? parseInt(topK, 10) : 5
    const stream = this.knowledgeService.queryStream(query, k)

    for await (const event of stream) {
      res.write(event)
    }

    res.end()
  }
}
