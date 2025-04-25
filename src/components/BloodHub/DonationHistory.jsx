export default function DonationHistory({ userDonations }) {
  return (
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
  );
}