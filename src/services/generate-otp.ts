import { generate } from "otp-generator"

export function generateOtp() {
    return generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })
}