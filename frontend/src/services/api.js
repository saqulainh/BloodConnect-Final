// ─── API Service Layer ───────────────────────────────────────────────
// In development: use Vite proxy → localhost:5000 (no CORS issues)
// In production: use the deployed Vercel backend
const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
        ? "/api/v1"
        : "https://bloodconnect-vert.vercel.app/api/v1");

// ── Token helpers ──────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const saveTokens = ({ accessToken, refreshToken } = {}) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken && refreshToken !== "undefined") {
        localStorage.setItem("refreshToken", refreshToken);
    }
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
const authHeaders = () => {
    const token = getAccessToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

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

const checkTokenExpiry = () => {
    const token = getAccessToken();
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Expired if less than 60 seconds remain
        return payload.exp * 1000 < Date.now() + 60000;
    } catch {
        return false;
    }
};

// ── Core fetch wrapper (handles 401 → refresh → retry) ────────────────
export const apiFetch = async (endpoint, options = {}, retry = true) => {
    // Before making any auth request, check if token is expired
    if (
        !endpoint.includes("/auth/login") &&
        !endpoint.includes("/auth/register") &&
        !endpoint.includes("/auth/refresh-token") &&
        !endpoint.includes("/auth/admin-login")
    ) {
        if (checkTokenExpiry()) {
            if (!endpoint.startsWith("/camps")) {
                clearTokens();
                window.location.href = "/login";
                throw new Error("Session expired. Please login again.");
            }
        }
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    if (res.status === 401 && retry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register") && !endpoint.includes("/auth/admin-login")) {
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

    // Parse body if it exists
    let data = { success: false, message: "No response from server" };
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (text && contentType.includes("application/json")) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON parse error:", e);
            throw new Error("Invalid response format from server.");
        }
    } else if (res.ok) {
        // Success but no JSON (e.g. 204 No Content or plain text)
        return { success: true, message: text || "Request successful" };
    } else {
        // Error with no JSON body
        throw new Error(text || `Error: ${res.status} ${res.statusText}`);
    }

    if (!data.success) {
        const error = new Error(data.message || "Something went wrong");
        error.response = { data }; // Attach data for consumer access (e.g. requiresOtp)
        throw error;
    }
    return data;
};

// ─────────────────────────────────────────────────────────────────────
// BLOOD CAMPS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

export const getCamps = async () => {
    return apiFetch("/camps", { method: "GET", headers: authHeaders() });
};

export const registerForCamp = async (campId) => {
    return apiFetch(`/camps/${campId}/register`, { method: "POST", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// DONATIONS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

export const addDonation = async (donationData) => {
    return apiFetch("/donations", { method: "POST", headers: authHeaders(), body: JSON.stringify(donationData) });
};

export const getMyDonations = async () => {
    return apiFetch("/donations/my-donations", { method: "GET", headers: authHeaders() });
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
    saveUser(data.data); // User data is directly in data.data
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
    }, false); // no retry
    
    // CRITICAL: Save tokens so the user stays logged in after verification
    if (data.success && data.data?.accessToken) {
        saveTokens(data.data);
        saveUser(data.data);
    }
    return data;
};

/** POST /auth/resend-otp — { email } */
export const resendOtp = async ({ email }) => {
    return apiFetch("/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    }, false); // no retry
};

/** POST /auth/forgot-password — { email } */
export const forgotPassword = async ({ email }) => {
    return apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    }, false); // no retry
};

/** POST /auth/reset-password — { email, otp, password } */
export const resetPassword = async ({ email, otp, newPassword }) => {
    return apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
    }, false); // no retry
};

/** POST /auth/change-password — { currentPassword, newPassword } */
export const changePassword = async (data) => {
    return apiFetch("/auth/change-password", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** POST /auth/logout */
export const logoutUser = async () => {
    try {
        await apiFetch("/auth/logout", { method: "POST", headers: authHeaders() }, false);
    } catch (err) {
        // Ignore logout errors
    } finally {
        clearTokens();
    }
};

/** POST /auth/verify-aadhaar — { email, aadhaarNumber } */
export const verifyAadhaar = async ({ email, aadhaarNumber }) => {
    return apiFetch("/auth/verify-aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, aadhaarNumber }),
    });
};


// ─────────────────────────────────────────────────────────────────────
// USER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /auth/me — current user profile + eligibility */
export const getMe = async () => {
    return apiFetch("/auth/me", { method: "GET", headers: authHeaders() });
};

/** PATCH /users/update-me — update profile / availability */
export const updateMe = async (updates) => {
    return apiFetch("/users/update-me", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });
};

// ─────────────────────────────────────────────────────────────────────
// DONOR ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /users/donors — get all donors */
export const getDonors = async () => {
    return apiFetch("/users/donors", { method: "GET", headers: authHeaders() });
};

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
// ANALYTICS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

export const getAnalytics = async (timeframe = 'week') => {
    return apiFetch(`/analytics?timeframe=${timeframe}`, { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// RECEIVER / BLOOD REQUEST ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /requests — get all blood requests */
export const getAllRequests = async () => {
    return apiFetch("/requests", { method: "GET", headers: authHeaders() });
};

/**
 * POST /requests — create urgent blood request
 */
export const createBloodRequest = async (data) => {
    return apiFetch("/requests", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
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

/**
 * PUT /requests/:id — update a blood request
 */
export const updateBloodRequest = async (id, requestData) => {
    return apiFetch(`/requests/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(requestData) });
};

/**
 * DELETE /requests/:id — delete a blood request
 */
export const deleteBloodRequest = async (id) => {
    return apiFetch(`/requests/${id}`, { method: "DELETE", headers: authHeaders() });
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

// ─────────────────────────────────────────────────────────────────────
// CHAT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /chat/conversations — list of users the current user chatted with */
export const getConversations = async () => {
    return apiFetch("/chat/conversations", { method: "GET", headers: authHeaders() });
};

/** GET /chat/history/:id — chat history with a specific user */
export const getMessages = async (otherUserId) => {
    return apiFetch(`/chat/history/${otherUserId}`, { method: "GET", headers: authHeaders() });
};

/** POST /chat/send/:id — send message to user */
export const sendMessage = async (receiverId, text) => {
    return apiFetch(`/chat/send/${receiverId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ text }),
    });
};

/** DELETE /chat/clear/:id — clear chat history */
export const clearChatHistory = async (otherUserId) => {
    return apiFetch(`/chat/clear/${otherUserId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
};

/** POST /chat/call/:id — initiate audio/video call */
export const initiateCall = async (otherUserId, type) => {
    return apiFetch(`/chat/call/${otherUserId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ type }),
    });
};
// ─────────────────────────────────────────────────────────────────────
// PAYMENT & DONATION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** POST /payment/create-order — Create a new Razorpay order with donor info for receipt */
export const createOrder = async (amount, donorName = "", donorEmail = "", donorPhone = "") => {
    return apiFetch("/payment/create-order", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ amount, donorName, donorEmail, donorPhone }),
    });
};

/** POST /payment/verify — Verify Razorpay payment signature */
export const verifyPayment = async (paymentData) => {
    return apiFetch("/payment/verify", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(paymentData),
    });
};

// ─────────────────────────────────────────────────────────────────────
// ADMIN ANALYTICS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /admin/analytics/mission-stats — Admin-only platform intelligence */
export const getAdminMissionStats = async () => {
    return apiFetch("/admin/analytics/mission-stats", { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// PROXIMITY MATCHING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /proximity/donors — AI geo-sorted donor search with drive time */
export const getProximityDonors = async ({ lat, lng, bloodGroup = "All", radius = 20 }) => {
    const params = new URLSearchParams({ lat, lng, radius });
    if (bloodGroup && bloodGroup !== "All") params.append("bloodGroup", bloodGroup);
    return apiFetch(`/proximity/donors?${params.toString()}`, { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// SOS BROADCAST ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** POST /sos/broadcast — Broadcast emergency alert to nearby donors */
export const broadcastSOS = async ({ bloodGroup, hospital, patientName, message, lat, lng }) => {
    return apiFetch("/sos/broadcast", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ bloodGroup, hospital, patientName, message, lat, lng }),
    });
};

/** GET /sos/active — Get active critical requests from last 12 hours */
export const getActiveSOSAlerts = async () => {
    return apiFetch("/sos/active", { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// RECEIVER DASHBOARD ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /receiver/stats — Receiver dashboard overview stats */
export const getReceiverStats = async () => {
    return apiFetch("/receiver/stats", { method: "GET", headers: authHeaders() });
};

/** GET /receiver/my-requests — All requests created by this receiver (with filters) */
export const getMyReceiverRequests = async ({ status, urgency, bloodGroup, sort } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (urgency)    params.append('urgency', urgency);
    if (bloodGroup) params.append('bloodGroup', bloodGroup);
    if (sort)       params.append('sort', sort);
    const qs = params.toString();
    return apiFetch(`/receiver/my-requests${qs ? `?${qs}` : ''}`, { method: "GET", headers: authHeaders() });
};

/** PATCH /receiver/:id/cancel — Cancel a blood request with optional reason */
export const cancelBloodRequest = async (id, reason = '') => {
    return apiFetch(`/receiver/${id}/cancel`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
    });
};

/** GET /receiver/nearby-urgent — Nearby urgent requests for the dashboard alert banner */
export const getNearbyUrgent = async (lat, lng, radius = 50) => {
    return apiFetch(`/receiver/nearby-urgent?lat=${lat}&lng=${lng}&radius=${radius}`, {
        method: "GET",
        headers: authHeaders(),
    });
};

/** GET /receiver/wallet — Receiver wallet (badges, impact, gratitude) */
export const getReceiverWallet = async () => {
    return apiFetch("/receiver/wallet", { method: "GET", headers: authHeaders() });
};

/** GET /receiver/analytics — Receiver personal analytics */
export const getReceiverAnalytics = async () => {
    return apiFetch("/receiver/analytics", { method: "GET", headers: authHeaders() });
};

/** POST /receiver/gratitude — Send gratitude to a donor */
export const sendGratitudeTodonor = async ({ requestId, donorId, message }) => {
    return apiFetch("/receiver/gratitude", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ requestId, donorId, message }),
    });
};

/** GET /receiver/timeline/:requestId — Full journey of a request */
export const getRequestTimeline = async (requestId) => {
    return apiFetch(`/receiver/timeline/${requestId}`, { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// ADMIN PANEL ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /admin/dashboard — Admin overview stats */
export const getAdminDashboard = async () => {
    return apiFetch("/admin/dashboard", { method: "GET", headers: authHeaders() });
};

/** GET /admin/users — All users (paginated, filterable) */
export const getAdminUsers = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/users?${qs}`, { method: "GET", headers: authHeaders() });
};

/** PATCH /admin/users/:id — Update user */
export const adminUpdateUser = async (id, data) => {
    return apiFetch(`/admin/users/${id}`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** DELETE /admin/users/:id — Delete user */
export const adminDeleteUser = async (id) => {
    return apiFetch(`/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
};

/** PATCH /admin/users/:id/ban — Toggle ban */
export const adminToggleBan = async (id) => {
    return apiFetch(`/admin/users/${id}/ban`, { method: "PATCH", headers: authHeaders() });
};

/** PATCH /admin/users/:id/promote — Change role */
export const adminPromoteUser = async (id, role) => {
    return apiFetch(`/admin/users/${id}/promote`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ role }),
    });
};

// ── CSV Sanitization Helper ─────────────────────────────────────────
// Prevents CSV injection (formula injection) and handles special characters
const sanitizeCSVField = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    // Prefix formula-starting characters to prevent CSV injection in Excel
    const formulaChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
    const needsPrefix = formulaChars.some(c => escaped.startsWith(c));
    return `"${needsPrefix ? "'" + escaped : escaped}"`;
};

/** GET /admin/users/export — Export users to CSV (Client-side proxy) */
export const exportAdminUsersCSV = async () => {
    try {
        const res = await apiFetch(`/admin/users?limit=1000`, { method: "GET", headers: authHeaders() });
        if (!res.success) throw new Error("Failed to fetch users");
        
        const users = res.data.users;
        const headers = ["ID", "Name", "Email", "Phone", "Blood Group", "Role", "Banned", "Created At"];
        const csvRows = [
            headers.join(','),
            ...users.map(u => [
                sanitizeCSVField(u._id), 
                sanitizeCSVField(u.name), 
                sanitizeCSVField(u.email), 
                sanitizeCSVField(u.phone), 
                sanitizeCSVField(u.bloodGroup), 
                sanitizeCSVField(u.role), 
                sanitizeCSVField(u.isBanned), 
                sanitizeCSVField(new Date(u.createdAt).toISOString())
            ].join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bloodconnect_users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        console.error("Export CSV Error:", error);
        return { success: false, message: error.message };
    }
};

/** GET /admin/requests — All requests */
export const getAdminRequests = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/requests?${qs}`, { method: "GET", headers: authHeaders() });
};

/** PATCH /admin/requests/:id — Update request */
export const adminUpdateRequest = async (id, data) => {
    return apiFetch(`/admin/requests/${id}`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** DELETE /admin/requests/:id — Delete request */
export const adminDeleteRequest = async (id) => {
    return apiFetch(`/admin/requests/${id}`, { method: "DELETE", headers: authHeaders() });
};

/** POST /admin/requests/:id/fulfill — Force fulfill */
export const adminForceFulfill = async (id, donorId) => {
    return apiFetch(`/admin/requests/${id}/fulfill`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ donorId }),
    });
};

/** GET /admin/requests/export — Export requests to CSV (Client-side proxy) */
export const exportAdminRequestsCSV = async () => {
    try {
        const res = await apiFetch(`/admin/requests?limit=1000`, { method: "GET", headers: authHeaders() });
        if (!res.success) throw new Error("Failed to fetch requests");
        
        const requests = res.data.requests;
        const headers = ["ID", "Patient", "Blood Group", "Units", "Hospital", "City", "Urgent", "Status", "Created At"];
        const csvRows = [
            headers.join(','),
            ...requests.map(r => [
                sanitizeCSVField(r._id), 
                sanitizeCSVField(r.patientName), 
                sanitizeCSVField(r.bloodGroup), 
                sanitizeCSVField(r.unitsRequired),
                sanitizeCSVField(r.hospitalName),
                sanitizeCSVField(r.city),
                sanitizeCSVField(r.isUrgent),
                sanitizeCSVField(r.status),
                sanitizeCSVField(new Date(r.createdAt).toISOString())
            ].join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bloodconnect_requests_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        console.error("Export CSV Error:", error);
        return { success: false, message: error.message };
    }
};

/** GET /admin/camps — All camps */
export const getAdminCamps = async () => {
    return apiFetch("/admin/camps", { method: "GET", headers: authHeaders() });
};

/** POST /admin/camps — Create camp */
export const adminCreateCamp = async (data) => {
    return apiFetch("/admin/camps", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** PATCH /admin/camps/:id — Edit camp */
export const adminUpdateCamp = async (id, data) => {
    return apiFetch(`/admin/camps/${id}`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** DELETE /admin/camps/:id — Delete camp */
export const adminDeleteCamp = async (id) => {
    return apiFetch(`/admin/camps/${id}`, { method: "DELETE", headers: authHeaders() });
};

/** GET /admin/system-health — Server & DB stats */
export const getSystemHealth = async () => {
    return apiFetch("/admin/system-health", { method: "GET", headers: authHeaders() });
};

/** POST /admin/broadcast — Send platform announcement */
export const adminBroadcast = async (data) => {
    return apiFetch("/admin/broadcast", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(data),
    });
};

/** GET /admin/revenue — Financial details */
export const getAdminRevenue = async (period = 30) => {
    return apiFetch(`/admin/revenue?period=${period}`, { method: "GET", headers: authHeaders() });
};

/** GET /admin/audit-logs — Audit trail */
export const getAuditLogs = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/logs?${qs}`, { method: "GET", headers: authHeaders() });
};

// ─────────────────────────────────────────────────────────────────────
// INVENTORY ENDPOINTS
// ─────────────────────────────────────────────────────────────────────

/** GET /inventory — Fetch overall blood bank inventory */
export const getInventory = async () => {
    return apiFetch("/inventory", { method: "GET" }); // Public to view
};

/** PUT /inventory/:id — Update units for a specific blood group */
export const adminUpdateInventory = async (id, units) => {
    return apiFetch(`/inventory/${id}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify({ units }),
    });
};

/** POST /auth/admin-login — Admin login with secret key */
export const adminLogin = async ({ email, password, adminKey }) => {
    const data = await apiFetch("/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminKey }),
    });
    saveTokens(data.data);
    saveUser(data.data);
    return data;
};
