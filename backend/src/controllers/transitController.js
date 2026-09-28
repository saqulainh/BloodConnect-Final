import BloodTransit from "../models/BloodTransit.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

// Haversine distance calculator in KM
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
};

// Generate 4 digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Generate tamper-evident seal number
const generateSeal = () => `BC-COLD-${Math.floor(100000 + Math.random() * 900000)}`;

// @desc    Create a new blood transit dispatch
// @route   POST /api/v1/transits
// @access  Private
export const createTransit = async (req, res) => {
    try {
        const {
            requestId,
            patientName,
            hospitalName,
            bloodGroup,
            units,
            pickupLocation,
            destinationLocation,
            notes
        } = req.body;

        // Default coordinates if not provided (e.g., AIIMS New Delhi region as standard baseline)
        const pickup = pickupLocation || {
            address: "Red Cross Regional Blood Center, Connaught Place",
            lat: 28.6315,
            lng: 77.2167
        };

        const destination = destinationLocation || {
            hospital: hospitalName || "AIIMS Trauma Center, New Delhi",
            address: "Ring Road, Ansari Nagar, New Delhi",
            lat: 28.5672,
            lng: 77.2100
        };

        const dist = calculateDistanceKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
        const eta = Math.max(2, Math.round((dist / 25) * 60)); // ~25 km/h urban courier speed

        const transit = new BloodTransit({
            requestId: requestId || undefined,
            receiver: req.user._id,
            patientName: patientName || "Emergency Patient",
            donorName: req.body.donorName || "Verified Blood Donor",
            hospitalName: destination.hospital || hospitalName || "Apex Emergency Hospital",
            bloodGroup: bloodGroup || "O+",
            units: units || 1,
            pickupLocation: pickup,
            destinationLocation: destination,
            currentLocation: {
                lat: pickup.lat,
                lng: pickup.lng,
                updatedAt: new Date()
            },
            coldChain: {
                currentTemp: 4.0,
                minTemp: 2.0,
                maxTemp: 6.0,
                status: "safe",
                sealNumber: generateSeal(),
                tempLogs: [{ temp: 4.0, status: "safe", timestamp: new Date() }]
            },
            pickupOtp: generateOtp(),
            deliveryOtp: generateOtp(),
            distanceKm: dist,
            etaMinutes: eta,
            notes: notes || "Urgent whole blood transit required.",
            status: "pending_pickup",
            timeline: [{
                status: "pending_pickup",
                title: "Transit Initiated",
                description: `Dispatch created for ${bloodGroup || "O+"} blood. Finding nearest volunteer transporter.`,
                timestamp: new Date()
            }]
        });

        const savedTransit = await transit.save();
        res.status(201).json({ success: true, data: savedTransit });
    } catch (error) {
        console.error("Error creating transit:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all available transits waiting for a transporter
// @route   GET /api/v1/transits/available
// @access  Private
export const getAvailableTransits = async (req, res) => {
    try {
        const transits = await BloodTransit.find({ status: "pending_pickup" })
            .populate("receiver", "name phone email")
            .populate("donor", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: transits.length, data: transits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Transporter accepts a blood transit job
// @route   PATCH /api/v1/transits/:id/accept
// @access  Private (transporter)
export const acceptTransit = async (req, res) => {
    try {
        const transit = await BloodTransit.findById(req.params.id);
        if (!transit) {
            return res.status(404).json({ success: false, message: "Transit not found" });
        }

        if (transit.status !== "pending_pickup") {
            return res.status(400).json({ success: false, message: `Cannot accept transit in '${transit.status}' status.` });
        }

        transit.transporter = req.user._id;
        transit.status = "assigned";
        transit.timeline.push({
            status: "assigned",
            title: "Transporter Assigned",
            description: `${req.user.name} has accepted this blood courier mission.`,
            timestamp: new Date()
        });

        await transit.save();
        const updated = await BloodTransit.findById(transit._id)
            .populate("transporter", "name phone email")
            .populate("receiver", "name phone email");

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Pickup OTP and start transit
// @route   PATCH /api/v1/transits/:id/pickup
// @access  Private (transporter)
export const verifyPickup = async (req, res) => {
    try {
        const { otp } = req.body;
        const transit = await BloodTransit.findById(req.params.id);
        if (!transit) {
            return res.status(404).json({ success: false, message: "Transit not found" });
        }

        if (transit.pickupOtp !== otp?.trim()) {
            return res.status(400).json({ success: false, message: "Invalid Pickup OTP. Please get OTP from blood donor." });
        }

        transit.status = "in_transit";
        transit.pickedUpAt = new Date();
        transit.timeline.push({
            status: "in_transit",
            title: "Blood Picked Up & En Route",
            description: `Cold-chain seal ${transit.coldChain.sealNumber} secured. Volunteer is en route to hospital.`,
            timestamp: new Date()
        });

        await transit.save();
        res.status(200).json({ success: true, data: transit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update live GPS coordinates, cold-chain temperature, and recalculate ETA
// @route   PATCH /api/v1/transits/:id/location
// @access  Private (transporter)
export const updateLocationAndTemp = async (req, res) => {
    try {
        const { lat, lng, currentTemp, heading } = req.body;
        const transit = await BloodTransit.findById(req.params.id);
        if (!transit) {
            return res.status(404).json({ success: false, message: "Transit not found" });
        }

        if (lat !== undefined && lng !== undefined) {
            transit.currentLocation = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                updatedAt: new Date(),
                heading: heading || transit.currentLocation?.heading || 0
            };

            // Recalculate remaining distance to hospital
            const remainingDist = calculateDistanceKm(
                parseFloat(lat),
                parseFloat(lng),
                transit.destinationLocation.lat,
                transit.destinationLocation.lng
            );
            transit.distanceKm = remainingDist;
            // ETA in minutes
            transit.etaMinutes = Math.max(1, Math.round((remainingDist / 25) * 60));
        }

        // Temperature update & cold-chain validation
        if (currentTemp !== undefined) {
            const tempVal = parseFloat(currentTemp);
            let status = "safe";
            if (tempVal < 2.0 || tempVal > 6.0) {
                status = "breached";
            } else if (tempVal < 2.5 || tempVal > 5.5) {
                status = "warning";
            }

            transit.coldChain.currentTemp = tempVal;
            transit.coldChain.status = status;
            transit.coldChain.tempLogs.push({
                temp: tempVal,
                status,
                timestamp: new Date()
            });

            // Keep log size bounded to last 50 entries
            if (transit.coldChain.tempLogs.length > 50) {
                transit.coldChain.tempLogs.shift();
            }
        }

        await transit.save();
        res.status(200).json({ success: true, data: transit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Delivery OTP at hospital and mark delivered
// @route   PATCH /api/v1/transits/:id/deliver
// @access  Private (transporter)
export const verifyDelivery = async (req, res) => {
    try {
        const { otp } = req.body;
        const transit = await BloodTransit.findById(req.params.id);
        if (!transit) {
            return res.status(404).json({ success: false, message: "Transit not found" });
        }

        if (transit.deliveryOtp !== otp?.trim()) {
            return res.status(400).json({ success: false, message: "Invalid Delivery OTP. Please get OTP from hospital staff." });
        }

        transit.status = "delivered";
        transit.etaMinutes = 0;
        transit.deliveredAt = new Date();
        transit.timeline.push({
            status: "delivered",
            title: "Blood Delivered Safely",
            description: "Blood bag handed over to Hospital Blood Bank. Cold-chain intact.",
            timestamp: new Date()
        });

        await transit.save();
        res.status(200).json({ success: true, data: transit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get active transit for current user (or auto-seed demo transit for immediate testing)
// @route   GET /api/v1/transits/active
// @access  Private
export const getActiveTransit = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {
            status: { $in: ["pending_pickup", "assigned", "en_route_pickup", "picked_up", "in_transit"] }
        };

        if (role === "transporter") {
            query.transporter = userId;
        } else if (role === "receiver") {
            query.receiver = userId;
        } else if (role === "donor") {
            query.donor = userId;
        }

        let activeTransit = await BloodTransit.findOne(query)
            .populate("transporter", "name phone email")
            .populate("receiver", "name phone email")
            .populate("donor", "name phone email")
            .sort({ updatedAt: -1 });

        // If no active transit is explicitly assigned to this user, check if any active transit exists in system
        if (!activeTransit) {
            activeTransit = await BloodTransit.findOne({
                status: { $in: ["pending_pickup", "assigned", "in_transit"] }
            })
            .populate("transporter", "name phone email")
            .populate("receiver", "name phone email")
            .populate("donor", "name phone email")
            .sort({ updatedAt: -1 });
        }

        // If still nothing, create a realistic live demonstration transit automatically
        if (!activeTransit) {
            const pickup = {
                address: "Red Cross Blood Center, Central Hub",
                lat: 28.6315,
                lng: 77.2167
            };
            const destination = {
                hospital: "City Heart Care Hospital & Blood Bank",
                address: "Main Ring Road, Health District",
                lat: 28.5672,
                lng: 77.2100
            };
            const dist = calculateDistanceKm(pickup.lat, pickup.lng, destination.lat, destination.lng);

            activeTransit = new BloodTransit({
                receiver: userId,
                transporter: role === "transporter" ? userId : undefined,
                patientName: "Emergency ICU Patient #402",
                donorName: "Rahul Sharma (Volunteer)",
                hospitalName: destination.hospital,
                bloodGroup: "O+",
                units: 2,
                status: role === "transporter" ? "in_transit" : "in_transit",
                pickupLocation: pickup,
                destinationLocation: destination,
                currentLocation: {
                    lat: 28.5990, // mid-way point
                    lng: 77.2135,
                    updatedAt: new Date(),
                    heading: 185
                },
                coldChain: {
                    currentTemp: 3.8,
                    minTemp: 2.0,
                    maxTemp: 6.0,
                    status: "safe",
                    sealNumber: generateSeal(),
                    tempLogs: [
                        { temp: 3.7, status: "safe", timestamp: new Date(Date.now() - 600000) },
                        { temp: 3.8, status: "safe", timestamp: new Date() }
                    ]
                },
                pickupOtp: "4829",
                deliveryOtp: "7193",
                etaMinutes: 10, // "Blood 10 min door hai"
                distanceKm: 2.8,
                notes: "Critical emergency request - maintain cold-chain under 6°C.",
                timeline: [
                    { status: "pending_pickup", title: "Transit Initiated", description: "Blood requested by ICU unit", timestamp: new Date(Date.now() - 1200000) },
                    { status: "assigned", title: "Transporter Assigned", description: "Amit Kumar (Volunteer Courier) accepted", timestamp: new Date(Date.now() - 900000) },
                    { status: "in_transit", title: "Picked Up & In Transit", description: "Secured in active medical ice-box", timestamp: new Date(Date.now() - 400000) }
                ]
            });
            await activeTransit.save();
            await activeTransit.populate("receiver", "name phone email");
        }

        res.status(200).json({ success: true, data: activeTransit });
    } catch (error) {
        console.error("Error in getActiveTransit:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get transit by ID
// @route   GET /api/v1/transits/:id
// @access  Private
export const getTransitById = async (req, res) => {
    try {
        const transit = await BloodTransit.findById(req.params.id)
            .populate("transporter", "name phone email")
            .populate("receiver", "name phone email")
            .populate("donor", "name phone email");

        if (!transit) {
            return res.status(404).json({ success: false, message: "Transit not found" });
        }

        res.status(200).json({ success: true, data: transit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
