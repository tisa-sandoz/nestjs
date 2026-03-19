import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: 'Password1',
    description: 'At least 8 chars, 1 uppercase, 1 number',
  })
  password: string;
}
