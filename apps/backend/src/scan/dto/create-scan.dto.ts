import { IsString, MinLength, IsOptional } from 'class-validator'

export class CreateScanDto {
  @IsOptional()
  @IsString()
  jobTitle?: string

  @IsOptional()
  @IsString()
  companyName?: string

  @IsString()
  @MinLength(100, { message: 'CV text must be at least 100 characters' })
  cvText!: string

  @IsString()
  @MinLength(50, { message: 'Job description must be at least 50 characters' })
  jdText!: string
}
