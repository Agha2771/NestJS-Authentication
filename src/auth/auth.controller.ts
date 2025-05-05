import { Controller, Post, Body, Get, UseGuards, HttpStatus, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { successResponse, errorResponse } from '../common/response/response.helper';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto, @Res() res: Response) {
    try {
        if (await this.usersService.findByEmail(registerUserDto.email)) {
            return res
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .json(errorResponse('User already exists'));
        }
      const user = await this.authService.register(registerUserDto.email, registerUserDto.password);
      return res
        .status(HttpStatus.CREATED)
        .json(successResponse('User registered successfully', user));
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(errorResponse(e.message));
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    try {
      const user = await this.authService.login(body.email, body.password);
      return res
        .status(HttpStatus.OK)
        .json(successResponse('User logged in successfully', {
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        }));
    } catch (e) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(errorResponse('Invalid credentials'));
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }, @Res() res: Response) {
    try {
      const user = await this.authService.refreshToken(body.refresh_token);
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Access token refreshed successfully', {
          access_token: user.access_token,
        }));
    } catch (e) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(errorResponse('Invalid or expired refresh token'));
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Res() res: Response, @Req() req: any) {
    try {
      const user = await this.usersService.findById(req.user.userId);

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(errorResponse('User not found'));
      }

      return res
        .status(HttpStatus.OK)
        .json(successResponse('User profile fetched successfully', user));
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Failed to fetch profile'));
    }
  }
}
