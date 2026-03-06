import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> { return this.svc.register(dto); }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> { return this.svc.login(dto); }
}