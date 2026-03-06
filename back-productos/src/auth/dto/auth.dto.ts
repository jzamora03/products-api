import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' }) @IsString() @IsNotEmpty() username: string;
  @ApiProperty({ example: 'admin123' }) @IsString() @IsNotEmpty() @MinLength(6) password: string;
}

export class RegisterDto {
  @ApiProperty() @IsString() @IsNotEmpty() username: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(6) password: string;
}

export class AuthResponseDto {
  @ApiProperty() access_token: string;
  @ApiProperty() username: string;
}