# 🩸 Raksetu - AI-Powered Blood Donation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.0-orange.svg)](https://firebase.google.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-FF6F00.svg)](https://www.tensorflow.org/js)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)

> **Raksetu** is an intelligent, real-time blood donation platform that connects donors, recipients, and healthcare professionals using advanced ML algorithms, emergency response systems, and interactive geolocation features. Save lives with AI-powered donor engagement and smart blood matching.

🌐 **Live Demo:** [www.raksetu.live](https://www.raksetu.live)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [ML Dashboard](#-ml-dashboard)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Mobile App Deployment](#-mobile-app-deployment)
- [Production Deployment](#-production-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Raksetu addresses critical challenges in blood donation management by providing:

- **🚨 Emergency Response System**: Real-time blood requests with priority-based matching
- **🤖 AI-Powered Donor Engagement**: ML model (95.25% accuracy) predicts donor churn and automates re-engagement campaigns
- **🗺️ Interactive Maps**: Leaflet-based geolocation for emergency requests and blood banks
- **📊 Admin Dashboard**: Comprehensive analytics, user management, and ML insights
- **🎤 Voice Assistant**: Multi-lingual voice interaction for accessibility
- **💬 AI Chatbot**: Eligibility checking and donation guidance
- **🏆 Gamification**: Challenges, leaderboards, and achievement tracking

---

## ✨ Key Features

### For Donors
- ✅ **Quick Registration**: Email, phone, or Google OAuth authentication
- 🩸 **Donation Tracking**: Complete history with eligibility countdown
- 📍 **Emergency Alerts**: Real-time notifications for nearby urgent requests
- 🏅 **Gamification**: Earn points, complete challenges, climb leaderboards
- 📈 **Engagement Score**: AI-powered score showing donation activity (Low/Medium/High risk)
- 🔔 **Push Notifications**: Firebase Cloud Messaging for emergency alerts
- 🌐 **Multi-language Support**: English, Hindi, Spanish, French (i18next)

### For Recipients/Hospitals
- 🆘 **Emergency Blood Requests**: Post urgent requests with priority levels (Critical/High/Medium/Low)
- 🗺️ **Interactive Map**: Visual representation of all emergency requests
- 👥 **Smart Donor Matching**: Automatic matching based on blood type, location, and eligibility
- 📞 **Contact System**: Direct communication with matched donors via SMS/WhatsApp (Twilio)

### For Administrators
- 📊 **User Management**: View, edit, promote/demote users
- 🩸 **Blood Bank Management**: CRUD operations for blood bank inventory
- 🚑 **Emergency Management**: Monitor and manage all emergency requests
- 🤖 **ML Dashboard**: 
  - View at-risk donors (churn probability > 50%)
  - Run manual re-engagement campaigns
  - Track campaign history and success rates
  - Real-time ML statistics
- 🏆 **Challenges Management**: Create, edit, and monitor gamification challenges
- 💬 **Testimonials Moderation**: Approve or delete user testimonials

### Advanced Features
- 🎤 **Voice Assistant**: Hands-free interaction for emergency requests
- 💬 **Eligibility Chatbot**: AI-powered donation eligibility checker
- 📱 **PWA Support**: Install as mobile/desktop app with offline capabilities
- 🌙 **Dark Mode**: System-wide theme support
- ⚡ **Real-time Updates**: Firestore live data synchronization
- 🔐 **Role-Based Access**: Donor, Hospital, Admin roles with different permissions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 6.3.6 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Framer Motion** | 12.5.0 | Animations |
| **React Leaflet** | 4.2.1 | Interactive maps |
| **Lucide React** | 0.487.0 | Icon library |
| **i18next** | 23.x | Internationalization |
| **Recharts** | 3.2.1 | Data visualization |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | Runtime environment |
| **Express** | 5.1.0 | Web server framework |
| **TensorFlow.js** | 4.22.0 | ML model training & inference |
| **Firebase Admin SDK** | 13.3.0 | Backend Firebase operations |
| **Twilio** | 5.5.2 | SMS & WhatsApp messaging |
| **Node-Cron** | 3.0.3 | Scheduled jobs |
| **Puppeteer** | 24.7.2 | Web scraping (blood bank data) |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | User management |
| **Cloud Firestore** | NoSQL real-time database |
| **Firebase Cloud Messaging** | Push notifications |
| **Firebase Storage** | File uploads (profile images, emergency photos) |
| **Vercel** | Deployment (currently) |

---

## 🏗️ Architecture

```
Raksetu/
├── Raksetu-main/                 # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BloodHub/         # Main application components
│   │   │   │   ├── AdminSection_Enhanced.jsx  # Admin dashboard with ML
│   │   │   │   ├── EmergencyMapSection.jsx    # Leaflet map integration
│   │   │   │   ├── ProfileSection.jsx         # User profile with engagement score
│   │   │   │   ├── VoiceAssistant.jsx         # Voice interaction
│   │   │   │   └── ...
│   │   │   ├── common/           # Reusable components
│   │   │   └── utils/            # Utility functions
│   │   ├── context/              # React Context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API service layers
│   │   └── styles/               # Global styles
│   ├── public/
│   │   ├── firebase-messaging-sw.js  # Service worker for push notifications
│   │   └── locales/              # Translation files
│   └── ...
│
├── raksetu-backend/              # Backend server
│   ├── api/
│   │   ├── server.js             # Express server entry point
│   │   ├── ml/
│   │   │   ├── donorRetentionModel.js  # TensorFlow.js ML model
│   │   │   ├── reengagementService.js  # Automated campaigns
│   │   │   └── trainModel.js     # Model training script
│   │   └── routes/               # API endpoints
│   └── .env                      # Environment variables
│
└── README.md                     # This file
```

### Data Flow

```
User Action → React Component → Context/Hook → Service Layer → API Call → Backend → Firebase → ML Model → Response → UI Update
```

### ML Pipeline

```
Firebase Data → Feature Extraction → TensorFlow.js Model → Churn Prediction → Re-engagement Campaign → Notification → Firebase
```

---

## 📦 Installation

### Prerequisites
- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Firebase project** (free tier works)
- **Twilio account** (for SMS, optional)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/DivyaanshuXD/Raksetu_SIP.git
cd Raksetu_SIP
```

### 2. Install Frontend Dependencies

```bash
cd Raksetu-main
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../raksetu-backend
npm install
```

---

## ⚙️ Configuration

### Frontend Environment Variables

Create `Raksetu-main/.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_VAPID_KEY=your_vapid_key_for_push_notifications

# Backend API URL
VITE_BACKEND_URL=http://localhost:3000
```

**Get Firebase Config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → ⚙️ Settings → Project settings
3. Scroll to "Your apps" → Select Web App → Copy configuration values

**Get VAPID Key:**
1. Firebase Console → ⚙️ Settings → Project settings
2. Go to "Cloud Messaging" tab
3. Scroll to "Web Push certificates" → Click "Generate key pair"

### Backend Environment Variables

Create `raksetu-backend/.env`:

```env
# Firebase Admin SDK (single-line JSON)
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Twilio (Optional - for SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Get Firebase Admin Credentials:**
1. Firebase Console → ⚙️ Settings → Service accounts
2. Click "Generate new private key"
3. Download JSON file
4. Convert to single line: `cat service-account.json | jq -c . | tr -d '\n'`

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read for blood banks, authenticated write
    match /bloodBanks/{bankId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Emergency requests - public read, authenticated write
    match /emergencies/{emergencyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Notifications - user-specific access
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin-only access for challenges, stats
    match /challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Deploy Rules:**
```bash
firebase deploy --only firestore:rules
```

---

## 🚀 Usage

### Development Mode

**Terminal 1 - Frontend:**
```bash
cd Raksetu-main
npm run dev
```
Frontend runs on: `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd raksetu-backend
npm start
```
Backend runs on: `http://localhost:3000`

### Build for Production

```bash
cd Raksetu-main
npm run build
```

Build output: `Raksetu-main/dist/`

### Preview Production Build

```bash
npm run preview
```

---

## 🤖 ML Dashboard

### Overview

The ML Dashboard provides insights into donor engagement and automates re-engagement campaigns.

### Features

1. **At-Risk Donors Table**
   - Lists donors with churn probability > 50%
   - Shows last donation date, total donations, and risk percentage
   - Color-coded risk levels (🟡 Medium, 🔴 High)

2. **Campaign Management**
   - **Manual Trigger**: Run campaigns on-demand
   - **Dry Run Mode**: Test campaigns without sending notifications
   - **Max Notifications**: Limit campaign size (default: 10)
   - **Automated Scheduling**: Runs every Monday at 10 AM

3. **Campaign History**
   - Track past campaigns (date, donors reached, success rate)
   - Monitor re-engagement effectiveness

4. **ML Statistics**
   - Model accuracy: 95.25%
   - Total at-risk donors
   - Active campaigns
   - Avg. re-engagement rate

### API Endpoints

```javascript
// Get ML model health status
GET /api/ml/health

// Get list of at-risk donors
GET /api/ml/at-risk-donors?threshold=0.5&limit=50

// Predict churn for a specific donor
POST /api/ml/predict-churn
Body: { "userId": "user123" }

// Get ML statistics
GET /api/ml/reengagement/stats

// Run re-engagement campaign
POST /api/ml/reengagement/run
Body: { "maxNotifications": 10, "dryRun": false }

// Get campaign history
GET /api/ml/reengagement/history?limit=10
```

### ML Model Architecture

```javascript
Input Features (6):
- daysSinceLastDonation (normalized)
- totalDonations (normalized)
- averageDonationInterval (normalized)
- donationFrequency (scaled)
- longestGap (normalized)
- accountAge (normalized)

Hidden Layers:
- Dense(16, activation='relu')
- Dense(8, activation='relu')

Output Layer:
- Dense(1, activation='sigmoid')  // Churn probability

Loss Function: binaryCrossentropy
Optimizer: adam
Metrics: accuracy
```

### Training the Model

```bash
cd raksetu-backend
node api/ml/trainModel.js --real-data --epochs 100
```

**Options:**
- `--real-data`: Use Firebase data (requires Firebase credentials)
- `--epochs`: Number of training epochs (default: 50)

---

## 📚 API Documentation

### Authentication Endpoints

```javascript
// All requests require Firebase Auth token in header
Authorization: Bearer <firebase_id_token>
```

### Emergency Endpoints

```javascript
// Create emergency request
POST /api/emergencies
Body: {
  "bloodType": "O+",
  "unitsNeeded": 2,
  "urgency": "Critical",
  "hospitalName": "City Hospital",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "contactPhone": "+919876543210"
}

// Get all emergencies
GET /api/emergencies

// Update emergency status
PUT /api/emergencies/:id
Body: { "status": "Fulfilled" }
```

### Donor Matching

```javascript
// Get matched donors for emergency
GET /api/match-donors/:emergencyId
Response: [
  {
    "userId": "donor123",
    "name": "John Doe",
    "bloodType": "O+",
    "distance": 2.5,  // km
    "lastDonation": "2024-08-15",
    "eligible": true
  }
]
```

### SMS/WhatsApp Notifications

```javascript
// Send SMS
POST /api/send-sms
Body: {
  "to": "+919876543210",
  "message": "Urgent blood needed at City Hospital"
}

// Send WhatsApp
POST /api/send-whatsapp
Body: {
  "to": "+919876543210",
  "message": "Urgent blood needed at City Hospital"
}
```

---

## 🔐 Security

### Implemented Security Measures

✅ **Firebase Security Rules**: Role-based access control (RBAC)  
✅ **Environment Variables**: Sensitive data in `.env` files  
✅ **CORS Configuration**: Restricted origins  
✅ **Input Validation**: Sanitized user inputs  
✅ **Authentication Tokens**: Firebase ID tokens for API requests  
✅ **Rate Limiting**: (Recommended for production)  

### Production Security Checklist

- [ ] Enable Firebase App Check
- [ ] Set up rate limiting (express-rate-limit)
- [ ] Configure HTTPS only
- [ ] Review and tighten Firestore rules
- [ ] Rotate API keys regularly
- [ ] Enable Firebase security monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure CSP headers

---

## 📱 Mobile App Deployment

### Option 1: Progressive Web App (PWA) - Already Implemented

Users can install Raksetu as a native-like app:

1. **Android**: Chrome → Menu → "Add to Home screen"
2. **iOS**: Safari → Share → "Add to Home Screen"
3. **Desktop**: Chrome → Install icon in address bar

**PWA Features:**
- ✅ Offline support (Service Worker)
- ✅ Push notifications
- ✅ Home screen icon
- ✅ Splash screen
- ✅ Standalone mode (no browser UI)

### Option 2: Native Mobile Apps (iOS/Android)

Use **Capacitor** to convert React app to native apps:

#### Setup Capacitor

```bash
cd Raksetu-main
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init Raksetu live.raksetu.app
```

#### Build for Android

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Follow signing wizard
3. Upload to Google Play Console

#### Build for iOS

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select your development team
2. Product → Archive
3. Distribute to App Store Connect

### App Store Requirements

**Google Play Store:**
- Privacy Policy URL
- App icon (512x512 px)
- Feature graphic (1024x500 px)
- Screenshots (phone, tablet)
- App description (4000 chars max)
- Content rating questionnaire

**Apple App Store:**
- Apple Developer Account ($99/year)
- Privacy Policy URL
- App icon (1024x1024 px)
- Screenshots (various iPhone/iPad sizes)
- App Preview video (optional)
- App Store description (4000 chars max)

---

## 🌐 Production Deployment

### Option 1: Vercel (Current - Frontend Only)

```bash
cd Raksetu-main
npm install -g vercel
vercel login
vercel --prod
```

**Environment Variables:**
Add all `VITE_*` variables in Vercel dashboard

### Option 2: Firebase Hosting (Frontend)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

### Backend Deployment Options

#### Option A: Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `raksetu-backend` directory
4. Add environment variables
5. Deploy

#### Option B: Render

1. Create account at [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Root Directory: `raksetu-backend`
4. Build Command: `npm install`
5. Start Command: `node api/server.js`
6. Add environment variables

#### Option C: Google Cloud Run

```bash
cd raksetu-backend
gcloud run deploy raksetu-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Domain Configuration (raksetu.live)

**Frontend:**
1. Vercel: Add custom domain in project settings
2. Firebase: `firebase hosting:channel:deploy live --only hosting`
3. Update DNS:
   ```
   A     @     76.76.21.21  (Vercel)
   CNAME www   cname.vercel-dns.com
   ```

**Backend:**
1. Deploy to Railway/Render (get URL)
2. Update `VITE_BACKEND_URL` in frontend `.env`
3. Rebuild and redeploy frontend

### Performance Optimization

```bash
# Analyze bundle size
npm run build -- --mode analyze

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

**Optimization Checklist:**
- ✅ Code splitting (React.lazy)
- ✅ Image optimization (WebP format)
- ✅ Minification (Vite built-in)
- ✅ Caching headers
- [ ] CDN for static assets
- [ ] Database indexes (Firestore)
- [ ] Redis caching (optional)

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with email
- [ ] Sign up with phone
- [ ] Sign up with Google OAuth
- [ ] Login with email
- [ ] Login with phone
- [ ] Password reset

**Donor Flow:**
- [ ] View emergency requests
- [ ] Filter by blood type
- [ ] View emergency on map
- [ ] Respond to emergency
- [ ] Track donation history
- [ ] Check engagement score

**Admin Flow:**
- [ ] Access admin dashboard
- [ ] View user list
- [ ] Manage blood banks
- [ ] View ML Dashboard
- [ ] Run re-engagement campaign
- [ ] View campaign history

**ML System:**
- [ ] Engagement score displays correctly
- [ ] At-risk donors list populates
- [ ] Manual campaign sends notifications
- [ ] Campaign history updates
- [ ] Dry run mode works

### Automated Testing (Future)

```bash
# Unit tests
npm test

# E2E tests (Playwright/Cypress)
npm run test:e2e

# Component tests (React Testing Library)
npm run test:components
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code restructuring
test: Add tests
chore: Maintenance tasks
```

### Code Style

- **JavaScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Document complex logic

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Raksetu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team

**Raksetu** is developed and maintained by:

- **Divyaanshu** - [@DivyaanshuXD](https://github.com/DivyaanshuXD)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [TensorFlow.js](https://www.tensorflow.org/js) - ML capabilities
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

---

## 📞 Contact & Support

- **Website**: [www.raksetu.live](https://www.raksetu.live)
- **GitHub**: [Raksetu_SIP](https://github.com/DivyaanshuXD/Raksetu_SIP)
- **Issues**: [GitHub Issues](https://github.com/DivyaanshuXD/Raksetu_SIP/issues)
- **Email**: support@raksetu.live

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/DivyaanshuXD/Raksetu_SIP?style=social)
![GitHub forks](https://img.shields.io/github/forks/DivyaanshuXD/Raksetu_SIP?style=social)
![GitHub issues](https://img.shields.io/github/issues/DivyaanshuXD/Raksetu_SIP)
![GitHub pull requests](https://img.shields.io/github/issues-pr/DivyaanshuXD/Raksetu_SIP)

---

<div align="center">

### ⭐ Star this repository if Raksetu helps save lives! ⭐

**Made with ❤️ and ☕ by the Raksetu Team**

[🩸 Start Saving Lives](https://www.raksetu.live) | [📖 Documentation](https://github.com/DivyaanshuXD/Raksetu_SIP/wiki) | [🐛 Report Bug](https://github.com/DivyaanshuXD/Raksetu_SIP/issues) | [💡 Request Feature](https://github.com/DivyaanshuXD/Raksetu_SIP/issues)

</div>
