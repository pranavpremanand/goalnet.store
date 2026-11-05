This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contact form email

The contact form stores submissions in MongoDB and sends notifications to `contactgoalnet@gmail.com`. Configure these server-only environment variables to enable email delivery:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

`SMTP_FROM` is optional and defaults to `SMTP_USER`. For Gmail, use an app password rather than your account password. Without SMTP configuration, form messages are still saved and visible in the admin contact messages page, but notification emails are not delivered.

## Order notification email

Order notifications use Resend after successful payment confirmation (including the Razorpay webhook fallback) and after a customer cancellation. Set `RESEND_API_KEY` in the server environment and optionally set `RESEND_FROM_EMAIL` to a sender address on a verified Resend domain. The default `onboarding@resend.dev` sender is for Resend testing only. Notification records prevent duplicate messages when Razorpay retries webhook events.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
