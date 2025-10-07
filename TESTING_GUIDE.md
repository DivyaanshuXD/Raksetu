# 🧪 Raksetu Testing Guide

## 📋 Testing All Bug Fixes

This guide will help you test all 10 bug fixes systematically.

---

## 🔧 Setup

### 1. Start Frontend Development Server

```powershell
# In the main Raksetu directory
npm run dev
```

Expected output: Development server running on `http://localhost:5173` (or similar)

### 2. Start Backend Server (if needed)

```powershell
# In the raksetu-backend directory
cd raksetu-backend
npm start
```

---

## ✅ Bug Fixes to Test

### **Bug #1: Firebase Permissions** ✅
**What was fixed:** Updated Firestore rules to include all 28 collections with proper permissions

**How to test:**
1. Try to create a donation
2. Try to view blood banks list
3. Try to submit emergency request
4. All actions should work without permission errors

**Expected result:** No "Missing or insufficient permissions" errors in browser console

---

### **Bug #2: Impact Points System** ✅
**What was fixed:** Changed from fixed 10 points to dynamic scoring based on blood type, urgency, and rarity

**How to test:**
1. Complete a blood donation
2. Check your profile to see impact points awarded
3. Try different blood types (O-, AB+, etc.)

**Expected result:** Points should vary based on donation context (not always 10)

**Where to check:** 
- Profile Section → Impact Points
- Browser console should show calculation details

---

### **Bug #3: PWA Install Button Always Enabled** ✅
**What was fixed:** Install button now always enabled, shows appropriate message for installed/not installed state

**How to test:**
1. Look for "Install App" button in the header
2. Button should always be visible and clickable
3. Click it - should show install prompt or "Already installed" message

**Expected result:** Button never disabled, always interactive

---

### **Bug #4: International Phone Validation with STRICT REGEX** ✅ 🔥 **JUST FIXED**
**What was fixed:** Implemented strict regex validation that enforces EXACT digit counts per country

**How to test - CRITICAL:**

#### Test Case 1: India (+91) - Requires EXACTLY 10 digits
```
❌ Should REJECT: +915 (too short - 1 digit)
❌ Should REJECT: +9198765 (too short - 5 digits)
❌ Should REJECT: +9198765432 (too short - 8 digits)
✅ Should ACCEPT: +919876543210 (correct - 10 digits)
✅ Should ACCEPT: 9876543210 (correct - assumes India)
❌ Should REJECT: +91987654321012 (too long - 12 digits)
❌ Should REJECT: +9198765432101234 (too long - 14 digits)
```

#### Test Case 2: USA/Canada (+1) - Requires EXACTLY 10 digits
```
❌ Should REJECT: +1555 (too short)
✅ Should ACCEPT: +15551234567 (correct - 10 digits)
❌ Should REJECT: +155512345678900 (too long)
```

#### Test Case 3: UAE (+971) - Requires EXACTLY 9 digits
```
❌ Should REJECT: +9715123 (too short)
✅ Should ACCEPT: +971501234567 (correct - 9 digits)
❌ Should REJECT: +97150123456789 (too long)
```

#### Test Case 4: Singapore (+65) - Requires EXACTLY 8 digits
```
❌ Should REJECT: +65812 (too short)
✅ Should ACCEPT: +6581234567 (correct - 8 digits)
❌ Should REJECT: +658123456789 (too long)
```

**Where to test:**
- Registration form phone number field
- Profile update phone number field
- Emergency request phone number field

**Expected behavior:**
- Invalid numbers show error message
- Form submission blocked for invalid numbers
- Only valid numbers with exact digit count are accepted

**Check browser console for validation details**

---

### **Bug #5: Browser Back Button Navigation** ✅
**What was fixed:** Uses browser history API instead of changing hash, respects browser back/forward buttons

**How to test:**
1. Navigate through multiple sections: Home → Donate → Track → Profile
2. Use browser BACK button (or Alt + ←)
3. Should navigate backwards through your history
4. Use browser FORWARD button (or Alt + →)
5. Should navigate forwards through your history

**Expected result:** Back/Forward buttons work correctly, URL updates properly

---

### **Bug #6: Interactive Calendar Picker** ✅
**What was fixed:** Replaced basic input with full calendar UI component

**How to test:**
1. Go to "Donate Blood" section
2. Click on "Preferred Donation Date" field
3. Should see calendar popup with:
   - Month/Year navigation
   - Clickable dates
   - "Today" button
   - Visual date selection

**Where to test:**
- Donate Blood section
- Track Donations section (date filters)

**Expected result:** Full calendar UI appears, dates clickable, smooth interaction

---

### **Bug #7: Mobile Responsive Hero Section** ✅
**What was fixed:** Optimized hero section for mobile with proper text sizing, spacing, and button layout

**How to test:**
1. Open site on mobile device OR
2. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Samsung Galaxy S20 (360px)
   - iPad (768px)

**Check these elements:**
- Hero title: Readable size (not too large/small)
- Subtitle: Properly wrapped, not cut off
- CTA buttons: Stack vertically on small screens
- Background video: Properly sized
- No horizontal scrolling

**Expected result:** Clean layout on all mobile sizes

---

### **Bug #8: Real-time Stats Section** ✅
**What was fixed:** Added live Firebase data fetching with fallbacks for loading/error states

**How to test:**
1. Navigate to Stats Section
2. Should see real numbers from database (not hardcoded)
3. Open browser DevTools → Network tab
4. Should see Firebase API calls
5. Numbers should match actual data in Firebase

**Check these stats:**
- Total Donations Count
- Active Donors Count
- Blood Units Available
- Lives Saved Count

**Expected behavior:**
- Shows loading state initially
- Updates with real data from Firebase
- Handles errors gracefully (shows fallback)

---

### **Bug #9: Language Switching** ✅
**What was fixed:** Robust language switching with proper initialization and state management

**How to test:**
1. Find language selector in header/settings
2. Switch between languages (English, Hindi, etc.)
3. All text should update immediately
4. Refresh page - language should persist
5. Switch again - should work smoothly

**Expected result:** 
- Language changes instantly
- No console errors
- Persistence across page refreshes
- All sections update (header, buttons, labels)

---

### **Bug #10: Event Confirmation Modal** ✅
**What was fixed:** Added confirmation modal before joining community events

**How to test:**
1. Navigate to Community Section
2. Find an upcoming event
3. Click "Join Event" button
4. Should see confirmation modal with:
   - Event details (name, date, location)
   - "Confirm" button
   - "Cancel" button
5. Click "Confirm" - should register for event
6. Click "Cancel" - modal should close without registering

**Expected result:** Modal appears, shows details, requires confirmation

---

## 🛠️ Troubleshooting

### Frontend Won't Start
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Backend Won't Start
```powershell
cd raksetu-backend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Phone Validation Issues
- Open browser console (F12)
- Look for validation error messages
- Check that regex patterns are matching correctly
- Test with different country codes

### Firebase Permission Errors
- Check browser console for specific collection name
- Verify you're logged in
- Check Firebase console for rules deployment status

---

## 📊 Testing Checklist

Print this and check off as you test:

- [ ] Bug #1: Firebase Permissions - No errors when creating/viewing data
- [ ] Bug #2: Impact Points - Dynamic scoring (not always 10)
- [ ] Bug #3: PWA Install - Button always enabled
- [ ] Bug #4: Phone Validation - Strict regex (test all edge cases)
- [ ] Bug #5: Back Button - Browser navigation works
- [ ] Bug #6: Calendar Picker - Interactive UI appears
- [ ] Bug #7: Mobile Responsive - Clean layout on phones
- [ ] Bug #8: Real-time Stats - Live data from Firebase
- [ ] Bug #9: Language Switching - Instant updates
- [ ] Bug #10: Event Confirmation - Modal appears with details

---

## 🎯 Priority Testing Order

**High Priority (Test First):**
1. Bug #4 - Phone Validation (CRITICAL - just fixed with regex)
2. Bug #1 - Firebase Permissions (affects all features)
3. Bug #2 - Impact Points (core feature)

**Medium Priority:**
4. Bug #5 - Back Button Navigation
5. Bug #8 - Real-time Stats
6. Bug #9 - Language Switching

**Low Priority (Visual/UX):**
7. Bug #3 - PWA Install Button
8. Bug #6 - Calendar Picker
9. Bug #7 - Mobile Responsive
10. Bug #10 - Event Confirmation Modal

---

## 📝 Reporting Issues

If you find a bug during testing, note:
1. Which bug# you were testing
2. Exact steps to reproduce
3. Expected vs actual behavior
4. Browser console errors (if any)
5. Screenshots/screen recordings

---

## ✅ Success Criteria

**All bugs are fixed if:**
- ✅ No console errors during normal use
- ✅ Phone validation strictly enforces digit counts (try 5, 8, 15 digits - all should fail)
- ✅ All Firebase operations work (create/read/update)
- ✅ Mobile layout is clean (no horizontal scroll)
- ✅ Browser back/forward buttons work
- ✅ Stats show real-time data
- ✅ Language switching is instant

---

## 🎉 Deployment Check

After all tests pass locally:

1. **Frontend Deployment:**
   ```powershell
   # Build for production
   npm run build
   
   # Deploy to Vercel/Netlify
   # (or your hosting platform)
   ```

2. **Backend Deployment:**
   ```powershell
   cd raksetu-backend
   # Deploy to your backend host
   ```

3. **Live Site Testing:**
   - Test www.raksetu.live
   - Run through testing checklist again
   - Verify phone validation works in production

---

## 📞 Support

If you encounter issues during testing:
- Check browser console for errors
- Verify Firebase connection
- Ensure backend is running (if needed)
- Check network tab in DevTools

---

**Last Updated:** Today (after phone validation regex fix)
**Version:** 1.0 (All 10 bugs fixed)
