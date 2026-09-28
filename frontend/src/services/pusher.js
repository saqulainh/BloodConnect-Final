import Pusher from "pusher-js";

// ── Singleton Pusher instance ──────────────────────────────────────────
let pusherInstance = null;

const getPusher = () => {
    if (!pusherInstance) {
        const key = import.meta.env.VITE_PUSHER_KEY;
        const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
        if (!key || !cluster) {
            console.warn("[Pusher] Missing VITE_PUSHER_KEY or VITE_PUSHER_CLUSTER; realtime disabled.");
            return null;
        }
        pusherInstance = new Pusher(key, {
            cluster,
        });
    }
    return pusherInstance;
};

/**
 * Subscribe to a user's private channel for real-time notifications.
 * Channel: user-{userId}
 * Events: blood-request-nearby, donation-confirmed, etc.
 *
 * @param {string} userId
 * @param {function} onEvent  — called with (eventName, data)
 * @returns {object} channel — call channel.unbind_all() + pusher.unsubscribe() to clean up
 */
export const subscribeToUserChannel = (userId, onEvent) => {
    const pusher = getPusher();
    if (!pusher) return null;
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    // Urgent blood request alert (backend emits 'blood-request')
    channel.bind("blood-request", (data) => onEvent("blood-request", data));
    // New chat message or message request
    channel.bind("new-message", (data) => onEvent("new-message", data));
    // Donation confirmed
    channel.bind("donation-confirmed", (data) => onEvent("donation-confirmed", data));
    // Incoming call (audio/video)
    channel.bind("incoming-call", (data) => onEvent("incoming-call", data));

    return channel;
};

/**
 * Unsubscribe from a channel and clean up bindings.
 * @param {object} channel — returned from subscribeToUserChannel
 * @param {string} userId
 */
export const unsubscribeFromUserChannel = (channel, userId) => {
    if (!channel) return;
    channel.unbind_all();
    getPusher()?.unsubscribe(`user-${userId}`);
};

export default getPusher;
