import { UserCircle, Heart, Users, Check, Award } from 'lucide-react';

const userDonations = [
  { id: 1, date: 'January 15, 2025', hospital: 'Apollo Hospital', bloodType: 'O+', status: 'Used', recipientAge: '45', recipientCondition: 'Post-surgery recovery', impactPoints: 150 },
  { id: 2, date: 'October 10, 2024', hospital: 'AIIMS Delhi', bloodType: 'O+', status: 'Used', recipientAge: '8', recipientCondition: 'Thalassemia treatment', impactPoints: 150 },
  { id: 3, date: 'July 5, 2024', hospital: 'Max Healthcare', bloodType: 'O+', status: 'Used', recipientAge: '32', recipientCondition: 'Accident victim', impactPoints: 150 },
];

export default function TrackDonationsSection({ isLoggedIn, setShowAuthModal, setAuthMode }) {
  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Track Your Donations</h2>

        {isLoggedIn ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                  O+
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Rahul Mehta</h3>
                  <div className="text-gray-600">3x Donor • 450 Impact Points</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">3</div>
                  <div className="text-gray-600">Donations</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">3</div>
                  <div className="text-gray-600">Lives Saved</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">450</div>
                  <div className="text-gray-600">Impact Points</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">O+</div>
                  <div className="text-gray-600">Blood Type</div>
                </div>
              </div>

              <div className="flex justify-between">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Schedule Next Donation
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Download Certificate
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Your Donation History</h3>

              <div className="space-y-4">
                {userDonations.map((donation) => (
                  <div key={donation.id} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-100 text-red-600 font-bold text-sm h-8 w-8 rounded-full flex items-center justify-center">
                          {donation.bloodType}
                        </div>
                        <div>
                          <div className="font-medium">{donation.hospital}</div>
                          <div className="text-sm text-gray-500">{donation.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                          {donation.status}
                        </span>
                        <span className="text-sm text-gray-500">+{donation.impactPoints} pts</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 pl-10">
                      Your donation helped a {donation.recipientAge}-year-old patient with {donation.recipientCondition}.
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-red-600 font-medium text-sm hover:text-red-800 transition-colors">
                  View All Donations
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Impact Recognition</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                    <Heart size={32} />
                  </div>
                  <div className="font-medium">First Donation</div>
                  <div className="text-xs text-gray-500">January 2025</div>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                    <Users size={32} />
                  </div>
                  <div className="font-medium">Emergency Hero</div>
                  <div className="text-xs text-gray-500">October 2024</div>
                </div>
                <div className="text-center opacity-40">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <Check size={32} />
                  </div>
                  <div className="font-medium">Regular Donor</div>
                  <div className="text-xs text-gray-500">Locked (5 donations)</div>
                </div>
                <div className="text-center opacity-40">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <Award size={32} />
                  </div>
                  <div className="font-medium">Silver Saver</div>
                  <div className="text-xs text-gray-500">Locked (10 donations)</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
              <UserCircle size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign in to track your donations</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Sign in to view your donation history, track the impact of your donations,
              and manage your upcoming donations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                Sign In
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}