import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RewriteBulletDto {
  @ApiProperty({
    description: 'The resume bullet point to rewrite',
    example: 'Managed team projects and delivered on time',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Bullet text must be at least 10 characters.' })
  @MaxLength(500)
  bulletText!: string

  @ApiProperty({
    description: 'The job description for context',
    example: 'We need someone with Docker, Kubernetes, and CI/CD experience...',
    minLength: 50,
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(10000)
  jdText!: string

  @ApiProperty({
    description: 'The scan ID to fetch missing keywords from',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  scanId!: string
}
