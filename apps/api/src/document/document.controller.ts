import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { DocumentService } from './document.service'
import { CreateDocumentDto, UpdateDocumentDto } from './document.dto'

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List all archival documents' })
  findAll() {
    return this.documentService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document with Tiptap JSON content' })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new archival document' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document title or Tiptap JSON content' })
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document and cascade its knowledge sources' })
  remove(@Param('id') id: string) {
    return this.documentService.remove(id)
  }
}
