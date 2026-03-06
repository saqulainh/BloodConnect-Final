import Inventory from "../models/Inventory.js";

// @desc    Get all inventory levels
// @route   GET /api/v1/inventory
// @access  Public
export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ bloodGroup: 1 });

        // If inventory is empty, initialize it with zero for all groups
        if (inventory.length === 0) {
            const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
            const newInventory = groups.map(group => ({ bloodGroup: group, units: 0 }));
            await Inventory.insertMany(newInventory);

            const refreshed = await Inventory.find().sort({ bloodGroup: 1 });
            return res.json({ success: true, data: refreshed });
        }

        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update inventory units for a specific blood group
// @route   PUT /api/v1/inventory/:id
// @access  Private/Admin
export const updateInventory = async (req, res) => {
    try {
        const { units } = req.body;

        if (units === undefined || units < 0) {
            return res.status(400).json({ success: false, message: "Valid units required" });
        }

        const inv = await Inventory.findById(req.params.id);
        if (!inv) {
            return res.status(404).json({ success: false, message: "Inventory record not found" });
        }

        inv.units = units;
        inv.lastUpdatedBy = req.user._id;

        await inv.save();

        res.json({ success: true, data: inv });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
