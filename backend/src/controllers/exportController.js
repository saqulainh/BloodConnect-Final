import User from "../models/User.js";
import Request from "../models/Request.js";

// Helper to escape CSV values
const escapeCsv = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
};

// @desc    Export Users Data as CSV
// @route   GET /api/v1/export/users
// @access  Private/Admin
export const exportUsersData = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        const hdrs = ["ID", "Name", "Email", "Phone", "Role", "Blood Group", "City", "Eligibility", "Aadhaar Verified", "Created At"];
        let csv = hdrs.map(escapeCsv).join(",") + "\n";

        users.forEach(u => {
            const row = [
                u._id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.bloodGroup,
                u.city || "",
                u.eligibilityStatus,
                u.aadhaarVerified ? "Yes" : "No",
                u.createdAt ? u.createdAt.toISOString() : ""
            ];
            csv += row.map(escapeCsv).join(",") + "\n";
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('users_export.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Export Users error:", error);
        res.status(500).json({ success: false, message: "Failed to export users data." });
    }
};

// @desc    Export Requests Data as CSV
// @route   GET /api/v1/export/requests
// @access  Private/Admin
export const exportRequestsData = async (req, res) => {
    try {
        const requests = await Request.find({}).populate("requester", "name email phone").sort({ createdAt: -1 });

        const hdrs = ["Request ID", "Requester Name", "Requester Phone", "Patient Name", "Blood Group", "Hospital", "Units", "Urgency", "Status", "Created At"];
        let csv = hdrs.map(escapeCsv).join(",") + "\n";

        requests.forEach(r => {
            const row = [
                r._id,
                r.requester ? r.requester.name : "Unknown",
                r.requester ? r.requester.phone : "Unknown",
                r.patientName,
                r.bloodGroup,
                r.hospital,
                r.units,
                r.urgency,
                r.status,
                r.createdAt ? r.createdAt.toISOString() : ""
            ];
            csv += row.map(escapeCsv).join(",") + "\n";
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('requests_export.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Export Requests error:", error);
        res.status(500).json({ success: false, message: "Failed to export requests data." });
    }
};
