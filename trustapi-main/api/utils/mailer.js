import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const defaultFrom = 'Trust Media <onboarding@resend.dev>';

export const sendResetPasswordEmail = async (email, resetUrl) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('[MAILER] RESEND_API_KEY not set. Password reset URL:', resetUrl);
    return true;
  }

  const from = process.env.MAIL_FROM || defaultFrom;

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Cliquez ici pour définir un nouveau mot de passe</a></p><p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>`,
    });
    console.log(`[MAILER] Reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('[MAILER] Resend send failed:', error?.message || error);
    return false;
  }
};
