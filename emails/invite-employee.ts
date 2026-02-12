import { resend } from "@/lib/resend";

export default async function SendInviteEmployeeEmail(email: string, url: string | undefined, name: string, tempPassword: string) {
    const subject = "Welcome to Modern HRM - Setup Your Account";
    const html = `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Welcome to Modern HRM!</h1>

    <p>Hello ${name},</p>

    <p>
      You have been invited to join the Modern HRM platform.
      Your employee account has been created by the HR team.
    </p>

    <p>
      <strong>Your temporary login details:</strong>
    </p>

    <p style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 15px;">
      <strong>Email:</strong> ${email}<br />
      <strong>Temporary Password:</strong> ${tempPassword}
    </p>

    <p>
      For security reasons, you will be required to change your password
      immediately after logging in.
    </p>

    <a 
      href="${url}" 
      style="
        display: inline-block;
        background-color: #000;
        color: #fff;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        font-weight: bold;
      "
    >
      Login to Modern HRM
    </a>

    <p style="margin-top: 20px; color: #666; font-size: 14px;">
      If you did not expect this email, please contact your HR administrator.
    </p>
  </div>
`;


    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: subject,
            html: html
        });
        console.log(`✅ Invite email sent to ${email}`);
    } catch (error) {
        console.error("❌ Failed to send invite email:", error);
    }
}
