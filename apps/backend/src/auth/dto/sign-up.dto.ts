import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SignUpDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string

  @ApiProperty({
    description: 'Email address for the account',
    example: 'john@example.com',
  })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Password (8-72 characters)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string
}
