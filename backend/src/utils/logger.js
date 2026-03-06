import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define rotation formats
const fileRotateTransport = new DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d", // Keep logs for 14 days
    maxSize: "20m", // Rotate when file size exceeds 20MB
    level: "info",
    zippedArchive: true, // Compress rotated files
});

const errorRotateTransport = new DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "30d", // Keep error logs for 30 days
    maxSize: "20m",
    level: "error", // Only log errors here
    zippedArchive: true,
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: logFormat,
    defaultMeta: { service: "bloodconnect-api" },
    transports: [
        fileRotateTransport,
        errorRotateTransport,
    ],
});

// Always log to console in development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ level, message, timestamp, stack }) => {
                        if (stack) {
                            return `${timestamp} ${level}: ${message}\n${stack}`;
                        }
                        return `${timestamp} ${level}: ${message}`;
                    }
                )
            ),
        })
    );
}

export default logger;
