export function buildVerificationEmail(input: {
    verificationUrl: string;
}) {
    return {
        subject: "Verify your Uptrace email address",

        text: `Verify your Uptrace email address by visiting: ${input.verificationUrl}`,

        html: `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    
    <h1 style="margin: 0 0 16px; font-size: 28px; color: #111827;">
      Verify your email address
    </h1>

    <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563;">
      Thanks for creating your Uptrace account. Please verify your email
      address to activate your account.
    </p>

    <a
      href="${input.verificationUrl}"
      style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #111827;
        color: #ffffff;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
      "
    >
      Verify Email Address
    </a>

    <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
      This verification link will expire in 30 minutes.
    </p>

    <p style="margin: 16px 0 0; font-size: 13px; color: #9ca3af;">
      If you didn't create an Uptrace account, you can safely ignore this email.
    </p>

  </div>
`,
    };
}