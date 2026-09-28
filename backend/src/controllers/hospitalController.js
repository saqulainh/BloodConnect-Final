import Hospital from "../models/Hospital.js";

const DEFAULT_HOSPITALS = [
  {
    name: "AIIMS Main Blood Bank & Transfusion Medicine",
    category: "Government Hospital",
    licenseNumber: "DL-BB-AIIMS-001",
    contactNumber: "+91-11-26588500",
    emergencyNumber: "+91-11-26594700",
    email: "bloodbank@aiims.edu",
    address: "Ansari Nagar East, Ring Road, Near AIIMS Metro Station",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    operatingHours: "24x7 Round the Clock",
    isVerified: true,
    bloodStock: {
      "A+": 42,
      "A-": 8,
      "B+": 65,
      "B-": 12,
      "AB+": 28,
      "AB-": 5,
      "O+": 85,
      "O-": 16,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Safdarjung Hospital Regional Blood Transfusion Centre",
    category: "Government Hospital",
    licenseNumber: "DL-BB-SJH-014",
    contactNumber: "+91-11-26165060",
    emergencyNumber: "+91-11-26165033",
    email: "bloodbank@vmmc-sjh.nic.in",
    address: "Ring Road, Opposite AIIMS, Safdarjung Enclave",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110029",
    operatingHours: "24x7 Services",
    isVerified: true,
    bloodStock: {
      "A+": 31,
      "A-": 4,
      "B+": 48,
      "B-": 6,
      "AB+": 19,
      "AB-": 2,
      "O+": 54,
      "O-": 9,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Indian Red Cross Society National Headquarters Blood Centre",
    category: "Red Cross Blood Bank",
    licenseNumber: "DL-BB-IRCS-002",
    contactNumber: "+91-11-23711551",
    emergencyNumber: "+91-11-23716441",
    email: "bloodbank@indianredcross.org",
    address: "1, Red Cross Road, Sansad Marg, Near Parliament House",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    operatingHours: "24x7 Services",
    isVerified: true,
    bloodStock: {
      "A+": 55,
      "A-": 15,
      "B+": 80,
      "B-": 18,
      "AB+": 35,
      "AB-": 7,
      "O+": 92,
      "O-": 22,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "KEM Hospital & Seth GS Medical College Blood Bank",
    category: "Government Hospital",
    licenseNumber: "MH-BB-KEM-019",
    contactNumber: "+91-22-24107000",
    emergencyNumber: "+91-22-24136051",
    email: "transfusion@kem.edu",
    address: "Acharya Donde Marg, Parel",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400012",
    operatingHours: "24x7 Emergency Services",
    isVerified: true,
    bloodStock: {
      "A+": 38,
      "A-": 6,
      "B+": 58,
      "B-": 9,
      "AB+": 24,
      "AB-": 4,
      "O+": 70,
      "O-": 11,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Tata Memorial Hospital Blood Bank & Advanced Centre",
    category: "Government Hospital",
    licenseNumber: "MH-BB-TMH-008",
    contactNumber: "+91-22-24177000",
    emergencyNumber: "+91-22-24177180",
    email: "bloodcentre@tmc.gov.in",
    address: "Dr. E Borges Road, Parel East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400012",
    operatingHours: "24x7 Services",
    isVerified: true,
    bloodStock: {
      "A+": 29,
      "A-": 12,
      "B+": 44,
      "B-": 14,
      "AB+": 16,
      "AB-": 5,
      "O+": 62,
      "O-": 19,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Victoria Hospital & Bangalore Medical College Blood Bank",
    category: "Government Hospital",
    licenseNumber: "KA-BB-BMC-003",
    contactNumber: "+91-80-26701150",
    emergencyNumber: "+91-80-26701166",
    email: "bloodbank@bmcribangalore.edu.in",
    address: "Fort Road, Near City Market, Kalasipalya",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560002",
    operatingHours: "24x7 Emergency Services",
    isVerified: true,
    bloodStock: {
      "A+": 34,
      "A-": 7,
      "B+": 52,
      "B-": 8,
      "AB+": 21,
      "AB-": 3,
      "O+": 66,
      "O-": 14,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Rashtrotthana Blood Centre",
    category: "Charitable Blood Bank",
    licenseNumber: "KA-BB-RBC-021",
    contactNumber: "+91-80-26612730",
    emergencyNumber: "+91-80-26612731",
    email: "info@rashtrotthanabloodbank.com",
    address: "Kempegowda Nagar, Chamarajpet",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560019",
    operatingHours: "24x7 Blood Issue Counter",
    isVerified: true,
    bloodStock: {
      "A+": 48,
      "A-": 11,
      "B+": 72,
      "B-": 15,
      "AB+": 30,
      "AB-": 6,
      "O+": 88,
      "O-": 20,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Apollo Main Hospital Blood Centre",
    category: "Private Hospital",
    licenseNumber: "TN-BB-APO-012",
    contactNumber: "+91-44-28290200",
    emergencyNumber: "+91-44-28293333",
    email: "bloodbank_chennai@apollohospitals.com",
    address: "21 Greams Lane, Thousand Lights West",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600006",
    operatingHours: "24x7 Hospital Services",
    isVerified: true,
    bloodStock: {
      "A+": 26,
      "A-": 5,
      "B+": 39,
      "B-": 6,
      "AB+": 18,
      "AB-": 3,
      "O+": 50,
      "O-": 8,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Nizam's Institute of Medical Sciences (NIMS) Blood Centre",
    category: "Government Hospital",
    licenseNumber: "TS-BB-NIMS-005",
    contactNumber: "+91-40-23489000",
    emergencyNumber: "+91-40-23489244",
    email: "transfusion@nims.edu.in",
    address: "Punjagutta, Somajiguda",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500082",
    operatingHours: "24x7 Services",
    isVerified: true,
    bloodStock: {
      "A+": 37,
      "A-": 9,
      "B+": 59,
      "B-": 11,
      "AB+": 23,
      "AB-": 4,
      "O+": 74,
      "O-": 15,
    },
    lastStockUpdated: new Date(),
  },
  {
    name: "Medical College & Hospital Blood Bank",
    category: "Government Hospital",
    licenseNumber: "WB-BB-MCH-001",
    contactNumber: "+91-33-22551624",
    emergencyNumber: "+91-33-22551600",
    email: "bloodcentre@mchkolkata.org",
    address: "88 College Street, College Square",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700073",
    operatingHours: "24x7 Services",
    isVerified: true,
    bloodStock: {
      "A+": 40,
      "A-": 8,
      "B+": 63,
      "B-": 10,
      "AB+": 25,
      "AB-": 5,
      "O+": 81,
      "O-": 13,
    },
    lastStockUpdated: new Date(),
  },
];

// Helper to seed automatically if empty
const ensureSeedData = async () => {
  try {
    const count = await Hospital.countDocuments();
    if (count === 0) {
      await Hospital.insertMany(DEFAULT_HOSPITALS);
      console.log(`[Hospital Seed] Successfully seeded ${DEFAULT_HOSPITALS.length} accredited hospitals.`);
    }
  } catch (err) {
    console.error("[Hospital Seed] Error auto-seeding:", err.message);
  }
};

/**
 * @desc Get all verified hospitals and blood banks with live stock
 * @route GET /api/v1/hospitals
 * @access Public
 */
export const getHospitals = async (req, res) => {
  try {
    await ensureSeedData();

    const { search, city, bloodGroup, category } = req.query;
    const filter = { isVerified: true };

    if (city && city.trim() !== "" && city.toLowerCase() !== "all") {
      filter.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
      filter.category = category.trim();
    }

    if (bloodGroup && bloodGroup.trim() !== "") {
      const field = `bloodStock.${bloodGroup.trim()}`;
      filter[field] = { $gt: 0 };
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { address: regex },
        { city: regex },
        { state: regex },
        { pincode: regex },
      ];
    }

    const hospitals = await Hospital.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error("Error in getHospitals:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals & blood banks",
      error: error.message,
    });
  }
};

/**
 * @desc Get distinct cities of available institutions
 * @route GET /api/v1/hospitals/cities
 * @access Public
 */
export const getHospitalCities = async (req, res) => {
  try {
    await ensureSeedData();
    const cities = await Hospital.distinct("city", { isVerified: true });
    return res.status(200).json({
      success: true,
      data: cities.sort(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

/**
 * @desc Get a single hospital by ID
 * @route GET /api/v1/hospitals/:id
 * @access Public
 */
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital/Blood Bank not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching hospital details",
      error: error.message,
    });
  }
};

/**
 * @desc Update hospital blood stock
 * @route PATCH /api/v1/hospitals/:id/stock
 * @access Protected (Admin / Authorized Staff)
 */
export const updateHospitalStock = async (req, res) => {
  try {
    const { bloodStock } = req.body;
    if (!bloodStock || typeof bloodStock !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid blood stock payload provided",
      });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Merge new bloodStock values
    for (const [group, units] of Object.entries(bloodStock)) {
      if (typeof units === "number" && units >= 0) {
        hospital.bloodStock[group] = units;
      }
    }

    hospital.lastStockUpdated = new Date();
    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Blood stock updated successfully",
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating blood stock",
      error: error.message,
    });
  }
};
