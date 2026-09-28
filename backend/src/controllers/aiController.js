const ALLOWED_BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const ALLOWED_URGENCY = new Set(["Normal", "Urgent", "Critical"]);

const normalizeDetails = (details = {}) => {
    const bloodGroup = typeof details.bloodGroup === "string" ? details.bloodGroup.trim().toUpperCase() : "";
    const urgency = typeof details.urgency === "string"
        ? details.urgency.trim().replace(/^./, (letter) => letter.toUpperCase()).toLowerCase() === "critical"
            ? "Critical"
            : details.urgency.trim().toLowerCase() === "urgent" ? "Urgent" : "Normal"
        : "Normal";
    const units = Number.parseInt(details.units, 10);

    return {
        ...(ALLOWED_BLOOD_GROUPS.has(bloodGroup) ? { bloodGroup } : {}),
        ...(Number.isInteger(units) && units > 0 && units <= 20 ? { units } : {}),
        ...(typeof details.hospital === "string" && details.hospital.trim() ? { hospital: details.hospital.trim().slice(0, 120) } : {}),
        ...(typeof details.patientName === "string" && details.patientName.trim() ? { patientName: details.patientName.trim().slice(0, 80) } : {}),
        ...(ALLOWED_URGENCY.has(urgency) ? { urgency } : {}),
    };
};

const extractJson = (text) => {
    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/);
    const candidate = fenced ? fenced[1] : text;
    return JSON.parse(candidate.trim());
};

export const assistEmergency = async (req, res) => {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message || message.length > 1000) {
        return res.status(400).json({ success: false, message: "Emergency description is required and must be under 1000 characters." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ success: false, message: "AI assistant is temporarily unavailable." });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = `You are a careful emergency blood-request extraction assistant. Extract only details explicitly stated in the user's message. Do not give medical advice. Return ONLY valid JSON with these optional keys: bloodGroup (one of A+, A-, B+, B-, AB+, AB-, O+, O-), units (integer 1-20), hospital (string), patientName (string), urgency (Normal, Urgent, or Critical). If a value is not stated, omit it. Treat words like immediately, emergency, or critical as Critical; urgently or urgent as Urgent. User message: ${message}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0, responseMimeType: "application/json" },
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            console.error("Gemini emergency assist failed:", response.status, payload?.error?.message || "unknown error");
            return res.status(502).json({ success: false, message: "AI assistant could not process this request." });
        }

        const generatedText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
            return res.status(502).json({ success: false, message: "AI assistant returned no usable details." });
        }

        return res.json({ success: true, data: normalizeDetails(extractJson(generatedText)), source: "gemini" });
    } catch (error) {
        console.error("Emergency AI error:", error.message);
        return res.status(502).json({ success: false, message: "AI assistant could not process this request." });
    }
};
