import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log(`[Email Service] Attempting to send password reset email to: ${email}`);
    console.log(`[Email Service] Reset URL: ${resetUrl}`);

    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Todo App <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset for your Todo App account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      if (error) {
        console.error(`[Email Service] Failed to send email:`, error);
        throw new Error(error.message);
      }

      console.log(`[Email Service] Email sent successfully!`);
      console.log(`[Email Service] Email ID: ${data?.id}`);
    } catch (error) {
      console.error(`[Email Service] Failed to send email:`, error);
      throw error;
    }
  },
};
