# 🔧 Git Repository Setup Guide

## **Current Situation**
- ✅ Local repo: `C:\Users\prave\OneDrive\Documents\Raksetu`
- ❌ Remote points to old repo: `Raksetu_SIP`
- ✅ New frontend repo: `Raksetu` (public)
- ✅ Backend repo: `raksetu-server` (private)

---

## 🎯 **Solution: Update Remote & Separate Repos**

### **Step 1: Update Frontend Remote URL**

```powershell
cd c:\Users\prave\OneDrive\Documents\Raksetu

# Remove old remote
git remote remove origin

# Add new remote (Raksetu instead of Raksetu_SIP)
git remote add origin https://github.com/DivyaanshuXD/Raksetu.git

# Verify
git remote -v
```

**Expected output**:
```
origin  https://github.com/DivyaanshuXD/Raksetu.git (fetch)
origin  https://github.com/DivyaanshuXD/Raksetu.git (push)
```

---

### **Step 2: Pull Remote Changes (if any)**

```powershell
# Fetch remote branch
git fetch origin

# If remote has commits, merge them
git pull origin main --allow-unrelated-histories

# Or force push if you want to overwrite remote (CAREFUL!)
# git push -f origin main
```

---

### **Step 3: Push Frontend to New Repo**

```powershell
# Check what will be pushed
git status

# Push to new Raksetu repo
git push -u origin main
```

---

## 📦 **Handling Backend (raksetu-server) - Two Options**

### **Option A: Keep Backend in Monorepo (Recommended)**

Keep `raksetu-backend/` in the main `Raksetu` repo and use `.gitignore` to exclude sensitive files:

**Pros**:
- ✅ Single source of truth
- ✅ Easier to manage
- ✅ Backend and frontend version sync

**Implementation**:
```powershell
# Already done - .gitignore excludes:
raksetu-backend/.env
raksetu-backend/.env.local
raksetu-backend/node_modules/
```

**Push everything**:
```powershell
git push origin main
```

---

### **Option B: Separate Backend into Its Own Repo**

Push `raksetu-backend/` to the separate `raksetu-server` private repo:

#### **B.1: Setup Backend Repo**

```powershell
# Navigate to backend folder
cd c:\Users\prave\OneDrive\Documents\Raksetu\raksetu-backend

# Initialize git (if not already)
git init

# Add remote for backend repo
git remote add origin https://github.com/DivyaanshuXD/raksetu-server.git

# Check remote
git remote -v
```

#### **B.2: Add .gitignore for Backend**

Create `raksetu-backend/.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Vercel
.vercel/
```

#### **B.3: Commit and Push Backend**

```powershell
# Still in raksetu-backend directory
git add .
git commit -m "feat: backend server with ML and SMS/WhatsApp integration

- Express server with Firebase Admin SDK
- TensorFlow.js ML model for donor retention (95.25% accuracy)
- Twilio SMS/WhatsApp notifications
- Blood bank data scraping with Puppeteer
- Automated re-engagement campaigns
- Comprehensive API endpoints

Features:
- ML-powered churn prediction
- Emergency blood request notifications
- OTP verification for donation scheduling
- Blood drive data management
- Real-time Firebase integration"

# Push to private repo
git push -u origin main
```

#### **B.4: Remove Backend from Frontend Repo**

```powershell
# Go back to main repo
cd c:\Users\prave\OneDrive\Documents\Raksetu

# Remove backend from git tracking
git rm -r --cached raksetu-backend

# Update .gitignore to exclude entire folder
echo "raksetu-backend/" >> .gitignore

# Commit the removal
git commit -m "chore: move backend to separate private repository

Backend is now maintained at:
https://github.com/DivyaanshuXD/raksetu-server"

# Push to frontend repo
git push origin main
```

---

## 🤔 **Which Option Should You Choose?**

### **Choose Option A (Monorepo)** if:
- ✅ You want to keep everything together
- ✅ You're okay with backend being public (it has no secrets in code)
- ✅ You want easier deployment
- ✅ `.env` files are already ignored

### **Choose Option B (Separate Repos)** if:
- ✅ You want backend completely private
- ✅ You have different collaborators for frontend/backend
- ✅ You want independent versioning
- ✅ You already have `raksetu-server` repo setup

---

## 📝 **Recommended: Option A (Keep Together)**

**Why?**
1. Your backend code has no hardcoded secrets (all in `.env`)
2. `.env` files are properly ignored
3. Easier to manage and deploy
4. Many successful projects use monorepo structure

**Structure**:
```
Raksetu/ (public repo)
├── .gitignore              ✅ Excludes .env files
├── README.md               ✅ Main docs
├── Raksetu-main/           ✅ Frontend
│   └── .env (ignored)      
└── raksetu-backend/        ✅ Backend (code is safe)
    ├── .env (ignored)      ✅ Secrets not in repo
    └── README.md           ✅ Backend docs
```

---

## 🚀 **Quick Commands (Option A - Recommended)**

```powershell
# 1. Update remote URL
cd c:\Users\prave\OneDrive\Documents\Raksetu
git remote set-url origin https://github.com/DivyaanshuXD/Raksetu.git

# 2. Verify
git remote -v

# 3. Check status
git status

# 4. Pull remote changes (if any)
git pull origin main --allow-unrelated-histories

# 5. Push everything
git push -u origin main
```

---

## 🔒 **Security Check**

Before pushing, verify no secrets are tracked:

```powershell
# Check for .env files
git ls-files | Select-String ".env"

# Should return NOTHING
# If it returns files, untrack them:
git rm --cached raksetu-backend/.env
git rm --cached raksetu-backend/.env.local
git rm --cached Raksetu-main/.env
```

---

## ⚠️ **If Push Still Fails**

If you get "remote contains work that you do not have locally":

```powershell
# Option 1: Merge remote changes
git pull origin main --allow-unrelated-histories
git push origin main

# Option 2: Force push (OVERWRITES REMOTE - BE CAREFUL!)
git push -f origin main
```

---

## 📞 **Need Help?**

**Error**: `! [rejected] main -> main (fetch first)`
**Solution**: Remote repo has commits you don't have locally

**Fix**:
```powershell
# Pull remote changes first
git pull origin main --allow-unrelated-histories

# Then push
git push origin main
```

---

## ✅ **Final Checklist**

- [ ] Remote URL updated to `Raksetu` (not `Raksetu_SIP`)
- [ ] `.env` files not tracked by git
- [ ] All changes committed
- [ ] Remote changes pulled (if any)
- [ ] Successfully pushed to GitHub
- [ ] Verified on GitHub website

---

**Ready to push? Run the commands above!** 🚀
