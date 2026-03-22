function sendVerificationCode({ email, code, username }) {
  console.log(`[dev-email] Verification code for ${username} <${email}>: ${code}`);
}

module.exports = { sendVerificationCode };
