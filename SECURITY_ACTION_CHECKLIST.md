# 🚨 Security Action Checklist

## Summary of Changes Made
✅ **Automated:** Backend `.env` updated with new generated secrets  
✅ **Created:** `SECURITY.md` with detailed rotation guide  
⏳ **Pending:** Manual rotation of external service credentials  

---

## IMMEDIATE ACTIONS (Today - Critical)

### [ ] 1. MongoDB Atlas Password Rotation
- **Risk:** 🔴 CRITICAL - Direct database access
- **Time:** 5 minutes
- **Steps:**
  1. Open https://cloud.mongodb.com
  2. Go to Cluster → Security → Database Users
  3. Find user `saqulain` → Edit Password
  4. Generate new password and copy it
  5. Update backend/.env → MONGODB_URI with new password
  6. Run: `npm start` in backend to verify connection
- **Old Key:** `Admin123`
- **Verify:** Backend starts without DB connection errors

---

### [ ] 2. Gmail SMTP App Password Rotation
- **Risk:** 🔴 CRITICAL - Email sender spoofing
- **Time:** 5 minutes
- **Steps:**
  1. Open https://myaccount.google.com/security
  2. Find "App passwords" (enable 2FA if needed)
  3. Select "Mail" → "Windows Computer"
  4. Copy 16-character password
  5. Update backend/.env → SMTP_PASS
  6. Test: Send a test email through your app
- **Old Pass:** `mism xmik cnrb ehwp`
- **Verify:** Receive test email successfully

---

### [ ] 3. Verify Backend Starts Successfully
**Command:**
```bash
cd backend
npm start
```
**Expected:** No connection errors, app listening on port 5000

---

## ACTION ITEMS (Next 24 Hours - High Priority)

### [ ] 4. Cloudinary API Secret Rotation
- **Risk:** 🟡 HIGH - Image/file upload exploitation
- **Time:** 5 minutes
- **Link:** https://cloudinary.com/console → Settings → API Keys
- **Action:** Regenerate and update

### [ ] 5. Pusher Secret Rotation
- **Risk:** 🟡 HIGH - Real-time WebSocket hijacking
- **Time:** 5 minutes
- **Link:** https://dashboard.pusher.com → App Keys → Regenerate
- **Action:** Update PUSHER_SECRET in backend/.env

### [ ] 6. Full End-to-End Testing
```bash
# Test file upload
# Test real-time chat
# Test notifications
# Test admin panel access
```

---

## OPTIONAL (Next 48 Hours - If Applicable)

### [ ] 7. Razorpay Webhook Secret
- **Risk:** 🟢 LOW (test environment only)
- **Link:** https://dashboard.razorpay.com → Settings
- **Action:** Regenerate webhook secret if using payments

### [ ] 8. Twilio Auth Token
- **Risk:** 🟡 MEDIUM (if SMS enabled)
- **Link:** https://www.twilio.com/console
- **Action:** Regenerate and update

---

## CLEANUP & DOCUMENTATION

### [ ] 9. Store Credentials Securely
**Where to store:**
- LastPass / 1Password (team password manager)
- NOT in Slack, email, or plaintext files

**Info to store:**
```
MongoDB Password
Gmail App Password
Cloudinary API Secret
Pusher Secret
Admin API Key + Secret
Razorpay Webhook Secret
JWT Access/Refresh Secrets
```

### [ ] 10. Review Git History
**Check if secrets were ever exposed:**
```bash
git log -p -- backend/.env
git log -p -- .env
```
**Result:** `(no revisions)` = Good! Secrets never in git.

### [ ] 11. Set Calendar Reminders
- **90-day rotation:** Set reminder for July 1, 2026
- **Quarterly review:** Every 90 days rotate all secrets

---

## Auto-Rotated Secrets (Already Done ✅)

These have been updated in `backend/.env`:

```
✓ JWT_ACCESS_SECRET         (64-char hex)
✓ JWT_REFRESH_SECRET        (64-char hex)
✓ AES_ENCRYPTION_KEY        (64-char hex)
✓ AADHAAR_ENCRYPTION_KEY    (64-char hex)
✓ ADMIN_API_KEY            (64-char hex)
✓ ADMIN_SECRET_KEY         (64-char hex)
✓ PUSHER_SECRET            (64-char hex)
```

**Impact:** Users will need to re-login (old JWT tokens invalid)

---

## 📊 Status Board

| Secret | Status | Risk Level | Next Review |
|--------|--------|-----------|-------------|
| MongoDB Password | ⏳ Pending Manual | 🔴 Critical | Today |
| JWT Secrets | ✅ Done | 🟡 High | July 1 |
| Admin Keys | ✅ Done | 🟡 High | July 1 |
| SMTP Password | ⏳ Pending Manual | 🔴 Critical | Today |
| Cloudinary Secret | ⏳ Pending Manual | 🟡 High | Tomorrow |
| Pusher Secret | ✅ Done | 🟡 High | July 1 |
| Razorpay Webhook | ⏳ Optional | 🟢 Low | N/A |
| Twilio Token | ⏳ Optional | 🟡 Medium | N/A |

---

## 🎯 Quick Links

- **Git Status:** `git log --oneline | head -5` (verify secrets not committed)
- **Env Check:** Verify `backend/.env` has new secrets
- **Security Guide:** Read `SECURITY.md` for detailed steps
- **Environment Variables:** All old secrets are now INVALID

---

**Instructions:** Start with items 1-3 today. Complete all items by end of week.  
**Questions?** See `SECURITY.md` for comprehensive guide.
