import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

interface User { id: string; username: string; passwordHash: string; }

@Injectable()
export class AuthService {
  private users: User[] = [];
  private counter = 2;

  constructor(private readonly jwtService: JwtService) {
    this.seedAdmin();
  }

  private async seedAdmin() {
    const hash = await bcrypt.hash('admin123', 10);
    this.users.push({ id: '1', username: 'admin', passwordHash: hash });
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (this.users.find((u) => u.username === dto.username))
      throw new ConflictException('Username already exists');
    const hash = await bcrypt.hash(dto.password, 10);
    const user: User = { id: String(this.counter++), username: dto.username, passwordHash: hash };
    this.users.push(user);
    return this.token(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = this.users.find((u) => u.username === dto.username);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return this.token(user);
  }

  private token(user: User): AuthResponseDto {
    return {
      access_token: this.jwtService.sign({ sub: user.id, username: user.username }),
      username: user.username,
    };
  }

  async validateUser(userId: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === userId);
  }
}