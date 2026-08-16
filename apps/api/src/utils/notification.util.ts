import { NotificationType } from "@clause-ai/constants";

export const getTemplate = (
    type: NotificationType,
    data: Record<string, any>,
) => {
    const { otp, expiryMins } = data;

    const map: Record<NotificationType, { subject: string; html: string }> = {
        OTP: {
            subject: "Verify your email address",
            html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
                        <tr>
                            <td align="center">
                            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                                <tr>
                                <td style="padding:32px 40px 16px;text-align:center;">
                                    <h1 style="margin:0;font-size:20px;color:#111827;">Your Verification Code</h1>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:8px 40px 24px;text-align:center;color:#4b5563;font-size:14px;line-height:1.5;">
                                    Use the code below to verify your identity. This code will expire in <strong>${expiryMins} minutes</strong>.
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:0 40px 24px;text-align:center;">
                                    <div style="display:inline-block;background:#f3f4f6;border-radius:6px;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#111827;">
                                    ${otp}
                                    </div>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:0 40px 32px;text-align:center;color:#9ca3af;font-size:13px;line-height:1.5;">
                                    If you didn't request this code, you can safely ignore this email.
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
                                    © 2026 Clause AI. All rights reserved.
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>
                    </table>`,
        },
    };

    return map[type];
};
