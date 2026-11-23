import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt"

@Injectable()
export class CryptoService {
    async hash(plainText: string) {
        let hashedData = await bcrypt.hash(plainText, 10)
        return hashedData
    };
    async comapre(hashedData: string, plaintText: string) {
        let isMatch = await bcrypt.compare(plaintText, hashedData);
        return isMatch
    }
}