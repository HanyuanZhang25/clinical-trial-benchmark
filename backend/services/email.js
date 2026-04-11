const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass }
  };
}

function buildVerificationEmail({ email, code, username, purpose = 'email verification' }) {
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@clinicaltrialarena.dev';
  const appName = 'Clinical Trial Arena';
  const isPasswordReset = purpose === 'password reset';
  const subject = isPasswordReset
    ? `${appName} password reset code`
    : `${appName} email verification code`;
  const intro = isPasswordReset
    ? `Your ${appName} password reset code is: ${code}`
    : `Your ${appName} verification code is: ${code}`;

  return {
    from: mailFrom,
    to: email,
    subject,
    text: [
      `Hello ${username},`,
      '',
      intro,
      '',
      'This code expires in 15 minutes.',
      'If you did not request this code, you can ignore this email.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hello ${username},</p>
        <p>${isPasswordReset ? 'Your <strong>Clinical Trial Arena</strong> password reset code is:' : 'Your <strong>Clinical Trial Arena</strong> verification code is:'}</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p>This code expires in <strong>15 minutes</strong>.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `
  };
}

async function sendVerificationCode({ email, code, username, purpose = 'email verification' }) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.log(`[dev-email] ${purpose} code for ${username} <${email}>: ${code}`);
    return {
      delivered: false,
      mode: 'log'
    };
  }

  const transporter = nodemailer.createTransport(smtpConfig);
  await transporter.sendMail(buildVerificationEmail({ email, code, username, purpose }));

  return {
    delivered: true,
    mode: 'smtp'
  };
}

module.exports = { sendVerificationCode };
