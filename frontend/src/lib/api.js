// ─── API Service Layer ───────────────────────────────────────────────
// In development: use Vite proxy → localhost:5000 (no CORS issues)
// In production: use the deployed Vercel backend
const BASE_URL =
    import.meta.env.DEV
        ? "/api/v1"
        : "https://bloodconnect-vert.vercel.app/api/v1";

// ── Token helpers ──────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const saveTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

export const saveUser = (user) =>
    localStorage.setItem("user", JSON.stringify(user));

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
};

export const isLoggedIn = () => !!getAccessToken();

// ── Auth headers ───────────────────────────────────────────────────────
const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
});

// ── Token refresh ──────────────────────────────────────────────────────
const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Token refresh failed");
    saveTokens(data.data);
    return data.data.accessToken;
};

// ── Core fetch wrapper (handles 401 → refresh → retry) ────────────────
const apiFetch = async (endpoint, options = {}, retry = true) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    if (res.status === 401 && retry) {
        try {
            const newToken = await refreshAccessToken();
            const retryOptions = {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
            };
            return apiFetch(endpoint, retryOptions, false);
        } catch {
            clearTokens();
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
        }
    }

    // Safely parse JSON — server may return empty body or non-JSON on some responses
    let data;
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (text && contentType.includes("application/json")) {
        try { data = JSON.parse(text); } catch { throw new Error("Server returned invalid JSON. Please try again."); }
    } else if (res.ok) {
        // 2xx but no JSON body — treat as success
        return { success: true, data: {}, message: text || "OK" };
    } else {
        // Non-2xx, non-JSON — use text as error message
        throw new Error(text || `Request failed (${res.status})`);
    }

    if (!data.success) throw new Error(data.message || "Something went wrong");
    return data;
};

// ─────────────────────────────────────────────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** POST /auth/login — email + password + aadhaarLast4 */
export const loginUser = async ({ email, password, aadhaarLast4 }) => {
    const data = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, aadhaarLast4 }),
    });
    saveTokens(data.data);
    if (data.data?.user) saveUser(data.data.user);
    return data;
};

/** POST /auth/register — multipart/form-data with files */
export const registerUser = async (formData) => {
    const data = await apiFetch("/auth/register", {
        method: "POST",
        body: formData, // No Content-Type header — browser sets it with boundary
    });
    // Registration returns userId/email for OTP step, not tokens yet
    return data;
};

/** POST /auth/verify-otp — { email, otp } */
export const verifyOtp = async ({ email, otp }) => {
    const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    if (data.data?.accessToken) saveTokens(data.data);
    if (data.data?.user) saveUser(data.data.user);
    return data;
};

/** POST /auth/resend-otp — { email } */
export const resendOtp = async ({ email }) => {
    return apiFetch("/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
};

/** POST /auth/forgot-password — { email } */
export const forgotPassword = async ({ email }) => {
    return apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
};

/** POST /auth/reset-password — { email, otp, password } */
export const resetPassword = async ({ email, otp, newPassword }) => {
    return apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
    });
};

/** POST /auth/logout */
export const logoutUser = async () => {
    try {
        await apiFetch("/auth/logout", {
            method: "POST",
            headers: authHeaders(),
        });
    } finally {
        clearTokens();
    }
};

// ─────────────────────────────────────────────────────────────────────
// USER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /user/me — current user profile + eligibility */
export const getMe = async () => {
    return apiFetch("/user/me", { method: "GET", headers: authHeaders() });
};

/** PATCH /user/update-me — update profile / availability */
export const updateMe = async (updates) => {
    return apiFetch("/user/update-me", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });
};

// ─────────────────────────────────────────────────────────────────────
// DONOR ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * GET /donor/nearby — geo-based donor search
 * Params: lat, lng, bloodGroup (optional), radius (km, default 5)
 */
export const getNearbyDonors = async ({ lat, lng, bloodGroup, radius = 5 }) => {
    const params = new URLSearchParams({ lat, lng, radius });
    if (bloodGroup && bloodGroup !== "All") params.append("bloodGroup", bloodGroup);
    return apiFetch(`/donor/nearby?${params.toString()}`, {
        method: "GET",
        headers: authHeaders(),
    });
};

/** GET /donor/stats — donor's own donation stats */
export const getDonorStats = async () => {
    return apiFetch("/donor/stats", { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// RECEIVER / BLOOD REQUEST ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * POST /receiver/request — create urgent blood request
 * Body: { bloodGroup, unitsRequired, hospitalName, urgency, lat, lng }
 * urgency: 'Urgent' | 'Normal'
 */
export const createBloodRequest = async (requestData) => {
    return apiFetch("/receiver/request", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(requestData),
    });
};

/**
 * GET /receiver/nearby-urgent — nearby urgent requests for home feed
 * Params: lat, lng
 */
export const getNearbyUrgentRequests = async (lat, lng) => {
    return apiFetch(`/receiver/nearby-urgent?lat=${lat}&lng=${lng}`, {
        method: "GET",
        headers: authHeaders(),
    });
};

// ─────────────────────────────────────────────────────────────────────
// DONATION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/**
 * POST /donation/record — record a completed donation
 * Body: { receiver, bloodGroup, hospitalName, donationDate }
 */
export const logDonation = async ({ receiver, bloodGroup, hospitalName, donationDate }) => {
    return apiFetch("/donation/record", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ receiver, bloodGroup, hospitalName, donationDate }),
    });
};

/** GET /donation/my-history — donor's own donation history */
export const getDonationHistory = async () => {
    return apiFetch("/donation/my-history", { method: "GET", headers: authHeaders() });
};

/** GET /donation/received-logs — logs of donations received by a receiver */
export const getReceivedLogs = async () => {
    return apiFetch("/donation/received-logs", { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// GEOLOCATION HELPER
// ─────────────────────────────────────────────────────────────────────

/** Get user's current GPS location → { lat, lng } */
export const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 10000 }
        );
    });
