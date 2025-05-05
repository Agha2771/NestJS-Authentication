import { IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  readonly email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(15, { message: 'Password must not exceed 15 characters.' })
  readonly password: string;
}
