import { logger } from "@/utils/logger.util";
import { getTemplate } from "@/utils/notification.util";
import { NotificationType } from "@clause-ai/constants";
import { sendEmail } from "../infra/mail.client";

/**
 * Sends email notification to users.
 */
export const sendEmailNotification = async (
    email: string,
    type: NotificationType,
    data: Record<string, any>,
) => {
    if (!email) {
        logger.error("Email is missing, cannot send email notification");
        return;
    }
    if (!type) {
        logger.error(
            "Notification type is missing, cannot send email notification",
        );
        return;
    }

    if (!data) {
        logger.error(
            "Notification data is missing, cannot send email notification",
        );
        return;
    }

    const template = getTemplate(type, data);
    if (!template) {
        logger.error({ type }, "Template not found for notification type");
        return;
    }

    try {
        // Send email
        const { data, error } = await sendEmail({
            to: [email],
            subject: template.subject,
            html: template.html,
        });

        if (error) {
            logger.error({ email }, `Failed to send email: ${error.message}`);
            return;
        }

        if (data) {
            logger.info(
                { mailResponseId: data.id, email },
                `Email sent successfully`,
            );
        }
    } catch (error: any) {
        logger.error(
            {
                email,
                type,
            },
            error.message,
        );
    }
};
