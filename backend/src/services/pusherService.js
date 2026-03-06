import Pusher from "pusher";
import "dotenv/config";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

export const triggerEIMS = (event, data) => {
    pusher.trigger("eims-live", event, data);
};

export const triggerUserEvent = (userId, event, data) => {
    pusher.trigger(`user-${userId}`, event, data);
};

export const triggerGlobal = (event, data) => {
    pusher.trigger("global-events", event, data);
};

export default pusher;
