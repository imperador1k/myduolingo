import { db } from "@/db/drizzle";
import { notifications } from "@/db/schema";

export const createNotification = async (
    userId: string,
    type: string,
    message: string,
    link?: string
) => {
    // Action 1: Insert into the database
    try {
        await db.insert(notifications).values({
            userId,
            type,
            message,
            link,
            read: false,
        });
    } catch (dbError) {
        console.error("Failed to insert notification into DB:", dbError);
        // If DB insert fails, we probably shouldn't send the push to avoid desync, or we can choose to proceed.
        // Let's proceed to try sending the push anyway.
    }

    // Action 2: Trigger OneSignal Push Notification
    try {
        const appId = process.env.ONESIGNAL_APP_ID;
        const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

        if (!appId || !restApiKey) {
            console.warn("OneSignal credentials missing, skipping push notification.");
            return;
        }

        const payload = {
            app_id: appId,
            include_external_user_ids: [userId],
            contents: {
                en: message,
                pt: message, // Support multiple natively if needed, but defaulting context to pt
            },
            // Optionally pass the link so opening the push redirects the user
            ...(link ? { url: link } : {}),
        };

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${restApiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OneSignal API Error:", errorData);
        } else {
            console.log("Push notification sent successfully to user:", userId);
        }
    } catch (osError) {
        console.error("Failed to send OneSignal push notification:", osError);
    }
};
