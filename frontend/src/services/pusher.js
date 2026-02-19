import Pusher from "pusher-js";

// ── Singleton Pusher instance ──────────────────────────────────────────
let pusherInstance = null;

const getPusher = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
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
    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    // Urgent blood request alert (backend emits 'blood-request')
    channel.bind("blood-request", (data) => onEvent("blood-request", data));
    // New chat message or message request
    channel.bind("new-message", (data) => onEvent("new-message", data));
    // Donation confirmed
    channel.bind("donation-confirmed", (data) => onEvent("donation-confirmed", data));

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
    getPusher().unsubscribe(`user-${userId}`);
};

export default getPusher;
