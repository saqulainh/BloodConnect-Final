import Pusher from "pusher";
import dotenv from "dotenv";

dotenv.config();

let pusherInstance = null;

const getPusher = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true,
        });
    }
    return pusherInstance;
};

export default getPusher;
