import { Injectable } from "@nestjs/common";
import {config} from "dotenv"

config()

@Injectable()
export class MailService {
    private readonly mailtrapEndpoint = 'https://send.api.mailtrap.io/api/send';

    async sendMail(recipientEmail: string, message: string): Promise<void> {
        try {
            const response = await fetch(this.mailtrapEndpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.MAILTRAP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: {
                        email: 'noreply@reelhouse.space',
                        name: 'Movies',
                    },
                    to: [
                        {
                            email: recipientEmail,
                        },
                    ],
                    subject: 'Your verification code',
                    html: buildOtpEmailHtml(message),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Mailtrap API error:', data);
                throw new Error(
                    `Failed to send email: ${data.errors ? data.errors.join(', ') : 'unknown error'}`,
                );
            }
        } catch (error) {
            console.error('sendMail failed:', error);
            throw error;
        }
    }

}

function buildOtpEmailHtml(otp: string): string {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
    <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">Verify your email</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
      Use the code below to confirm your email on <strong>housereel.netlify.app</strong>. This code expires in 5 minutes.
    </p>
    <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
    </div>
    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
      If you didn't request this code, you can safely ignore this email — someone may have entered your email address by mistake. No account will be created or changed without this code.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 11px;">
      This is an automated message from Movies. Please don't reply to this email.
    </p>
  </div>
  `;
}
