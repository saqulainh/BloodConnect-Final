/**
 * Emergency Intelligence Map System (EIMS)
 * Socket.io Configuration
 */

import { Server } from "socket.io";
import User from "../models/User.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Change in production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("EIMS Socket Connected:", socket.id);

        // Optional: Keep track of online users via their MongoDB _id
        socket.on("register_user", async (userId) => {
            socket.userId = userId;
            socket.join(`user_${userId}`);

            // Mark user as online in DB (EIMS feature)
            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
                // Broadcast to map viewers that a donor came online
                io.emit("donorStatusChanged", { userId, isOnline: true });
            } catch (err) {
                console.error("Error setting online status", err);
            }
        });

        socket.on("disconnect", async () => {
            console.log("EIMS Socket Disconnected:", socket.id);
            if (socket.userId) {
                try {
                    await User.findByIdAndUpdate(socket.userId, { isOnline: false });
                    io.emit("donorStatusChanged", { userId: socket.userId, isOnline: false });
                } catch (err) {
                    console.error("Error setting offline status", err);
                }
            }
        });
    });

    return io;
};

// Global Emitter Methods
export const emitNewRequest = (requestData) => {
    if (io) {
        io.emit("newRequest", requestData);
        if (requestData.urgencyLevel === "critical") {
            io.emit("criticalAlert", requestData);
        }
    }
};

export const emitRequestUpdated = (requestData) => {
    if (io) io.emit("requestUpdated", requestData);
};

export const emitRequestResolved = (requestId) => {
    if (io) io.emit("requestResolved", requestId);
};

export const emitDonorStatusChanged = (donorData) => {
    if (io) io.emit("donorStatusChanged", donorData);
};
