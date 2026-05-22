import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDocumentDto, UpdateDocumentDto } from './document.dto'
import { createEmptyDocument } from '@mars-memory-archive/shared'

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.document.findMany({
      select: {
        id: true,
        title: true,
        indexedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } })
    if (!doc) throw new NotFoundException(`Document ${id} not found`)
    return doc
  }

  async create(dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        contentJson: dto.contentJson ?? createEmptyDocument(),
      },
    })
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.findOne(id) // throws if not found
    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.contentJson !== undefined && { contentJson: dto.contentJson }),
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.document.delete({ where: { id } })
  }
}
