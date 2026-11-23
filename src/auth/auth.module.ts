import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/User.entity';
import { PendingUser } from '../entities/PendingUser.entity';
import { MailService } from '../services/Mail-service';
import { CryptoService } from '../services/Bcrypt-hashing';
import { config } from "dotenv"
import { PasswordReset } from '../entities/RenewPassword.entity';

config()

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PendingUser, PasswordReset])
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, CryptoService],
})
export class AuthModule { }
