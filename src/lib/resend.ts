import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const FROM = 'Veronica Carpenter <veronica@blissfulbutterflyyoga.com>';
const SITE_URL = import.meta.env.PUBLIC_SITE_URL ?? 'https://blissfulbutterflyyoga.com';

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo: replyTo ?? 'veronica@blissfulbutterflyyoga.com',
  });
}

export async function notifyNewMessage(
  senderName: string,
  messageId: string,
) {
  return sendEmail({
    to: 'veronica@blissfulbutterflyyoga.com',
    subject: `New message from ${senderName} — Blissful Butterfly Yoga`,
    html: `
      <p>You have a new message from <strong>${senderName}</strong>.</p>
      <p><a href="${SITE_URL}/admin/messages/${messageId}">View and reply →</a></p>
    `,
  });
}

export async function notifyNewSubscriber(email: string, source: string) {
  return sendEmail({
    to: 'veronica@blissfulbutterflyyoga.com',
    subject: `New subscriber: ${email}`,
    html: `<p><strong>${email}</strong> just subscribed via <em>${source}</em>.</p>`,
  });
}

export async function sendWelcomeEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: `Welcome to Blissful Butterfly Yoga!`,
    html: `
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for joining the Blissful Butterfly Yoga community.</p>
      <p>Your free Root Chakra Mini-Course is on its way. Keep an eye on your inbox!</p>
      <p>With love,<br/>Veronica</p>
    `,
  });
}
