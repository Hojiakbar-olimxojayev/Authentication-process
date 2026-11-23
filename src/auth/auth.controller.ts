import { Controller, Post, Body, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../DTO/sign-up.dto';
import { VerifyEmailDto } from '../DTO/verify-email.dto';
import { SingInDto } from '../DTO/sign-in.dto';

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
  signIn(@Body() signInDto: SingInDto) {
    return this.authService.signIn(signInDto)
  }

  @Post("reset-password")
  reset(@Body() reset: SingInDto) {
    return this.authService.resetPassword(reset);
  };
}
