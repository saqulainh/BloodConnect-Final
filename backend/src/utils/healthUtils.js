// ─── BloodConnect Health Wallet Calculation Engine ───────────────────────────
// All business logic is centralized here for easy maintenance and testability.

// ── Rank / Badge System ──────────────────────────────────────────────────────
const BADGE_TIERS = [
    { min: 20, name: "Hero of Humanity", emoji: "🦸", next: null, nextMin: null },
    { min: 10, name: "Platinum Lifesaver", emoji: "💎", next: "Hero of Humanity", nextMin: 20 },
    { min: 5, name: "Gold Lifesaver", emoji: "🏆", next: "Platinum Lifesaver", nextMin: 10 },
    { min: 3, name: "Silver Lifesaver", emoji: "🥈", next: "Gold Lifesaver", nextMin: 5 },
    { min: 1, name: "Bronze Lifesaver", emoji: "🥉", next: "Silver Lifesaver", nextMin: 3 },
    { min: 0, name: "Future Hero", emoji: "🌱", next: "Bronze Lifesaver", nextMin: 1 },
];

/**
 * Calculate badge for a given donation count.
 * @param {number} totalDonations
 * @returns {{ badgeName, badgeEmoji, nextBadge, nextBadgeMin, progressPercentage, donationsToNext }}
 */
export const calculateBadge = (totalDonations) => {
    const tier = BADGE_TIERS.find(t => totalDonations >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];
    const prevMin = tier.min;
    const nextMin = tier.nextMin;

    let progressPercentage = 100;
    let donationsToNext = 0;

    if (nextMin !== null) {
        progressPercentage = Math.round(((totalDonations - prevMin) / (nextMin - prevMin)) * 100);
        donationsToNext = nextMin - totalDonations;
    }

    return {
        badgeName: tier.name,
        badgeEmoji: tier.emoji,
        nextBadge: tier.next,
        nextBadgeMin: tier.nextMin,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        donationsToNext: Math.max(0, donationsToNext),
    };
};

// ── Impact Calculation Engine ─────────────────────────────────────────────────

/**
 * Calculate real-world impact of a donor.
 * @param {number} totalDonations
 * @param {number} totalUnits
 * @returns {{ livesSaved, impactScore }}
 */
export const calculateImpact = (totalDonations, totalUnits) => {
    const livesSaved = totalUnits * 3;
    const impactScore = (totalDonations * 10) + (totalUnits * 5);
    return { livesSaved, impactScore };
};

// ── Smart Eligibility System (56-day rule) ────────────────────────────────────

/**
 * Calculate donation eligibility based on last donation date.
 * @param {Date|null} lastDonationDate
 * @returns {{ eligible, status, remainingDays, nextEligibleDate, progressPercent }}
 */
export const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) {
        return {
            eligible: true,
            status: "eligible",
            remainingDays: 0,
            nextEligibleDate: null,
            progressPercent: 100,
        };
    }

    const RECOVERY_DAYS = 56;
    const now = Date.now();
    const lastMs = new Date(lastDonationDate).getTime();
    const daysSince = Math.floor((now - lastMs) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, RECOVERY_DAYS - daysSince);
    const nextEligibleDate = new Date(lastMs + RECOVERY_DAYS * 24 * 60 * 60 * 1000);
    const progressPercent = Math.min(100, Math.round((daysSince / RECOVERY_DAYS) * 100));

    return {
        eligible: remainingDays === 0,
        status: remainingDays === 0 ? "eligible" : "recovery",
        remainingDays,
        nextEligibleDate,
        progressPercent,
    };
};

// ── Streak Calculation ────────────────────────────────────────────────────────

/**
 * Calculate donation streak given a sorted list of donation dates (oldest first).
 * Rules:
 *   - Streak increments if user donates within 60 days AFTER their 56-day eligibility window.
 *   - Streak resets if gap > 56 + 120 = 176 days between consecutive donations.
 * @param {Date[]} sortedDates  Sorted ascending array of donation dates
 * @returns {{ streak, longestStreak }}
 */
export const calculateStreak = (sortedDates) => {
    if (!sortedDates || sortedDates.length === 0) {
        return { streak: 0, longestStreak: 0 };
    }

    let streak = 1;
    let longestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const gapDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

        // Valid: donated within 56 + 60 = 116 days from previous
        // Reset: gap > 176 days (56 mandatory + 120 grace)
        if (gapDays >= 56 && gapDays <= 176) {
            streak++;
            longestStreak = Math.max(longestStreak, streak);
        } else {
            streak = 1;
        }
    }

    return { streak, longestStreak };
};

// ── Health Fitness Score ──────────────────────────────────────────────────────

/**
 * Calculate health readiness for donation.
 * @param {{ hemoglobin: number, weight: number, lastMealHoursAgo: number }}
 * @returns {{ fitnessScore, ready, warnings, suggestions }}
 */
export const calculateFitnessScore = ({ hemoglobin, weight, lastMealHoursAgo }) => {
    const warnings = [];
    const suggestions = [];
    let score = 100;

    // Hemoglobin check
    if (hemoglobin < 12.5) {
        warnings.push("Hemoglobin too low (min 12.5 g/dL). Please consult a doctor.");
        score -= 40;
    } else if (hemoglobin < 13.0) {
        suggestions.push("Hemoglobin is borderline. Eat iron-rich foods before donating.");
        score -= 15;
    }

    // Weight check
    if (weight < 50) {
        warnings.push("Weight below 50 kg. You must weigh at least 50 kg to donate safely.");
        score -= 35;
    } else if (weight < 55) {
        suggestions.push("Weight is near the minimum threshold. Stay well-hydrated.");
        score -= 10;
    }

    // Last meal check
    if (lastMealHoursAgo > 4) {
        suggestions.push("It's been more than 4 hours since your last meal. Eat before donating.");
        score -= 15;
    } else if (lastMealHoursAgo === 0 || lastMealHoursAgo < 0.5) {
        suggestions.push("Ate very recently. Wait at least 30 minutes before donating.");
        score -= 5;
    }

    const fitnessScore = Math.max(0, score);
    const ready = warnings.length === 0 && fitnessScore >= 50;

    return { fitnessScore, ready, warnings, suggestions };
};
