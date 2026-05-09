import { IsEmail, IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SignInDto {
  @ApiProperty({
    description: 'Email address of the account',
    example: 'john@example.com',
  })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Account password',
    example: 'SecurePass123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string
}
