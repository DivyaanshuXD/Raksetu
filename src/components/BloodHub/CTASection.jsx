import { useState } from 'react';

export default function CTASection({ setActiveSection, setShowAuthModal, setAuthMode }) {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join India's largest community of blood donors. Register now to receive emergency alerts
            and track the impact of your donations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
            >
              <button
              className="bg-red-600 hover:bg-red-700 text-white px-0 py-1 rounded-lg font-semibold transition-colors flex items-center justify-center gap-0"
              onClick={() => {
                setAuthMode('donate');
                setShowAuthModal(false);
              }}
            ></button>
              Donate Now
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              onClick={() => setActiveSection('about')}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}