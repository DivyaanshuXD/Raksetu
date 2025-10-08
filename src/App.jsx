import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider, EmergencyProvider } from './context';
import { ToastProvider } from './context/ToastContext';
import BloodHub from './components/BloodHub/BloodHub';
import OfflineBanner from './components/common/OfflineBanner';
import RefundPolicy from './pages/RefundPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ShippingPolicy from './pages/ShippingPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import PartnershipsPage from './pages/PartnershipsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EmergencyProvider>
          <ToastProvider>
            <Router>
              <OfflineBanner />
              <Routes>
                <Route path="/*" element={<BloodHub />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/partnerships" element={<PartnershipsPage />} />
              </Routes>
            </Router>
          </ToastProvider>
        </EmergencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}