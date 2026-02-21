import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SMTP_Name,
    pass: process.env.GMAIL_SMTP_Password,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  pool: true,
  maxConnections: 3,
});

// Verify SMTP connection on startup
transporter.verify().then(() => {
  console.log('SMTP connection verified — ready to send emails');
}).catch((err) => {
  console.error('SMTP connection error:', err.message);
});

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

const EMAIL_CONFIG = {
  signup: {
    subject: 'Verify your email - Vault',
    heading: 'Email Verification',
    message: 'Use the code below to verify your email and complete your registration.',
  },
  reset: {
    subject: 'Reset your password - Vault',
    heading: 'Password Reset',
    message: 'Use the code below to reset your password.',
  },
  login: {
    subject: 'Sign-in verification - Vault',
    heading: '2-Step Verification',
    message: 'Use the code below to complete your sign-in.',
  },
  'email-change': {
    subject: 'Verify your new email - Vault',
    heading: 'Email Change Verification',
    message: 'Use the code below to verify your new email address.',
  },
};

export async function sendOtpEmail(to, code, purpose) {
  const config = EMAIL_CONFIG[purpose];

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 460px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: #2563eb; color: white; font-size: 28px; text-align: center;">🔐</div>
      </div>
      <h2 style="text-align: center; color: #111827; font-size: 22px; margin-bottom: 8px;">${config.heading}</h2>
      <p style="text-align: center; color: #6b7280; font-size: 15px; margin-bottom: 32px;">${config.message}</p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827;">${code}</span>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Vault" <${process.env.GMAIL_SMTP_Name}>`,
    to,
    subject: config.subject,
    html,
  });
}
