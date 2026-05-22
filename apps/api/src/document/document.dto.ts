import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDocumentDto {
  @ApiProperty({ example: '二战美军 M1 钢盔识别规范' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  contentJson?: Record<string, unknown>
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: '二战美军 M1 钢盔识别规范（修订版）' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  contentJson?: Record<string, unknown>
}
