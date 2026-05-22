import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { DocumentModule } from './document/document.module'
import { KnowledgeModule } from './knowledge/knowledge.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    PrismaModule,
    DocumentModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
