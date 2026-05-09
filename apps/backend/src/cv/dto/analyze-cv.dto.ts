import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AnalyzeCvDto {
  @ApiProperty({
    description: 'The full job description text to analyze against',
    example: 'We are looking for a Senior Software Engineer with 5+ years of experience in TypeScript, Node.js, and cloud technologies...',
    minLength: 50,
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Job description must be at least 50 characters.' })
  @MaxLength(10000, { message: 'Job description must be under 10,000 characters.' })
  jdText!: string

  @ApiProperty({
    description: 'Target job title (optional — AI will detect if not provided)',
    example: 'Senior Software Engineer',
    required: false,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  jobTitle?: string

  @ApiProperty({
    description: 'Target company name (optional)',
    example: 'Acme Corp',
    required: false,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string
}
