import { Resend } from "resend";
import { env } from "@/config/env.config";
import { logger } from "@/utils/logger.util";

const resend = new Resend(env.RESEND_API_KEY);

interface SendMailArgs {
    to: string[];
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendMailArgs) => {
    const from = `Clause.ai <${env.MAIL_FROM}>`;

    // Skip sending email in development mode
    if (env.NODE_ENV !== "production") {
        logger.info({ from, to, subject, html }, "Email sent successfully");
        return { data: { id: `dev-${Date.now().toString()}` }, error: null };
    }

    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
    });

    return { data, error };
};
