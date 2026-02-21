import crypto from 'crypto';

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendEmail({ to, subject, html }) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Vault <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to send email');
  }

  return res.json();
}

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

  await sendEmail({
    to,
    subject: config.subject,
    html,
  });
}
