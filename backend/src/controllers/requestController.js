import Request from "../models/Request.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { calculateUrgency } from "../services/urgencyEngine.js";
import { triggerNotification } from "../services/notificationService.js";

// @desc    Create a blood request
// @route   POST /api/v1/requests
// @access  Private
const createRequest = async (req, res) => {
    try {
        const { patientName, bloodGroup, hospital, urgency, units, lat, lng } = req.body;

        const request = new Request({
            requester: req.user._id,
            patientName,
            bloodGroup,
            hospital,
            urgency,
            units,
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
            }
        });

        // EIMS: Calculate AI Urgency Score and Level
        const urgencyData = calculateUrgency(request);
        request.urgencyScore = urgencyData.urgencyScore;
        request.urgencyLevel = urgencyData.urgencyLevel;

        const createdRequest = await request.save();

        res.status(201).json({ success: true, data: createdRequest });

        // ── AUTOMATED URGENT NOTIFICATIONS (Async Fire-and-Forget) ──
        if (urgency === "Critical" || urgency === "High" || urgency === "Normal") {
            try {
                // Find available donors with the same blood group, except the requester
                const potentialDonors = await User.find({
                    bloodGroup: bloodGroup,
                    availability: true,
                    _id: { $ne: req.user._id }
                }).select("email name _id");

                if (potentialDonors.length > 0) {
                    // 1. Send In-App Notifications
                    potentialDonors.forEach(donor => {
                        triggerNotification({
                            userId: donor._id,
                            title: `Urgent: ${bloodGroup} Needed`,
                            message: `A new ${urgency} request for ${bloodGroup} blood at ${hospital}.`,
                            type: "request"
                        });
                    });

                    // 2. Send Emails
                    const emails = potentialDonors.map(donor => donor.email).join(",");
                    const subject = `URGENT: ${bloodGroup} Blood Needed at ${hospital}`;
                    const html = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #dc2626;">Urgent Blood Request Alert</h2>
                            <p>Hello Donor,</p>
                            <p>A new <strong>${urgency}</strong> request for <strong>${bloodGroup}</strong> blood has just been posted near you.</p>
                            
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Patient Name:</strong> ${patientName}</p>
                                <p style="margin: 5px 0;"><strong>Hospital:</strong> ${hospital}</p>
                                <p style="margin: 5px 0;"><strong>Units Required:</strong> ${units}</p>
                            </div>
                            
                            <p>If you are able to donate, please log in to BloodConnect immediately to contact the requester.</p>
                            <br/>
                            <p>Thank you for being a lifesaver!</p>
                            <p><strong>- The BloodConnect Team</strong></p>
                        </div>
                    `;

                    sendEmail(emails, subject, `Urgent: ${bloodGroup} needed at ${hospital}`, html)
                        .then(() => console.log(`Alert emails sent to ${potentialDonors.length} donors.`))
                        .catch(err => console.error("Failed to send urgent emails", err));
                }
            } catch (err) {
                console.error("Error in automated notification system:", err);
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// @desc    Get all requests (or filter by nearness)
// @route   GET /api/v1/requests
// @access  Private
const getRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: "Active" })
            .populate("requester", "name phone")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a blood request
// @route   PUT /api/v1/requests/:id
// @access  Private
const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this request" });
        }

        const { patientName, bloodGroup, hospital, urgency, units, status } = req.body;

        const originalStatus = request.status;

        request.patientName = patientName || request.patientName;
        request.bloodGroup = bloodGroup || request.bloodGroup;
        request.hospital = hospital || request.hospital;
        request.urgency = urgency || request.urgency;
        request.units = units || request.units;
        if (status) request.status = status;

        const updatedRequest = await request.save();

        res.json({ success: true, data: updatedRequest });

        // ── NOTIFICATIONS ON STATUS CHANGE (Async Fire-and-Forget) ──
        if (status && status !== originalStatus) {
            try {
                // Determine message based on status change
                let title = "Request Update";
                let message = `Your request for ${request.bloodGroup} at ${request.hospital} was updated.`;
                let type = "system";

                if (status === "Completed") {
                    title = "Request Fulfilled!";
                    message = `Your request for ${request.bloodGroup} blood at ${request.hospital} has been marked as Completed.`;
                    type = "match";
                } else if (status === "Cancelled") {
                    title = "Request Cancelled";
                    message = `Your request for ${request.bloodGroup} blood at ${request.hospital} has been Cancelled.`;
                }

                // In-app Notification to the Requester
                triggerNotification({
                    userId: request.requester.toString(),
                    title,
                    message,
                    type
                });

                // Email Notification to the Requester
                const requesterUser = await User.findById(request.requester).select("email name");
                if (requesterUser?.email) {
                    const html = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #2563eb;">${title}</h2>
                            <p>Hello ${requesterUser.name},</p>
                            <p>${message}</p>
                            <br/>
                            <p>Thank you for using BloodConnect.</p>
                            <p><strong>- The BloodConnect Team</strong></p>
                        </div>
                    `;
                    sendEmail(requesterUser.email, `BloodConnect: ${title}`, message, html)
                        .then(() => console.log(`Status update email sent to ${requesterUser.email}.`))
                        .catch(err => console.error("Failed to send status update email", err));
                }
            } catch (err) {
                console.error("Error sending status update notification:", err);
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// @desc    Delete a blood request
// @route   DELETE /api/v1/requests/:id
// @access  Private
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this request" });
        }

        await request.deleteOne();
        res.json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { createRequest, getRequests, updateRequest, deleteRequest };
