import { Controller, Post, Body, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../DTO/sign-up.dto';
import { VerifyEmailDto } from '../DTO/verify-email.dto';
import { SingInDto } from '../DTO/sign-in.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  signUp(@Body() signUpDto: SignupDto) {
    return this.authService.signup(signUpDto);
  };

  @Post("verify-email")
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  };

  @Post("sign-in")
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 60_000
    }
  })
  signIn(@Body() signInDto: SingInDto) {
    return this.authService.signIn(signInDto)
  }

  @Post("reset-password")
  reset(@Body() reset: SingInDto) {
    return this.authService.resetPassword(reset);
  };
}
