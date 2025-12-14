import nodemailer from 'nodemailer';

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

export const sendResetPasswordEmail = async (email, resetUrl) => {
  if (!smtpConfigured || !transporter) {
    console.log('[MAILER] SMTP not configured. Password reset URL:', resetUrl);
    return true;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const message = {
    from,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour continuer : ${resetUrl}`,
    html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Cliquez ici pour définir un nouveau mot de passe</a></p><p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`,
  };

  try {
    await transporter.sendMail(message);
    return true;
  } catch (err) {
    console.error('[MAILER] sendMail failed:', err.message);
    return false;
  }
};
