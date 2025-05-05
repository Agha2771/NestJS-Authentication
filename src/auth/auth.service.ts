import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.usersService.create(email, hashed);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refresh_token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string) {
    try {

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
      const newAccessToken = this.jwtService.sign({ email: decoded['email'], sub: decoded['sub'] }, { expiresIn: '1h' });
      return { access_token: newAccessToken };
      
    } catch (e) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
    