import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for the frontend app
  app.enableCors({ origin: 'http://localhost:5173', credentials: true })

  // Global validation pipe using class-validator
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Mars & Memory Archive API')
    .setDescription('API for the Digital Militaria Archive — document editing, RAG indexing, and AI retrieval')
    .setVersion('0.1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.API_PORT ?? 3000
  await app.listen(port)
  console.log(`🪖  Mars & Memory Archive API running on http://localhost:${port}`)
  console.log(`📖  Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()
