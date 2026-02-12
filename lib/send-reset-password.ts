import { resend } from "@/lib/resend";


export default async function SendResetPasswordEmail(email: string, url: string|undefined) {
    const subject = "Reset your password";
    const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Reset Your Password</h1>
                    <p>We received a request to reset your password.</p>
                    <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Reset Password</a>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't ask for this, you can safely ignore this email.</p>
                </div>
             `;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: subject,
        html: html
    })
}