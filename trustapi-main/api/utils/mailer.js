import nodemailer from 'nodemailer';

const smtpEnabled =
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export const sendResetPasswordEmail = async (email, resetUrl) => {
  if (!smtpEnabled || !transporter) {
    console.log('Password reset URL:', resetUrl);
    return { delivered: false, logged: true };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const message = {
    from,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour continuer : ${resetUrl}`,
    html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Cliquez ici pour définir un nouveau mot de passe</a></p><p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`,
  };

  return transporter.sendMail(message);
};
