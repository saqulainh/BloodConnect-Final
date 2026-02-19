import Request from "../models/Request.js";
// import Pusher from "pusher"; // Uncomment if using Pusher

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

        // Trigger Pusher event here (optional for now)

        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createRequest, getRequests };
