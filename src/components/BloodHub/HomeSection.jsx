import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Share2, Droplet } from 'lucide-react';
import Modal from './Modal';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function HomeSection({ setActiveSection, isLoggedIn, emergencyRequests = [] }) {
  const [showMapDetails, setShowMapDetails] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState({ title: '', content: '', donor: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set up real-time listener for donation stories
    const storiesQuery = query(
      collection(db, 'stories'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(storiesQuery, (snapshot) => {
      const storyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storyList);
    });
    
    return () => unsubscribe();
  }, []);

  const handleViewDetails = (emergency) => {
    setSelectedEmergency(emergency);
    setShowMapDetails(true);
  };

  const handleShareStory = () => {
    setShowStoryForm(true);
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'stories'), {
        ...newStory,
        timestamp: serverTimestamp(),
        date: new Date().toISOString()
      });
      
      setNewStory({ title: '', content: '', donor: '' });
      setShowStoryForm(false);
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Failed to submit your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the 5 most recent emergency requests
  const recentEmergencies = emergencyRequests
    .sort((a, b) => new Date(b.timePosted) - new Date(a.timePosted))
    .slice(0, 5);

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Live Emergency Map */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <AlertTriangle size={18} className="text-red-600 mr-2" />
            Live Emergency Requests
          </h3>
          <div className="space-y-4">
            {recentEmergencies.length > 0 ? (
              recentEmergencies.map((emergency) => (
                <div key={emergency.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{emergency.hospital}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        {emergency.bloodType}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        emergency.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                        emergency.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {emergency.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1" /> {emergency.location || 'Location N/A'} - {emergency.distance || 'Distance N/A'}
                    </p>
                  </div>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={() => handleViewDetails(emergency)}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No emergency requests at this time.</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <button
              className="text-red-600 font-medium hover:text-red-800 transition-colors"
              onClick={() => setActiveSection('emergency')}
            >
              View all emergencies
            </button>
          </div>
        </div>

        {/* Map Details Modal */}
        {showMapDetails && selectedEmergency && (
          <Modal onClose={() => setShowMapDetails(false)}>
            <h4 className="font-bold mb-4 text-xl">Emergency Details</h4>
            <div className="space-y-2">
              <p><strong>Patient:</strong> {selectedEmergency.patientName}</p>
              <p><strong>Hospital:</strong> {selectedEmergency.hospital}</p>
              <p><strong>Blood Type:</strong> {selectedEmergency.bloodType}</p>
              <p><strong>Units Needed:</strong> {selectedEmergency.units}</p>
              <p><strong>Urgency:</strong> {selectedEmergency.urgency}</p>
              <p><strong>Location:</strong> {selectedEmergency.location || 'N/A'}</p>
              <p><strong>Contact:</strong> {selectedEmergency.contactName} ({selectedEmergency.contactPhone})</p>
              <p><strong>Notes:</strong> {selectedEmergency.notes || 'None'}</p>
              <p><strong>Time Posted:</strong> {new Date(selectedEmergency.timePosted).toLocaleString()}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowMapDetails(false);
                  setActiveSection('donate');
                }}
              >
                Donate Blood
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => setShowMapDetails(false)}
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {/* Blood Donation Stories */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Blood Donation Stories</h3>
          <div className="space-y-4">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div key={story.id} className="border-b pb-3">
                  <h4 className="font-medium">{story.title}</h4>
                  <p className="text-gray-700 my-2">{story.content}</p>
                  <p className="text-sm text-gray-500">By {story.donor} • {story.date ? new Date(story.date).toLocaleDateString() : 'Recently'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No donation stories yet. Be the first to share!</p>
            )}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm mt-4"
              onClick={handleShareStory}
            >
              <Share2 size={16} className="inline mr-2" /> Share Your Story
            </button>
          </div>
        </div>

        {showStoryForm && (
          <Modal onClose={() => setShowStoryForm(false)}>
            <h4 className="font-bold mb-4 text-xl">Share Your Donation Story</h4>
            <form onSubmit={handleStorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Give your story a title"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Story</label>
                <textarea
                  placeholder="Share your donation experience..."
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="How should we credit you?"
                  value={newStory.donor}
                  onChange={(e) => setNewStory({ ...newStory, donor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Story'}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  onClick={() => setShowStoryForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Ready to Save Lives? */}
        <div className="bg-red-50 p-6 rounded-xl text-center mb-6">
          <h3 className="text-xl font-semibold mb-4">Ready to Save Lives?</h3>
          <div className="space-x-4">
            {isLoggedIn ? (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                onClick={() => setActiveSection('donate')}
              >
                <Droplet size={16} className="inline mr-2" /> Donate Now
              </button>
            ) : (
              <>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                  onClick={() => setActiveSection('register')}
                >
                  <Droplet size={16} className="inline mr-2" /> Register as Donor
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                  onClick={() => window.open('https://raksetu.com/learn', '_blank')}
                >
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}