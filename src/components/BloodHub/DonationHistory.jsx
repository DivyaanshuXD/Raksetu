import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Droplet } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';

export default function DonationHistory({ setActiveSection, setShowAuthModal, setAuthMode }) {
  const [appointments, setAppointments] = useState([]);
  const [userDrives, setUserDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toLocaleString() || '',
        };
      });
      setAppointments(appointmentList);
    }, (error) => {
      console.error("Error fetching appointments:", error);
    });

    const userDrivesQuery = query(
      collection(db, 'userDrives'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('registeredAt', 'desc')
    );
    const unsubscribeUserDrives = onSnapshot(userDrivesQuery, (snapshot) => {
      const driveList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate().toLocaleString() || '',
        };
      });
      setUserDrives(driveList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user drives:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeUserDrives();
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
        <p>Loading your donation history...</p>
      </div>
    );
  }

  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Donation History</h2>

        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Your Appointments</h3>
          {appointments.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600">You have no scheduled or completed appointments.</p>
              <button
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setActiveSection('donate')}
              >
                Schedule a Donation
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                      <Droplet size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.bankName}</h4>
                      <div className="text-sm text-gray-500 mb-2">Status: {appointment.status}</div>
                      <div className="text-sm mb-3">
                        <div className="flex items-center mb-1">
                          <Calendar size={14} className="mr-1 text-gray-500" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Clock size={14} className="mr-1 text-gray-500" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-500" />
                          <span>{appointment.bankName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Your Blood Drive Registrations</h3>
          {userDrives.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600">You have not registered for any blood drives.</p>
              <button
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setActiveSection('donate')}
              >
                Find Blood Drives
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userDrives.map((drive) => (
                <div key={drive.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium">{drive.driveName}</h4>
                      <div className="text-sm text-gray-500 mb-2">{drive.organizer}</div>
                      <div className="text-sm mb-3">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="mr-1 text-gray-500" />
                          <span>{drive.location}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Calendar size={14} className="mr-1 text-gray-500" />
                          <span>{drive.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-gray-500" />
                          <span>{drive.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}