import nodemailer from 'nodemailer';

const defaultFrom = 'Trust Media <no-reply@trustmedia.local>';

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const logResetLink = (resetUrl) => {
  console.log('[MAILER] SMTP not configured. Password reset URL:', resetUrl);
};

const getTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

export const sendResetPasswordEmail = async (email, resetUrl) => {
  if (!isSmtpConfigured()) {
    logResetLink(resetUrl);
    return true;
  }

  try {
    const transporter = getTransporter();
    const from = process.env.MAIL_FROM || defaultFrom;

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Cliquez ici pour définir un nouveau mot de passe</a></p><p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`,
    });

    console.log(`[MAILER] Email sent to: ${email}`);
    return true;
  } catch (error) {
    const errorCode = error?.code ? ` (${error.code})` : '';
    console.error(`[MAILER] SMTP send failed${errorCode}:`, error?.message || error);
    console.log('[MAILER] Fallback reset URL:', resetUrl);
    return false;
  }
};
