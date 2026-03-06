import Notification from "../models/Notification.js";
import { triggerGlobal, triggerUserEvent } from "./pusherService.js";

/**
 * Triggers a notification, saves it to the DB, and emits via Pusher
 * @param {Object} params 
 * @param {string} [params.userId] - Optional. ID of the user to notify. If omitted, it's a global broadcast.
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type='system'] - Type: system | broadcast | request | camp | match | reward
 * @param {string} [params.link] - Optional URL to redirect to
 */
export const triggerNotification = async ({ userId, title, message, type = "system", link }) => {
    try {
        const isGlobal = !userId;

        // 1. Save to database
        const notification = await Notification.create({
            user: userId || null,
            isGlobal,
            title,
            message,
            type,
            link
        });

        // 2. Emit real-time update via Pusher
        if (isGlobal) {
            triggerGlobal("newNotification", notification);
        } else {
            triggerUserEvent(userId, "newNotification", notification);
        }

        return notification;
    } catch (error) {
        console.error("Error triggering notification:", error);
        return null; // Fail silently so it doesn't break the main flow
    }
};
