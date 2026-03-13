import cron from "node-cron";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { triggerNotification } from "../services/notificationService.js";
import { sendEmail } from "../utils/email.js";

// Run every 30 minutes to find urgent/critical requests and notify eligible donors
export const startBloodMatchWorker = () => {
    cron.schedule("*/30 * * * *", async () => {
        try {
            console.log("[AUTOMATCH CRON] Running automated donor matching...");

            // Find active urgent/critical requests
            const activeRequests = await Request.find({
                status: "Active",
                urgency: { $in: ["Urgent", "Critical"] }
            }).populate("requester", "name phone");

            let matchedRequestsCount = 0;

            for (const req of activeRequests) {
                // Determine eligibility and matching blood group
                let donorQuery = {
                    bloodGroup: req.bloodGroup,
                    availability: true,
                    eligibilityStatus: "eligible",
                    _id: { $ne: req.requester._id }
                };

                // If request has valid location, do a geo match up to 50km
                if (req.location && req.location.coordinates && req.location.coordinates.length === 2 && req.location.coordinates[0] !== 0) {
                    donorQuery.location = {
                        $geoWithin: {
                            $centerSphere: [req.location.coordinates, 50 / 6378.1]
                        }
                    };
                }

                // Limit to 10 donors to avoid spamming everyone
                const potentialDonors = await User.find(donorQuery).select("_id email name").limit(10);

                if (potentialDonors.length > 0) {
                    matchedRequestsCount++;

                    for (const donor of potentialDonors) {
                        // Send In-App Notification (Pusher)
                        triggerNotification({
                            userId: donor._id.toString(),
                            title: `Match! Urgent ${req.bloodGroup} Needed`,
                            message: `An urgent request for ${req.bloodGroup} at ${req.hospital} matches your profile. Can you help?`,
                            type: "match"
                        });
                    }

                    // Batch send emails
                    const emails = potentialDonors.map(d => d.email).join(",");
                    const subject = `URGENT MATCH: ${req.bloodGroup} Blood Needed Nearby`;
                    const html = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #dc2626;">Automatic Match Alert 🩸</h2>
                            <p>Hello Hero,</p>
                            <p>We found an active <strong>${req.urgency}</strong> blood request that matches your profile and location.</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Blood Group:</strong> ${req.bloodGroup}</p>
                                <p style="margin: 5px 0;"><strong>Hospital:</strong> ${req.hospital}</p>
                                <p style="margin: 5px 0;"><strong>Patient:</strong> ${req.patientName}</p>
                            </div>
                            <p>Every minute counts. Please log in to BloodConnect immediately to contact the requester and save a life.</p>
                        </div>
                    `;

                    try {
                        sendEmail(emails, subject, `Urgent ${req.bloodGroup} needed`, html);
                    } catch (err) {
                        console.error("Failed to batch send emails in worker", err);
                    }
                }
            }

            console.log(`[AUTOMATCH CRON] Finished. Matched donors for ${matchedRequestsCount} requests.`);
        } catch (error) {
            console.error("[AUTOMATCH CRON] Error running match worker:", error);
        }
    });
};
