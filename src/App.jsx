import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Assuming you have i18n setup
import { ThemeProvider } from './context/ThemeContext';
import BloodHub from './components/BloodHub/BloodHub';
import ProfileSection from './components/BloodHub/ProfileSection';

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Routes>
            <Route path="/*" element={<BloodHub />} />
          </Routes>
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}