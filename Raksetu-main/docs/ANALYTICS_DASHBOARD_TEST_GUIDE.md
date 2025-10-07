# Analytics Dashboard Testing Guide

## Quick Start

### What to Test
The new **Analytics & Insights** section in your donation dashboard that shows:
- 📈 **Timeline Chart** - Your donation journey over time
- 📊 **Monthly Chart** - Compare recent donation patterns  
- 📈 **Impact Chart** - See your cumulative lifesaving impact

---

## Where to Find It

### Step 1: Sign In
1. Open Raksetu app at http://localhost:5173/
2. Click **"Sign In"** button
3. Enter your credentials
4. Navigate to **"Track Donations"** section

### Step 2: Locate Analytics
Scroll down past your profile banner and stats cards. You'll see a new white card titled:

```
Analytics & Insights
```

With three tab buttons:
- 🔴 **Timeline** (line chart icon)
- 🔵 **Monthly** (bar chart icon)  
- 🟢 **Impact** (trending up icon)

---

## Test Scenarios

### Scenario 1: First-Time User (No Donations)

**What to Check:**
- ❌ Analytics section should be **hidden** (not visible)
- ✅ Stats grid should show zeros
- ✅ "Upcoming Activities" section should be visible
- ✅ No error messages

**Expected Result:**
Clean, empty state without analytics clutter.

---

### Scenario 2: User with 1 Donation

**What to Check:**
1. ✅ Analytics section **appears**
2. ✅ Timeline chart shows **single point**
3. ✅ Monthly chart shows **one bar**
4. ✅ Impact chart shows **starting point**

**Expected Result:**
Charts render with minimal data, no broken layout.

---

### Scenario 3: User with Multiple Donations

**What to Check:**

#### Timeline Chart (First Tab)
1. Click **"Timeline"** tab
2. Look for:
   - 🔴 Red line showing donations per month
   - 🔵 Blue line showing lives saved (donations × 3)
   - Grid lines in background
   - X-axis with month labels (e.g., "Jan 2025")
   - Y-axis with numbers
   - Legend at bottom

**Interaction Test:**
- Hover over any point → Tooltip should appear
- Tooltip should show: month, donations count, lives saved
- Moving mouse should update tooltip smoothly

#### Monthly Chart (Second Tab)
1. Click **"Monthly"** tab
2. Look for:
   - 🔴 Red bars showing donations
   - 🟢 Green bars showing impact points
   - Last 6 months of data
   - Rounded bar tops
   - Side-by-side comparison

**Interaction Test:**
- Hover over bars → Tooltip shows exact numbers
- Compare heights visually

#### Impact Chart (Third Tab)
1. Click **"Impact"** tab  
2. Look for:
   - 🔴 Red filled area showing total donations
   - 🔵 Blue filled area showing total lives saved
   - Gradient fill (light at bottom, darker at line)
   - Cumulative growth curve
   - Should trend upward

**Interaction Test:**
- Hover over any point → Shows cumulative totals
- Verify numbers increase over time (never decrease)

---

## Visual Checklist

### Desktop (1920×1080)
- [ ] Charts fill entire card width
- [ ] 300px height looks good
- [ ] Tab buttons aligned at top right
- [ ] No horizontal scrolling
- [ ] Text readable without zooming

### Tablet (768px)
- [ ] Charts shrink to fit screen
- [ ] Tabs stack or wrap properly
- [ ] Touch targets at least 44×44px
- [ ] Labels still readable

### Mobile (375px)
- [ ] Charts responsive to narrow width
- [ ] X-axis labels don't overlap
- [ ] Tabs remain accessible
- [ ] No layout breaks

---

## Interaction Testing

### Tab Switching
1. Click **Timeline** → Should show line chart instantly
2. Click **Monthly** → Should switch to bar chart (<50ms)
3. Click **Impact** → Should switch to area chart
4. Switch rapidly between tabs → No lag or flicker

### Active State
- Active tab should have colored background:
  - Timeline: light red (red-100)
  - Monthly: light blue (blue-100)
  - Impact: light green (green-100)
- Inactive tabs should be gray
- Hover over inactive tabs → light gray background

### Tooltips
- Hover over any chart element → Tooltip appears immediately
- Tooltip should have:
  - White background
  - Gray border
  - Rounded corners
  - Drop shadow
  - Clear text (black on white)
- Move mouse away → Tooltip disappears

---

## Data Validation

### Timeline Chart
**For each month with donations:**
```
Expected:
- Donations count = actual donations that month
- Lives saved = donations × 3
```

**How to Verify:**
1. Pick a month (e.g., "Sep 2025")
2. Count donations from that month in history
3. Hover over that point in chart
4. Verify numbers match

### Monthly Chart (Last 6 Months)
**Check:**
- Only shows last 6 months
- Donations (red bars) = actual count
- Points (green bars) = sum of points earned

**How to Verify:**
1. Check date range (should be recent)
2. Compare bar heights to actual data
3. Verify bar colors (red vs green)

### Impact Chart
**Check:**
- Total Donations line always increases
- Total Lives = Total Donations × 3
- Never decreases (cumulative)

**How to Verify:**
1. Pick two consecutive months
2. Second month should be ≥ first month
3. Lives should always be 3× donations

---

## Edge Cases to Test

### Very Old Donations
**Scenario:** User has donations from 2+ years ago

**Check:**
- [ ] Timeline chart shows all months
- [ ] X-axis labels formatted correctly (e.g., "Jan 2023")
- [ ] No date parsing errors
- [ ] Chart not too crowded

### Same-Day Multiple Donations
**Scenario:** User donated multiple times in one day

**Check:**
- [ ] All donations counted in same month
- [ ] No duplicate points on timeline
- [ ] Tooltip shows combined total

### Gaps in Donation History
**Scenario:** User has months with no donations

**Check:**
- [ ] Timeline connects points with lines (doesn't break)
- [ ] Monthly chart shows only months with activity
- [ ] No weird spacing or gaps

---

## Error Scenarios

### What Could Go Wrong?

#### 1. Charts Don't Render
**Symptoms:** White empty box, no charts visible

**Check:**
- Browser console for errors (F12)
- Recharts library loaded? (Network tab)
- Data available? (Check completedDonations state)

**Expected:** Should never happen with proper error boundaries

#### 2. Tooltip Stuck
**Symptoms:** Tooltip stays visible after mouse leaves

**Fix:** Reload page (F5)

**Expected:** Rare edge case, recharts handles this

#### 3. Wrong Data Displayed
**Symptoms:** Numbers don't match donation history

**Check:**
- Date format correct in Firestore?
- Points field exists on donations?
- Status = 'completed' or 'pending'?

**Expected:** Data processing is accurate

---

## Performance Testing

### Load Time
1. Open DevTools (F12) → Performance tab
2. Click "Track Donations"
3. Measure time until charts visible

**Target:** <200ms

### Interaction Speed
1. Open DevTools → Performance
2. Record while clicking tabs rapidly
3. Check frame rate

**Target:** 60fps (smooth animations)

### Memory Usage
1. Open DevTools → Memory tab
2. Take heap snapshot before viewing charts
3. Take another snapshot after 5 minutes
4. Compare sizes

**Target:** <5MB increase

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab key reaches chart tabs
- [ ] Enter/Space switches tabs
- [ ] Visual focus indicator visible
- [ ] Can navigate without mouse

### Screen Reader (Optional)
- [ ] Section has heading "Analytics & Insights"
- [ ] Tab buttons have text labels
- [ ] Charts have basic description

**Note:** Charts themselves are SVG and may not be fully screen-reader accessible yet.

---

## Browser Testing

### Required Browsers
- [ ] Chrome (latest) - Primary
- [ ] Firefox (latest)
- [ ] Safari (latest) - MacOS only
- [ ] Edge (latest) - Windows

### Known Issues
- ❌ IE 11 not supported (recharts requires ES6)
- ✅ All modern browsers work

---

## What to Report

### If Charts Look Good ✅
Comment:
```
✅ Analytics charts working!
- Timeline chart: [works/issues]
- Monthly chart: [works/issues]  
- Impact chart: [works/issues]
- Responsiveness: [good/needs work]
```

### If You Find Issues ❌
Report:
1. **What went wrong?** (e.g., "Timeline chart empty")
2. **What you did** (e.g., "Clicked Timeline tab")
3. **Expected** (e.g., "Should show line chart")
4. **Actual** (e.g., "Blank white space")
5. **Browser** (e.g., Chrome 120)
6. **Screenshot** (if possible)

---

## Quick Test Script

**Copy/paste this and check off:**

```
Desktop Test (2 minutes):
[ ] Sign in to account with donations
[ ] Navigate to Track Donations
[ ] Analytics section visible? ___
[ ] Click Timeline tab → chart shows? ___
[ ] Hover over line → tooltip appears? ___
[ ] Click Monthly tab → bars show? ___
[ ] Click Impact tab → area chart shows? ___
[ ] Switch tabs 5× rapidly → smooth? ___
[ ] Browser console clean (no errors)? ___

Mobile Test (1 minute):
[ ] Open on phone or resize browser to 375px wide
[ ] Charts fit screen width? ___
[ ] Tabs accessible? ___
[ ] Can read all labels? ___
[ ] No horizontal scroll? ___

Result: PASS / FAIL / NEEDS WORK
```

---

## Expected Screenshots

### Timeline Chart
```
📈 Red line showing donations over time
📈 Blue line showing lives saved (higher)
✅ Grid lines, axes, legend
✅ Tooltip on hover
```

### Monthly Chart
```
📊 Red bars (donations)
📊 Green bars (points)
✅ Last 6 months only
✅ Rounded bar tops
```

### Impact Chart
```
📈 Red filled area (cumulative donations)
📈 Blue filled area (cumulative lives)
✅ Gradient fills
✅ Always increasing
```

---

## Troubleshooting

### "Analytics section not showing"
**Cause:** No completed donations yet

**Fix:** Add test donation or check Firestore collection

### "Charts render but data wrong"
**Cause:** Date format issue in Firestore

**Fix:** Verify dates are Firestore Timestamps or valid Date objects

### "Tabs not switching"
**Cause:** JavaScript error

**Fix:** Check browser console, reload page

### "Chart looks weird on mobile"
**Cause:** Responsive container issue

**Fix:** Expected to work, report if broken

---

## Success Criteria

**This feature is working if:**
1. ✅ Charts render for users with donations
2. ✅ All 3 chart types accessible via tabs
3. ✅ Data accurate (matches donation history)
4. ✅ Responsive on desktop, tablet, mobile
5. ✅ Smooth interactions (<50ms tab switch)
6. ✅ No console errors
7. ✅ Tooltips work on hover
8. ✅ Clean empty state (no donations)

---

## Next Steps After Testing

### If Everything Works
1. Mark todo complete ✅
2. Move to next Week 3 feature
3. Consider enhancements (date filters, export)

### If Issues Found
1. Document issues clearly
2. Agent will fix bugs
3. Retest after fixes

---

## Need Help?

**Common Questions:**

**Q: I don't see any charts**  
A: Do you have completed donations? Analytics only shows with data.

**Q: Charts look broken on mobile**  
A: Try rotating device or resize browser window slowly.

**Q: Tooltip not appearing**  
A: Hover directly over data points (dots, bars, or areas).

**Q: Want to export chart?**  
A: Feature not implemented yet (Week 4 enhancement).

**Q: Can I filter by date range?**  
A: Not yet (Week 4 enhancement).

---

**Happy Testing! 🎉**

If charts work as expected, you now have beautiful visual insights into your blood donation impact! 📊❤️

---

*Last Updated: October 1, 2025*  
*Version: 1.0*  
*Test Duration: 3-5 minutes*
