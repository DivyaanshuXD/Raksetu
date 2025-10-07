# 🎯 PDF Certificate Quick Test Guide

## How to Test PDF Certificates

### **Step 1: Navigate to Track Donations**
1. Open http://localhost:5173/
2. Sign in to your account
3. Click on "Track Donations" section

### **Step 2: Click Export Certificate Button**
Look for the blue "Export Certificate" button at the bottom of the page.

### **Step 3: Choose Your Format**

You'll see a modal with 3 options:

#### **Option 1: PDF Certificate** (Recommended) 📥
- **What it does:** Downloads a professional PDF certificate
- **Best for:** Printing, sharing, or saving permanently
- **Filename:** `Raksetu-Certificate-[Your-Name]-[Timestamp].pdf`
- **What to check:**
  - ✅ Your name is correct
  - ✅ Blood type shows correctly
  - ✅ Total donations count is accurate
  - ✅ Badge matches your donation count:
    - 1 donation = "First Donor" (Green)
    - 2-4 donations = "Emergency Hero" (Blue)
    - 5-9 donations = "Gold Lifesaver" (Yellow)
    - 10+ donations = "Platinum Lifesaver" (Purple)
  - ✅ "Lives Touched" = Total Donations × 3
  - ✅ Certificate ID is present
  - ✅ Date shows today's date

#### **Option 2: HTML Certificate** 📄
- **What it does:** Opens certificate in new browser window
- **Best for:** Quick preview or browser-based printing
- **How to save:** File → Print → Save as PDF (in new window)
- **What to check:**
  - ✅ Beautiful design with colors
  - ✅ All stats display correctly
  - ✅ Can print using browser

#### **Option 3: Annual Report** 📈
- **What it does:** Creates a comprehensive PDF report for current year
- **Best for:** Year-end summaries, records
- **Filename:** `Raksetu-Annual-Report-[Year]-[Your-Name].pdf`
- **What to check:**
  - ✅ Summary boxes show correct counts
  - ✅ Donation table lists all your donations this year
  - ✅ Each row has: #, Date, Location, Blood Type, Status
  - ✅ Header shows current year
  - ✅ Your name in header

### **Step 4: Verify Downloaded Files**
1. Check your Downloads folder
2. Open the PDF file
3. Verify all information is correct
4. Try printing (if needed)

---

## 🐛 Troubleshooting

### **Problem: No export modal appears**
- **Solution:** Make sure you're logged in
- Check browser console for errors (F12)

### **Problem: "User profile not found" error**
- **Solution:** Log out and log back in
- Make sure your profile is complete

### **Problem: Annual report shows "No Data"**
- **Solution:** You need at least 1 completed donation
- Make sure you have donations in the current year (2025)

### **Problem: PDF doesn't download**
- **Solution:** Check browser's download settings
- Try different browser (Chrome, Firefox)
- Check if pop-ups are blocked

### **Problem: Stats are wrong in PDF**
- **Solution:** Refresh the page and try again
- Check your donation history in Track Donations section
- If still wrong, report the bug with screenshots

---

## ✅ Expected Results

### **PDF Certificate Should Have:**
```
┌────────────────────────────────────────┐
│ ♥ Heart Icon                  [Badge] │
│                                        │
│     Certificate of Appreciation        │
│  For Outstanding Service in Blood...  │
│                                        │
│        This is to certify that         │
│          [Your Name]                   │
│          ___________                   │
│                                        │
│   Has demonstrated exceptional...      │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [#]      [#×3]       [Type]    │ │
│  │DONATIONS  LIVES    BLOOD TYPE    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Signature          Date: [Today]     │
│                                        │
│  Certificate ID: CERT-...              │
└────────────────────────────────────────┘
```

### **Annual Report Should Have:**
```
┌──────────────────────────────┐
│  Annual Donation Report      │
│  Year 2025                   │
│  [Your Name]                 │
├──────────────────────────────┤
│  Summary                     │
│  ┌─────┬─────┬──────┐       │
│  │ # │ #×3 │Points│        │
│  └─────┴─────┴──────┘       │
│                              │
│  Donation History            │
│  Table with all donations    │
│                              │
│  Thank you message           │
└──────────────────────────────┘
```

---

## 📸 What to Screenshot

If reporting issues, please include:

1. **Export Modal Screenshot**
   - Press PrtSc when modal is open
   - Shows all 3 options

2. **Success/Error Message Screenshot**
   - Capture the popup message after clicking export

3. **Generated PDF Screenshot**
   - Open PDF and screenshot
   - Shows if data is correct/incorrect

4. **Browser Console Screenshot** (if error)
   - Press F12
   - Go to Console tab
   - Screenshot any red errors

---

## 🎯 Quick Test Scenarios

### **Scenario 1: New User (1 donation)**
- Expected Badge: "First Donor" (Green)
- Lives Touched: 3
- Annual Report: Shows 1 row

### **Scenario 2: Regular Donor (5 donations)**
- Expected Badge: "Gold Lifesaver" (Yellow)
- Lives Touched: 15
- Annual Report: Shows 5 rows

### **Scenario 3: Veteran Donor (10+ donations)**
- Expected Badge: "Platinum Lifesaver" (Purple)
- Lives Touched: 30+
- Annual Report: Shows 10+ rows

---

## 💡 Pro Tips

1. **Share on LinkedIn:** The PDF certificates look professional enough to share!
2. **Print Quality:** PDFs are designed for A4 paper (landscape for certificate, portrait for report)
3. **Keep Records:** Download annual reports every year for your records
4. **Email Friendly:** PDFs are small (~50-60KB) and easy to email

---

## 🆘 Need Help?

**Common Questions:**

**Q: Can I export certificates for past years?**
A: Currently only current year (2025). Future enhancement will add year selector.

**Q: Can I customize the certificate design?**
A: Not yet - but coming soon! Default design is professional and print-ready.

**Q: Where are my downloaded PDFs?**
A: Check your browser's Downloads folder (usually `C:\Users\[You]\Downloads` on Windows)

**Q: Can I generate certificates for someone else?**
A: No - certificates are personal and linked to your account.

**Q: Is there a limit on exports?**
A: No limit! Export as many times as you want.

---

## ✨ Enjoy Your Certificates!

Every donation saves lives. Your certificates prove your impact! 🎉

Happy testing! 🚀
