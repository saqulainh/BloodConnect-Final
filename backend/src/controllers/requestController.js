import Request from "../models/Request.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

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

        const createdRequest = await request.save();

        // ── AUTOMATED URGENT NOTIFICATIONS ──
        if (urgency === "Critical" || urgency === "High" || urgency === "Normal") {
            try {
                // Find available donors with the same blood group, except the requester
                const potentialDonors = await User.find({
                    bloodGroup: bloodGroup,
                    availability: true,
                    _id: { $ne: req.user._id }
                }).select("email name");

                if (potentialDonors.length > 0) {
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

                    // Send Email asynchronously (fire and forget so UI doesn't hang)
                    sendEmail(emails, subject, `Urgent: ${bloodGroup} needed at ${hospital}`, html)
                        .then(() => console.log(`Alert emails sent to ${potentialDonors.length} donors.`))
                        .catch(err => console.error("Failed to send urgent emails", err));
                }
            } catch (err) {
                console.error("Error in automated notification system:", err);
            }
        }

        res.status(201).json({ success: true, data: createdRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

        request.patientName = patientName || request.patientName;
        request.bloodGroup = bloodGroup || request.bloodGroup;
        request.hospital = hospital || request.hospital;
        request.urgency = urgency || request.urgency;
        request.units = units || request.units;
        if (status) request.status = status;

        const updatedRequest = await request.save();
        res.json({ success: true, data: updatedRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
