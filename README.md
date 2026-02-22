# 🩸 BloodConnect

BloodConnect is a modern, life-saving digital platform that bridges the gap between individuals in urgent need of blood and willing donors nearby. Built with a robust **MERN (MongoDB, Express, React, Node.js)** stack, it aims to make blood donation rapid, transparent, and community-driven.

## ✨ Key Features & Capabilities

Our platform is engineered to be a comprehensive ecosystem for blood requests and donor management. Here is a breakdown of what the application currently does from end to end:

### 1. 🔐 Secure & Verified Authentication
- **Aadhaar Verification Integration:** Users can link their Aadhaar mapping during sign-up for an added layer of safety and authenticity, protecting the platform from fake requests and spam donors.
- **Role-based Access:** Clear distinction between standard Users and verified Donors. 

### 2. 🚨 Real-Time Urgent Blood Requests
- **Create Requests:** Users can create an active blood request specifying Patient Name, Hospital Name, Blood Group, and Urgency Level (Normal, High, Critical).
- **Edit & Delete:** Full control over personal requests from the Dashboard.
- **Automated Urgent Notifications:** If a request is marked as "Critical" or "High", the backend automatically queries the database for nearby available donors with the matching blood group and fires an **Automated Email Alert** directly to them.

### 3. 💬 Real-Time Direct Messaging
- **Pusher Integration:** Built-in live chat feature. When a donor sees an active request, they can instantly click "Chat with Requester" to open a real-time messaging window.
- **Privacy First:** Chat safely without needing to expose personal phone numbers publicly if the user prefers not to.

### 4. 🗺️ Interactive Live Heatmap
- **Geographic Mapping (Leaflet):** A beautiful, interactive map on the main dashboard visualizes the crisis. 
- Urgent requests are pinned as **Red Markers**, and available donors are highlighted as **Green Markers**, giving a clear real-time geographic overlay of supply vs. demand.

### 5. 🏥 Dynamic Blood Camps 
- **Live Sync:** Replaces static dummy data with a live MongoDB feed of upcoming Blood Camps.
- **Registration:** Donors can click "Register" on any upcoming camp, actively synchronizing their RSVP with the backend datastore without a page reload.

### 6. 🏆 Gamification: Donation History & Badges
- **Donation Tracking:** Users can log their past blood donation history (date, units, hospital, patient) within their Settings Profile.
- **Hero Badges:** To encourage recurring donations, the platform awards dynamic digital badges (Hero, Bronze, Silver, Gold, Platinum Lifesaver) based on the number of lives a donor has potentially saved.

### 7. 📊 Comprehensive Dashboard Analytics
- **Live Metrics:** Dynamic counts of Total Platform Donors, Active Requests, and Pending Urgent needs.
- **Donation vs Request Graphs:** Visual area charts outlining the historical trend of community activity on the platform.

---

## 🛠️ Technology Stack

**Frontend Framework:** React.js (Vite), TailwindCSS, Recharts, React-Leaflet, Lucide Icons  
**Backend Framework:** Node.js, Express.js  
**Database:** MongoDB Atlas (Mongoose ODM)  
**Real-Time Subsystem:** Pusher (WebSockets)  
**Notifications:** Nodemailer (SMTP)  

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js installed (v16+)
- MongoDB connection string
- Pusher account credentials
- Gmail SMTP App Password (for email alerts)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file with your Mongo URI, JWT secrets, Pusher keys, and SMTP credentials.
4. Run the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---
*Developed with a mission to make every drop count.*
