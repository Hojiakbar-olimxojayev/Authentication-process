import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from './entities/User.entity';
import { AuthModule } from './auth/auth.module';
import { PendingUser } from './entities/PendingUser.entity';
import { PasswordReset } from './entities/RenewPassword.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: String(process.env.DB_URL),
      synchronize: true,
      entities: [User, PasswordReset, PendingUser]
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
