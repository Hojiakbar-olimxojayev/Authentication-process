import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/User.entity";
import { Repository } from "typeorm";
import { PendingUser } from "../entities/PendingUser.entity";
import { SignupDto } from "../DTO/sign-up.dto";
import { generateOtp } from "../services/generate-otp";
import { CryptoService } from "../services/Bcrypt-hashing";
import { MailService } from "../services/Mail-service";
import { OtpPurpose, VerifyEmailDto } from "../DTO/verify-email.dto";
import { SingInDto } from "../DTO/sign-in.dto";
import { PasswordReset } from "../entities/RenewPassword.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PendingUser)
    private readonly pendingUserRepository: Repository<PendingUser>,


    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,

    private readonly bcryptService: CryptoService,
    private readonly mailService: MailService
  ) { }

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const existingPendingUser = await this.pendingUserRepository.findOne({
      where: { email },
    });


    let otp = generateOtp();


    const hashedPassword = await this.bcryptService.hash(password);

    await this.mailService.sendMail(email, otp);

    otp = await this.bcryptService.hash(otp);


    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (existingPendingUser) {
      await this.pendingUserRepository.update({ email }, {
        otp: otp,
        expiresAt,
        password: hashedPassword,
        name
      })
    } else {
      const pendingUser = this.pendingUserRepository.create({
        name,
        email,
        password: hashedPassword,
        otp,
        expiresAt,
      });

      await this.pendingUserRepository.save(pendingUser);
    }

    return {
      message: 'OTP has been sent to your email',
      email,
    };
  };

  async verifyEmail({ email, otp, purpose }: VerifyEmailDto) {
    if (purpose == OtpPurpose.VERIFY) {
      let pendingUser = await this.pendingUserRepository.findOne({ where: { email } });

      if (!pendingUser) throw new ConflictException("User with this email does not exist");

      let isMatch = await this.bcryptService.comapre(pendingUser.otp, otp);
      const isInTime = Date.now() < pendingUser.expiresAt.getTime();

      if (!isInTime) throw new BadRequestException("OTP has been expired request a new one");

      if (!isMatch) throw new BadRequestException("OTP is incorrect");

      let user = this.userRepository.create({
        email,
        name: pendingUser.name,
        password: pendingUser.password
      });

      await this.userRepository.save(user);

      await this.pendingUserRepository.delete({ email });

      return {
        message: "You have registered successfully"
      }
    } else {
      let reset = await this.passwordResetRepository.findOne({
        where: { email }
      });

      if (!reset) throw new BadRequestException("User with this email does not exist");

      let isMatch = await this.bcryptService.comapre(reset.otp, otp);
      const isInTime = Date.now() < reset.expiresAt.getTime();

      if (!isInTime) throw new BadRequestException("OTP has been expired request a new one");

      if (!isMatch) throw new BadRequestException("OTP is incorrect");

      await this.userRepository.update({ email }, {
        password: reset.newPassword
      });

      await this.passwordResetRepository.delete({ email })

      return {
        message: "Your password reset successfully"
      }
    }
  };

  async signIn({ email, password }: SingInDto) {
    let user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) throw new BadRequestException("User with this email does not exist");

    let isMatch = await this.bcryptService.comapre(user.password, password);

    if (!isMatch) throw new BadRequestException("Password is wrong")

    return {
      message: "You have signed in successfully"
    };
  }

  async resetPassword({ email, password }: SingInDto) {
    let user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) throw new BadRequestException("User with this email does not exist");

    let existedReset = await this.passwordResetRepository.findOne({
      where: { email }
    });

    let otp = generateOtp();
    await this.mailService.sendMail(email, otp);

    otp = await this.bcryptService.hash(otp);



    let newPassword = await this.bcryptService.hash(password);
    let expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (existedReset) {
      await this.passwordResetRepository.update({ email }, {
        newPassword,
        expiresAt,
        otp
      });
    } else {
      let reset = this.passwordResetRepository.create({
        email,
        newPassword,
        otp,
        expiresAt
      });

      await this.passwordResetRepository.save(reset);
    }

    return {
      message: "OTP has been sent to your email"
    }
  }
}