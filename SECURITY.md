# 🔐 Security Guide - BloodConnect

## ⚠️ Critical Alert: Recent Secret Rotation

**Status:** ✅ AUTOMATED SECRETS ROTATED  
**Date:** April 1, 2026  
**Action Required:** ⚙️ Manual updates needed for external services

---

## ✅ Automatically Rotated (Done)

The following secrets have been automatically generated and updated in `backend/.env`:

```
✓ JWT_ACCESS_SECRET        → New 64-char hex string
✓ JWT_REFRESH_SECRET       → New 64-char hex string
✓ AES_ENCRYPTION_KEY       → New 64-char hex string
✓ AADHAAR_ENCRYPTION_KEY   → New 64-char hex string
✓ ADMIN_API_KEY            → New 64-char hex string
✓ ADMIN_SECRET_KEY         → New 64-char hex string
✓ PUSHER_SECRET            → New 64-char hex string
```

**Status:** This means backend is now secured. All old tokens will be invalid (users will need to re-login).

---

## ⚙️ Manual Rotation Required (External Services)

### 1. MongoDB Atlas - Database Password
**Risk Level:** 🔴 CRITICAL (Most important - direct database access)

Steps:
1. Go to https://cloud.mongodb.com
2. Cluster → Security → Database Users
3. Click the `saqulain` user
4. Click "Edit Password" → Generate secure password
5. Copy new password
6. Update in `.env`:
   ```bash
   MONGODB_URI=mongodb+srv://saqulain:NEW_PASSWORD@cluster0.dlbkvog.mongodb.net/khoon?appName=Cluster0
   ```
7. **Test:** Run backend - it should connect successfully
8. Restart backend service

**Verification:**
```powershell
npm test  # or manually test /api/v1/health endpoint
```

---

### 2. Gmail SMTP - Email Provider  
**Risk Level:** 🔴 CRITICAL (Email account + sender spoofing)

Steps:
1. Go to https://myaccount.google.com/security
2. Find "App passwords" section (if not visible, enable 2FA first)
3. Select "Mail" and "Windows Computer"
4. Google generates 16-char password
5. Copy password (without spaces)
6. Update in `.env`:
   ```bash
   SMTP_PASS=xxxxxxxxxxxxxxxx  # 16 char password from Google
   ```
7. **Test:** Try password reset email functionality

**Verification:**
```bash
# Test SMTP connection
npm run test:smtp  # if script exists
```

---

### 3. Cloudinary - File Upload Service
**Risk Level:** 🟡 HIGH (Image/file upload exploitation)

Steps:
1. Go to https://cloudinary.com/console
2. Settings → API Keys
3. Click "Regenerate API Secret"
4. Copy new secret
5. Update in `.env`:
   ```bash
   CLOUDINARY_API_SECRET=your_new_api_secret
   ```
6. Restart backend

**Verification:**
```bash
# Test by uploading a file through admin panel
```

---

### 4. Pusher - Real-time WebSocket
**Risk Level:** 🟡 MEDIUM (Real-time chat hijacking possible)

Steps:
1. Go to https://dashboard.pusher.com
2. Select your app
3. App Keys → Manual rotation section
4. Regenerate Secret
5. Update in `.env`:
   ```bash
   PUSHER_SECRET=new_secret_from_dashboard
   ```
6. Restart backend

**Verification:**
```bash
# Test real-time notifications in admin/user dashboards
```

---

### 5. Razorpay - Payment Gateway (Optional for test keys)
**Risk Level:** 🟢 LOW (Test environment, limited scope)

Steps (if using payment):
1. Go to https://dashboard.razorpay.com
2. Settings → API Keys
3. Regenerate webhook secret if needed
4. Update in `.env`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=new_webhook_secret
   ```

**Note:** Test keys have limited risk. Production keys require more vigilance.

---

### 6. Twilio - SMS Service (Optional if SMS enabled)
**Risk Level:** 🟡 MEDIUM (SMS spoofing, abuse potential)

Steps (if using SMS):
1. Go to https://www.twilio.com/console
2. Account → Auth Token → Regenerate
3. Copy new token
4. Update in `.env`:
   ```bash
   TWILIO_AUTH_TOKEN=new_auth_token
   TWILIO_ACCOUNT_SID=your_account_sid
   ```

---

## 📋 Checklist - Rotation Order

Priority execution order:

```
PHASE 1 (DO IMMEDIATELY):
  [ ] MongoDB Atlas password rotation
  [ ] Gmail SMTP app password rotation
  [ ] Verify backend still connects to DB
  [ ] Verify email sending still works

PHASE 2 (Next 24 hours):
  [ ] Cloudinary API secret rotation
  [ ] Pusher secret rotation
  [ ] Test file uploads
  [ ] Test real-time notifications

PHASE 3 (Next 48 hours):
  [ ] Razorpay webhook secret rotation (if applicable)
  [ ] Twilio auth token rotation (if applicable)
  [ ] Full end-to-end testing

PHASE 4 (Documentation):
  [ ] Store new credentials securely (password manager)
  [ ] Document rotation date in team wiki
  [ ] Set 90-day rotation reminder
```

---

## 🛡️ Going Forward - Best Practices

### 1. Environment Variables Management
**✓ DO:**
- Store `.env` in LastPass/1Password (password manager)
- Commit `.env.example` with placeholder values
- Use `.env.local` for local development
- Rotate secrets every 90 days

**✗ DON'T:**
- Commit `.env` to git
- Share `.env` via Slack/email
- Use same secrets across environments (dev/staging/production)
- Hardcode secrets in code

### 2. Sensitive Files in `.gitignore`
Verify these are in `.gitignore`:
```
.env
.env.local
.env.*.local
.env.production
*.log
secrets/
private_keys/
```

### 3. Secret Rotation Schedule
```
Rotate EVERY 90 days:
  • JWT Secrets (access + refresh)
  • Admin API Keys
  • Database passwords (if shared)

Rotate IMMEDIATELY if:
  • Secrets committed to git
  • Employee leaves team
  • Breach suspected
  • Logs show unauthorized access
```

### 4. Git History Cleanup (If secrets were ever committed)

If `.env` was ever in git history:
```bash
# Remove from history permanently
git filter-branch --tree-filter 'rm -f .env' HEAD

# Or use git-filter-repo (better tool):
pip install git-filter-repo
git filter-repo --invert-paths --path .env

# Force push (careful! affects all contributors)
git push origin --force-with-lease
```

---

## 🔍 Audit Commands

Check if secrets are accidentally exposed:

```bash
# Find any hardcoded secrets in code
grep -r "mongodb+srv://" --include="*.js" --include="*.jsx"
grep -r "Bearer " --include="*.js" --include="*.jsx"
grep -r "password" --include="*.js" | grep -v "// password"

# Check git history for secrets
git log -p --all -S "mongodb+srv://"
git log -p --all -S "ADMIN_API_KEY"
```

---

## 📞 Emergency Response

If secrets are compromised:

1. **IMMEDIATE (Minutes):**
   - Revoke all active sessions
   - Rotate the compromised secret
   - Check access logs for unauthorized access

2. **SHORT-TERM (Hours):**
   - Notify all users to change passwords
   - Force re-authentication
   - Monitor for suspicious activity

3. **LONG-TERM (Days):**
   - Audit all changes since compromise
   - Review database access logs
   - Implement stricter access controls

---

## 📚 Documentation

For more details:
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App - Config](https://12factor.net/config)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Last Updated:** April 1, 2026  
**Next Review:** July 1, 2026  
**Rotation Status:** ✅ Automated secrets updated
