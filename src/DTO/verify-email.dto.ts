import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Length,
} from 'class-validator';

export enum OtpPurpose {
    VERIFY = 'VERIFY',
    RENEW = 'RENEW'
}

export class VerifyEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;

    @IsEnum(OtpPurpose)
    @IsNotEmpty()
    purpose: OtpPurpose
}