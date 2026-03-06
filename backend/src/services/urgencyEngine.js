/**
 * Emergency Intelligence Map System (EIMS)
 * AI Urgency Score Engine
 */

const calculateUrgency = (request) => {
    let score = 0;

    // 1. Time Factor (minutes since posted * 0.2 approx, capped for sanity)
    // For a newly created request, this will initially be 0.
    // Recalculations via cron will increase this over time.
    const now = new Date();
    const postedTime = request.createdAt ? new Date(request.createdAt) : now;
    const diffInMinutes = Math.floor((now - postedTime) / 1000 / 60);
    // Cap time factor to prevent runaway scores (e.g., max 50 points from time = 250 minutes)
    score += Math.min(diffInMinutes * 0.2, 50);

    // 2. Units Factor (unitsRequired * 5)
    // More blood needed = higher urgency
    const unitsReq = request.units || request.unitsRequired || 1;
    score += (unitsReq * 5);

    // 3. Rare Blood Type Weight
    const bloodGroup = request.bloodGroup ? request.bloodGroup.toUpperCase() : "";
    let rareWeight = 5; // Default for common types (A+, B+, O+, AB+)

    if (bloodGroup === "O-") {
        rareWeight = 25;
    } else if (bloodGroup === "AB-") {
        rareWeight = 20;
    } else if (bloodGroup === "B-") {
        rareWeight = 15;
    } else if (bloodGroup.includes("-")) {
        // Any other negative type
        rareWeight = 10;
    }

    score += rareWeight;

    // 4. (Optional/Future) Distance to nearest eligible donor * 0.5
    // Leaving out of synchronous creation flow to avoid blocking. 
    // Can be updated asynchronously in real usage.

    // Calculate Level
    let level = "low";
    if (score > 75) {
        level = "critical";
    } else if (score > 50) {
        level = "high";
    } else if (score > 30) {
        level = "medium";
    }

    return {
        urgencyScore: Math.round(score),
        urgencyLevel: level
    };
};

export { calculateUrgency };
