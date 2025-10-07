import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Phone,
  Navigation,
  Calendar,
  Clock,
  Droplet,
  Share2,
  User,
  Users,
  Star,
  Award,
  TrendingUp,
  LifeBuoy,
  Bookmark,
  Zap,
  Send,
  X
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, setDoc, collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareBloodTypes = ['O h'];

export default function EmergencySection({ setShowEmergencyModal, getUrgencyColor, emergencyRequests, userLocation, userProfile, onDonationConfirmed }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [viewingEmergency, setViewingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState(null);
  const [currentView, setCurrentView] = useState('emergency-list');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [newEmergencyNotification, setNewEmergencyNotification] = useState(null);
  const [animateNotification, setAnimateNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [isMarkClicked, setIsMarkClicked] = useState(false);
  const [respondedEmergencies, setRespondedEmergencies] = useState([]);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!userProfile || !userProfile.id) return;

    const donationsRef = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userProfile.id),
      where('type', '==', 'emergency'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      donationsRef,
      (snapshot) => {
        const responded = snapshot.docs.map((doc) => doc.data().id);
        setRespondedEmergencies(responded);
      },
      (error) => {
        console.error('Error fetching responded emergencies:', error);
        setRespondedEmergencies([]);
      }
    );

    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile || !userProfile.bloodType || !emergencyRequests) return;
    const userBloodType = userProfile.bloodType;
    const latestEmergency = emergencyRequests[0];
    if (latestEmergency && latestEmergency.bloodType === userBloodType) {
      const now = new Date();
      const emergencyTime = latestEmergency.timestamp ? new Date(latestEmergency.timestamp.seconds * 1000) : new Date();
      const timeDiff = (now - emergencyTime) / 1000 / 60;
      if (timeDiff < 5) {
        setNewEmergencyNotification(latestEmergency);
        setAnimateNotification(true);
        setTimeout(() => setAnimateNotification(false), 2000);
      }
    }
  }, [emergencyRequests, userProfile]);

  const applyFilters = useCallback(() => {
    if (!emergencyRequests) return [];
    let filtered = [...emergencyRequests];
    if (bloodTypeFilter !== 'All') filtered = filtered.filter((e) => e.bloodType === bloodTypeFilter);
    if (searchQuery) filtered = filtered.filter((e) => 
      (e.hospital && e.hospital.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (distanceFilter && userLocation) filtered = filtered.filter((e) => {
      if (!e.coordinates) return false;
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        e.coordinates.latitude,
        e.coordinates.longitude
      );
      return distance <= distanceFilter;
    });
    filtered = filtered.map((e) => {
      if (rareBloodTypes.includes(e.bloodType)) return { ...e, isRare: true };
      return { ...e, donorsResponded: e.donorsResponded || 0 };
    });
    return filtered;
  }, [emergencyRequests, bloodTypeFilter, searchQuery, distanceFilter, userLocation]);

  useEffect(() => {
    try {
      const filtered = applyFilters();
      setFilteredEmergencies(filtered);
      setIsLoading(false);
    } catch (err) {
      console.error("Error filtering emergencies:", err);
      setError("Failed to load emergency requests. Please try again.");
      setIsLoading(false);
    }
  }, [applyFilters]);

  const handleEmergencySelect = useCallback((emergency) => {
    setSelectedEmergency(emergency);
    setViewingEmergency(true);
    setCurrentView('emergency-detail');
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }, []);

  const handleEmergencyResponse = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (!userLocation || !selectedEmergency.coordinates) throw new Error("Location data is missing");
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        selectedEmergency.coordinates.latitude,
        selectedEmergency.coordinates.longitude
      );
      setNearbyDonors({
        count: Math.floor(Math.random() * 10) + 3,
        estimatedTime: `${Math.floor(distance * 3)} minutes`,
        radius: `${Math.ceil(distance)} km`,
      });
      setCurrentView('donor-confirmation');
    } catch (error) {
      console.error("Error calculating nearby donors:", error);
      setNearbyDonors({ count: 8, estimatedTime: '15 minutes', radius: '5 km' });
      setCurrentView('donor-confirmation');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency, userLocation]);

  const handleSMSEmergencyResponse = useCallback(async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://raksetu-backend.vercel.app/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmergency.contactPhone,
          message: `Donor responding to donate ${selectedEmergency.bloodType} blood at ${selectedEmergency.hospital}, ${selectedEmergency.location}`,
        }),
      });
      if (response.ok) setCurrentView('donation-confirmed');
      else throw new Error('Failed to send SMS');
    } catch (error) {
      console.error("Error sending SMS:", error);
      setError("Failed to send SMS. Please try again when online.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency]);

  const confirmDonation = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (selectedEmergency && selectedEmergency.id) {
        const newDonorsResponded = (selectedEmergency.donorsResponded || 0) + 1;

        await updateDoc(doc(db, 'emergencyRequests', selectedEmergency.id), {
          donorsResponded: newDonorsResponded,
          donorResponseTime: new Date().toISOString(),
        });

        if (newDonorsResponded >= (selectedEmergency.units || 1)) {
          await deleteDoc(doc(db, 'emergencyRequests', selectedEmergency.id));
        }

        const donationDetails = {
          id: selectedEmergency.id,
          userId: userProfile.id,
          type: 'emergency',
          hospital: selectedEmergency.hospital,
          location: selectedEmergency.location,
          bloodType: selectedEmergency.bloodType,
          units: selectedEmergency.units || 1,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toISOString().split('T')[1].split('.')[0],
          points: 0, // Points will be awarded after marking as completed
          status: 'pending',
          timestamp: new Date().toISOString(),
        };

        const donationRef = doc(collection(db, 'donationsDone'));
        await setDoc(donationRef, {
          ...donationDetails,
          donationId: donationRef.id,
        });

        if (userProfile?.phoneNumber) {
          await fetch('https://raksetu-backend.vercel.app/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: userProfile.phoneNumber,
              message: `Thank you for confirming your donation! Details:\nHospital: ${selectedEmergency.hospital}\nLocation: ${selectedEmergency.location}\nBlood Type: ${selectedEmergency.bloodType}\nUnits: ${selectedEmergency.units || 1}\nContact: ${selectedEmergency.contactPhone || 'Hospital Contact'}\nPoints will be awarded after donation is completed.`,
            }),
          });
        }

        if (onDonationConfirmed) {
          console.log('Calling onDonationConfirmed with:', donationDetails);
          onDonationConfirmed(donationDetails);
        }

        setCurrentView('donation-confirmed');
      }
    } catch (error) {
      console.error("Error confirming donation:", error);
      setError('Failed to confirm donation. Please try again.');
      setCurrentView('donation-confirmed');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency, userProfile, onDonationConfirmed]);

  const backToEmergencies = useCallback(() => {
    setViewingEmergency(false);
    setSelectedEmergency(null);
    setNearbyDonors(null);
    setCurrentView('emergency-list');
    setNewEmergencyNotification(null);
    setShowChat(false);
    setChatId(null);
    setChatMessages([]);
  }, []);

  const initializeChat = useCallback(async () => {
    console.log("Initializing chat...");
    if (!userProfile || !selectedEmergency) {
      console.log("Missing userProfile or selectedEmergency:", { userProfile, selectedEmergency });
      return;
    }

    try {
      console.log("Authenticated user ID:", userProfile?.id);
      const chatsQuery = query(
        collection(db, 'chats'),
        where('emergencyId', '==', selectedEmergency.id),
        where('participants', 'array-contains', userProfile.id)
      );
      const chatSnapshot = await getDocs(chatsQuery);
      console.log("Chat snapshot:", chatSnapshot.empty ? "No existing chat" : chatSnapshot.docs[0].id);

      let chatDocId;
      if (!chatSnapshot.empty) {
        chatDocId = chatSnapshot.docs[0].id;
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        chatDocId = newChatRef.id;
        console.log("Creating new chat with participants:", [userProfile.id, selectedEmergency.contactId || 'hospital']);
        await setDoc(newChatRef, {
          emergencyId: selectedEmergency.id,
          participants: [userProfile.id, selectedEmergency.contactId || 'hospital'],
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
        });
      }

      setChatId(chatDocId);
      console.log("Chat ID set to:", chatDocId);

      const messagesQuery = query(
        collection(db, 'chats', chatDocId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      console.log("Listening to messages at:", messagesQuery.path);
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        console.log("Messages snapshot:", snapshot.docs.length, "messages found");
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatMessages(messages);
        console.log("Updated chat messages:", messages);
      }, (error) => {
        console.error('Error listening to chat messages:', error);
        setError('Failed to load chat messages. Please try again.');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize chat. Please try again.');
    }
  }, [userProfile, selectedEmergency]);

  useEffect(() => {
    console.log("showChat state:", showChat, "chatId:", chatId);
    if (showChat && !chatId) {
      initializeChat();
    }
  }, [showChat, chatId, initializeChat]);

  const handleSendMessage = useCallback(async () => {
    console.log("Sending message:", chatInput);
    if (!chatInput.trim() || !chatId || !userProfile) {
      console.log("Cannot send message. Missing data:", { chatInput, chatId, userProfile });
      return;
    }

    try {
      const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
      console.log("Saving message to:", messageRef.path);
      await setDoc(messageRef, {
        text: chatInput,
        senderId: userProfile.id,
        senderName: userProfile.name || 'User',
        timestamp: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessageAt: new Date().toISOString(),
      });

      setChatInput('');
      console.log("Message sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  }, [chatInput, chatId, userProfile]);

  const LoadingPulse = () => (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-red-500 opacity-20 animate-ping"></div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-red-600"></div>
      </div>
      <span className="mt-4 text-red-600 font-medium">Loading requests...</span>
    </div>
  );

  const BloodDropIllustration = () => (
    <div className="w-24 h-24 mx-auto mb-4 relative">
      <div className="absolute inset-0 animate-pulse">
        <div className="w-full h-full bg-red-500 rounded-t-full rounded-b-lg transform rotate-45 opacity-20"></div>
      </div>
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-red-600 rounded-t-full rounded-b-lg transform rotate-45"></div>
    </div>
  );

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    const now = new Date();
    const emergencyTime = new Date(timestamp.seconds * 1000);
    const diff = now - emergencyTime;
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} hr ago`;
    return `${Math.floor(minutes / 60 / 24)} days ago`;
  };

  const EmergencyCard = ({ emergency }) => {
    const impactLevel = emergency.urgency === "Critical" ? 
      "high" : (emergency.units > 2 ? "medium" : "standard");
    const hasResponded = respondedEmergencies.includes(emergency.id);

    return (
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-gray-100 ${
          hasResponded
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        }`}
        onClick={() => {
          if (hasResponded) {
            alert("You've already responded to this emergency and confirmed your donation. Please mark it as completed in the Track section after donating.");
            return;
          }
          handleEmergencySelect(emergency);
        }}
        aria-label={`Emergency request for blood type ${emergency.bloodType} at ${emergency.hospital}`}
      >
        <div className="relative">
          <div className={`h-2 w-full ${
            emergency.urgency === "Critical" ? "bg-red-500" : 
            emergency.urgency === "Urgent" ? "bg-orange-500" : 
            "bg-yellow-500"
          }`}></div>
          <div className="p-4 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{emergency.hospital}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin size={14} className="mr-1 text-gray-400" /> {emergency.location}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  emergency.urgency === "Critical" ? "bg-red-100 text-red-700" : 
                  emergency.urgency === "Urgent" ? "bg-orange-100 text-orange-700" : 
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {emergency.urgency}
                </span>
                <span className="text-xs text-gray-500 mt-1">{formatTimeAgo(emergency.timestamp)}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Droplet size={24} className="text-red-500" />
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-bold text-lg text-red-600">{emergency.bloodType}</span>
                  {emergency.isRare && (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                      Rare
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {emergency.units || 1} {emergency.units > 1 ? 'units' : 'unit'} needed
                </p>
              </div>
            </div>
            {impactLevel !== "standard" && (
              <div className="mt-3 flex items-center gap-1">
                {impactLevel === "high" ? (
                  <LifeBuoy size={16} className="text-red-500" />
                ) : (
                  <TrendingUp size={16} className="text-orange-500" />
                )}
                <span className={`text-xs font-medium ${
                  impactLevel === "high" ? "text-red-500" : "text-orange-500"
                }`}>
                  {impactLevel === "high" ? "High impact opportunity" : "Medium impact opportunity"}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 p-3 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Users size={14} className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {emergency.donorsResponded || 0} donors responding
              </span>
            </div>
            <button
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                hasResponded
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasResponded) {
                  alert("You've already responded to this emergency and confirmed your donation. Please mark it as completed in the Track section after donating.");
                  return;
                }
                handleEmergencySelect(emergency);
              }}
              disabled={hasResponded}
            >
              {hasResponded ? "You've Responded" : "Respond"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EmergencyList = ({ filteredEmergencies }) => (
    <div className="space-y-4">
      {filteredEmergencies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmergencies.map((emergency) => (
            <EmergencyCard key={emergency.id} emergency={emergency} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
          {isLoading ? (
            <LoadingPulse />
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <BloodDropIllustration />
              <p className="text-gray-700 font-medium text-lg">No emergency requests found</p>
              <p className="text-gray-500 mt-1">Be the first to save lives in your area</p>
              {bloodTypeFilter !== 'All' && (
                <p className="text-sm text-gray-400 mt-2">Try changing your blood type filter</p>
              )}
              <button
                className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
                onClick={() => setShowEmergencyModal(true)}
              >
                <Zap size={18} />
                Create Emergency Request
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="sticky top-0 pt-2 pb-4 bg-gradient-to-b from-gray-50 to-gray-50/95 backdrop-blur-sm z-10">
      {newEmergencyNotification && (
        <div className={`mb-4 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg flex items-center justify-between transition-all duration-500 ${animateNotification ? 'transform scale-105' : ''}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Urgent Blood Need!</h4>
              <p className="text-sm text-white/90">
                {newEmergencyNotification.bloodType} needed at {newEmergencyNotification.hospital}
              </p>
            </div>
          </div>
          <button
            className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-lg transition-colors"
            onClick={() => {
              handleEmergencySelect(newEmergencyNotification);
              setNewEmergencyNotification(null);
            }}
          >
            Respond Now
          </button>
        </div>
      )}
      <div className="flex items-center justify-center mb-6">
        <Droplet size={24} className="text-red-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Emergency Requests</h2>
        <Droplet size={24} className="text-red-600 ml-2" />
      </div>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search hospitals or locations..."
          className="pl-11 pr-10 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search hospitals or locations"
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <button
            className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left shadow-sm hover:border-gray-300 transition-colors"
            onClick={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}
            aria-expanded={showBloodTypeDropdown}
            aria-haspopup="listbox"
          >
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <Droplet size={14} className="text-red-600" />
              </div>
              <span>{bloodTypeFilter === 'All' ? 'All Blood Types' : `Blood Type: ${bloodTypeFilter}`}</span>
              
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform duration-300 ${showBloodTypeDropdown ? 'transform rotate-180' : ''}`}
            />
          </button>
          {showBloodTypeDropdown && (
            <div
              className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
              role="listbox"
            >
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  className={`block w-full text-left px-4 py-3 hover:bg-red-50 transition-colors ${
                    bloodTypeFilter === type ? 'bg-red-50 text-red-600' : ''
                  }`}
                  onClick={() => {
                    setBloodTypeFilter(type);
                    setShowBloodTypeDropdown(false);
                  }}
                  role="option"
                  aria-selected={bloodTypeFilter === type}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      bloodTypeFilter === type ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {bloodTypeFilter === type ? (
                        <Check size={14} className="text-red-600" />
                      ) : (
                        <Droplet size={14} className="text-gray-400" />
                      )}
                    </div>
                    {type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <select
            className="appearance-none px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={distanceFilter || ''}
            onChange={(e) => setDistanceFilter(e.target.value ? Number(e.target.value) : null)}
            aria-label="Filter by distance"
            style={{ minWidth: '140px' }}
          >
            <option value="">All Distances</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
      {(searchQuery || bloodTypeFilter !== 'All' || distanceFilter) && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center text-gray-500">
            <Filter size={14} className="mr-1" />
            <span>
              {filteredEmergencies.length}
              {filteredEmergencies.length === 1 ? 'result' : 'results'} found
            </span>
          </div>
          <button
            className="text-red-600 hover:text-red-700 flex items-center"
            onClick={() => {
              setSearchQuery('');
              setBloodTypeFilter('All');
              setDistanceFilter(null);
            }}
          >
            <X size={14} className="mr-1" />
            Clear filters
          </button>
        </div>
      )}
      <div className="mt-4">
        <button
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          onClick={() => setShowEmergencyModal(true)}
        >
          <Zap size={18} />
          Create Emergency Request
        </button>
      </div>
      {!isOnline && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
            <AlertCircle size={18} className="text-red-600" />
          </div>
          <span className="text-sm">
            You are offline. Some features may be limited. Use SMS to respond to emergencies.
          </span>
        </div>
      )}
    </div>
  );

  const renderEmergencyDetail = () => {
    if (!selectedEmergency) return null;
    
    const compatibilityScore = selectedEmergency.bloodType === (userProfile?.bloodType || 'A+') ? 
      100 : (selectedEmergency.bloodType.includes(userProfile?.bloodType?.charAt(0) || 'A') ? 70 : 40);

    return (
      <div className="space-y-4">
        <button
          className="flex items-center text-red-600 mb-4 hover:text-red-700 transition-colors"
          onClick={backToEmergencies}
          aria-label="Back to emergencies list"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to emergencies
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`h-2 w-full ${
            selectedEmergency.urgency === "Critical" ? "bg-red-500" : 
            selectedEmergency.urgency === "Urgent" ? "bg-orange-500" : 
            "bg-yellow-500"
          }`}></div>
          
          {selectedEmergency.isRare && (
            <div className="m-4 p-3 bg-purple-50 text-purple-800 rounded-lg text-sm flex items-center border border-purple-100">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                <AlertTriangle size={16} className="text-purple-700" />
              </div>
              <div>
                <p className="font-medium">Rare Blood Type Alert</p>
                <p className="text-sm text-purple-700">This request is for {selectedEmergency.bloodType}, an extremely rare blood group.</p>
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-gray-800">{selectedEmergency.hospital}</h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin size={14} className="mr-1 text-gray-400" /> {selectedEmergency.location}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                selectedEmergency.urgency === "Critical" ? "bg-red-100 text-red-700" : 
                selectedEmergency.urgency === "Urgent" ? "bg-orange-100 text-orange-700" : 
                "bg-yellow-100 text-yellow-700"
              }`}>
                {selectedEmergency.urgency}
              </span>
            </div>
            
            <div className="mt-6 flex items-center">
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">{selectedEmergency.bloodType}</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-800">Blood Type Needed</h4>
                <p className="text-gray-600 text-sm">
                  {selectedEmergency.units || 1} {selectedEmergency.units > 1 ? 'units' : 'unit'} required
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-700">
                {selectedEmergency.notes ||
                  `Urgent need for ${selectedEmergency.bloodType} blood for a patient undergoing emergency treatment.`}
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Droplet size={16} className="text-red-500" />
                </div>
                <div className="text-gray-500 text-xs">Units Needed</div>
                <div className="font-semibold text-gray-800">{selectedEmergency.units || 1}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Navigation size={16} className="text-blue-500" />
                </div>
                <div className="text-gray-500 text-xs">Distance</div>
                <div className="font-semibold text-gray-800">
                  {userLocation && selectedEmergency.coordinates
                    ? `${calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedEmergency.coordinates.latitude,
                        selectedEmergency.coordinates.longitude
                      )} km`
                    : "Unknown"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Clock size={16} className="text-green-500" />
                </div>
                <div className="text-gray-500 text-xs">Posted</div>
                <div className="font-semibold text-gray-800">
                  {formatTimeAgo(selectedEmergency.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <span>Your Compatibility</span>
                <div className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {userProfile?.bloodType || 'Unknown'}
                </div>
              </h4>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    compatibilityScore === 100 ? 'bg-green-500' :
                    compatibilityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${compatibilityScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {compatibilityScore === 100 
                  ? "Perfect match! You're an ideal donor for this request."
                  : compatibilityScore >= 70 
                    ? "Potential match. You may be able to donate."
                    : "Low compatibility. Consider other requests that better match your blood type."}
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User size={16} className="mr-2 text-gray-500" />
                Contact Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedEmergency.contactName || "Hospital Blood Bank"}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {selectedEmergency.contactPhone || "Contact hospital directly"}
                    </p>
                  </div>
                  {selectedEmergency.contactPhone && (
                    <a
                      href={`tel:${selectedEmergency.contactPhone}`}
                      className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
                      aria-label="Call contact"
                    >
                      <Phone size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              {isOnline ? (
                <>
                  <button
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                    onClick={handleEmergencyResponse}
                    disabled={isProcessing}
                  >
                    <Heart size={18} />
                    Respond Now
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
                      onClick={() => {
                        console.log("Opening chat...");
                        setShowChat(true);
                      }}
                      aria-label="Message"
                    >
                      <MessageCircle size={18} className="text-gray-600" />
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEmergency.coordinates?.latitude},${selectedEmergency.coordinates?.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
                      aria-label="Navigate to location"
                    >
                      <Navigation size={18} className="text-gray-600" />
                    </a>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
                      aria-label="Share"
                    >
                      <Share2 size={18} className="text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                  onClick={handleSMSEmergencyResponse}
                  disabled={isProcessing}
                >
                  <MessageCircle size={18} />
                  Respond via SMS
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Nearby Blood Banks</h4>
          <div className="space-y-3">
            {[1, 2].map((idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {idx === 1 ? "City General Hospital" : "Medical Center Blood Bank"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {idx === 1 ? "2.3 km away" : "4.1 km away"}
                  </p>
                </div>
                <a
                  href="#"
                  className="text-blue-600 text-sm font-medium"
                >
                  Details
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDonorConfirmation = () => {
    if (!selectedEmergency || !nearbyDonors) return null;
    
    return (
      <div className="space-y-4">
        <button
          className="flex items-center text-red-600 mb-4 hover:text-red-700 transition-colors"
          onClick={() => setCurrentView('emergency-detail')}
          aria-label="Back to emergency details"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to emergency details
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-2 w-full bg-green-500"></div>
          
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-200">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Blood Match Found!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your blood type matches this request. You can make a significant impact by donating today.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                <Users size={20} className="text-blue-500 mb-2" />
                <span className="text-xs text-gray-500">Potential Donors</span>
                <span className="font-bold text-xl text-gray-800">{nearbyDonors.count}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                <Clock size={20} className="text-orange-500 mb-2" />
                <span className="text-xs text-gray-500">Arrival Time</span>
                <span className="font-bold text-xl text-gray-800">{nearbyDonors.estimatedTime.split(' ')[0]}<span className="text-sm font-normal ml-1">min</span></span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                <Navigation size={20} className="text-purple-500 mb-2" />
                <span className="text-xs text-gray-500">Distance</span>
                <span className="font-bold text-xl text-gray-800">{nearbyDonors.radius.split(' ')[0]}<span className="text-sm font-normal ml-1">km</span></span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg mb-6 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Droplet size={24} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-gray-800 font-medium">Your blood type: <span className="text-red-600 font-bold">{selectedEmergency.bloodType}</span></p>
                  <p className="text-sm text-gray-600">
                    Perfect match for this emergency request
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className="text-left">
                  <p className="font-medium text-gray-800">Hospital</p>
                  <p className="text-sm text-gray-600">{selectedEmergency.hospital}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">Blood Type</p>
                  <p className="text-sm text-gray-600">{selectedEmergency.bloodType}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                  onClick={confirmDonation}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirm Donation
                    </>
                  )}
                </button>
                <button
                  className="w-full bg-white text-gray-700 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setCurrentView('emergency-detail')}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                By confirming, you agree to the donor guidelines and requirements.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleShareDonation = () => {
    const donationId = selectedEmergency.id;
    const shareUrl = `${window.location.origin}/donation/${donationId}`;
    const shareData = {
      title: 'Blood Donation Confirmation',
      text: `I just confirmed a blood donation! Details:\nHospital: ${selectedEmergency.hospital}\nLocation: ${selectedEmergency.location}\nBlood Type: ${selectedEmergency.bloodType}\nUnits: ${selectedEmergency.units || 1}\nPoints will be awarded after donation is completed.`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => setIsShareClicked(true))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(`${shareData.text}\nLink: ${shareUrl}`)
        .then(() => {
          setIsShareClicked(true);
          alert('Share details and link copied to clipboard:\n' + shareData.text + '\nLink: ' + shareUrl);
        })
        .catch((error) => {
          console.error('Error copying share details:', error);
          alert('Failed to copy share details. Please try again.');
        });
    }
  };

  const handleSaveDonation = () => {
    const donationDetailsText = `
Blood Donation Confirmation
Hospital: ${selectedEmergency.hospital}
Location: ${selectedEmergency.location}
Blood Type: ${selectedEmergency.bloodType}
Units: ${selectedEmergency.units || 1}
Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Points will be awarded after donation is completed.
    `.trim();

    navigator.clipboard
      .writeText(donationDetailsText)
      .then(() => {
        setShowSaveSuccessModal(true);
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy to clipboard. Please try again.');
      });

    const savedDonations = JSON.parse(localStorage.getItem('savedDonations') || '[]');
    const donationDetails = {
      id: selectedEmergency.id,
      hospital: selectedEmergency.hospital,
      location: selectedEmergency.location,
      bloodType: selectedEmergency.bloodType,
      units: selectedEmergency.units || 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString().split('T')[1].split('.')[0],
      points: 0, // Points will be awarded after marking as completed
    };
    savedDonations.push(donationDetails);
    localStorage.setItem('savedDonations', JSON.stringify(savedDonations));
  };

  const handleMarkDonation = async () => {
    try {
      const donationsQuery = query(
        collection(db, 'donationsDone'),
        where('userId', '==', userProfile.id),
        where('id', '==', selectedEmergency.id),
        where('type', '==', 'emergency'),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(donationsQuery);
      if (snapshot.empty) {
        throw new Error('Donation not found in donationsDone');
      }

      const donationDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'donationsDone', donationDoc.id), {
        status: 'completed',
        points: 150, // Award points when marking as completed
        markedAt: new Date().toISOString(),
      });

      // Update user profile with new points
      const userRef = doc(db, 'users', userProfile.id);
      await updateDoc(userRef, {
        impactPoints: (userProfile.impactPoints || 0) + 150,
      });

      setIsMarkClicked(true);
      alert('Donation marked as completed! You have earned 150 Impact Points.');
    } catch (error) {
      console.error('Error marking donation:', error);
      setError('Failed to mark donation. Please try again.');
    }
  };

  const renderDonationConfirmed = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-3 w-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
          
          <div className="p-6 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-500 opacity-10 animate-ping rounded-full"></div>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto relative z-10 border-4 border-green-200">
                <Heart size={48} className="text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You, Lifesaver!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your commitment to donate blood will help save lives. The hospital has been notified of your arrival. Please mark the donation as completed in the Track section after donating to earn your Impact Points.
            </p>
            
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
              <div className="divide-y divide-gray-100">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-800 font-medium">Hospital</span>
                  </div>
                  <span className="font-semibold text-gray-700">{selectedEmergency.hospital}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Navigation size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-800 font-medium">Location</span>
                  </div>
                  <span className="font-semibold text-gray-700">{selectedEmergency.location}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Droplet size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-800 font-medium">Blood Type</span>
                  </div>
                  <span className="font-semibold text-gray-700">{selectedEmergency.bloodType}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-800 font-medium">Contact</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {selectedEmergency.contactPhone || "Hospital Contact"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEmergency.coordinates?.latitude},${selectedEmergency.coordinates?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                Get Directions
              </a>
              <button
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                onClick={backToEmergencies}
              >
                <Heart size={18} className="text-red-500" />
                View Other Emergencies
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              <button 
                onClick={handleShareDonation}
                className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                  isShareClicked ? 'bg-red-100 scale-110' : 'hover:bg-gray-50'
                }`}
                aria-label="Share donation"
              >
                <Share2 size={18} className={`${
                  isShareClicked ? 'text-red-600' : 'text-red-500'
                }`} />
              </button>
              <button 
                onClick={handleSaveDonation}
                className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                  isSaveClicked ? 'bg-red-100 scale-110' : 'hover:bg-gray-50'
                }`}
                aria-label="Save donation"
              >
                <Bookmark size={18} className={`${
                  isSaveClicked ? 'text-red-600' : 'text-red-500'
                }`} />
              </button>
              <button 
                onClick={handleMarkDonation}
                className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                  isMarkClicked ? 'bg-green-100 scale-110' : 'hover:bg-gray-50'
                }`}
                aria-label="Mark donation as completed"
              >
                <CheckCircle size={18} className={`${
                  isMarkClicked ? 'text-green-600' : 'text-green-500'
                }`} />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Make sure to drink plenty of water and eat before donating.
              </p>
            </div>
          </div>
        </div>
        
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg flex items-center gap-2 p-4 max-w-md w-full animate-fadeIn border border-gray-200">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <span className="text-gray-800">Donation confirmed successfully!</span>
          <button
            className="ml-auto bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => backToEmergencies()}
          >
            Close
          </button>
        </div>

        {showSaveSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Saved Successfully!</h3>
              <p className="text-gray-600 mb-6">Donation details have been copied to your clipboard.</p>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                onClick={() => setShowSaveSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChatInterface = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-80 h-[500px] flex flex-col border border-gray-200">
        <div className="flex justify-between items-center p-4 bg-red-600 text-white rounded-t-lg">
          <h3 className="text-lg font-bold">Chat with {selectedEmergency?.hospital}</h3>
          <button onClick={() => setShowChat(false)} className="hover:bg-red-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500">Start the conversation...</div>
          ) : (
            chatMessages.map((msg, index) => (
              <div key={msg.id || index} className={`mb-2 ${msg.senderId === userProfile?.id ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.senderId === userProfile?.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  {msg.text}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t flex">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 border rounded-l-lg"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-red-600 text-white p-2 rounded-r-lg hover:bg-red-700"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'emergency-list':
        return <EmergencyList filteredEmergencies={filteredEmergencies} />;
      case 'emergency-detail':
        return renderEmergencyDetail();
      case 'donor-confirmation':
        return renderDonorConfirmation();
      case 'donation-confirmed':
        return renderDonationConfirmed();
      default:
        return <div className="text-center py-10 text-red-600">Error: Unknown view</div>;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBloodTypeDropdown) setShowBloodTypeDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBloodTypeDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500 opacity-5 rounded-full"></div>
        <div className="absolute top-1/4 -left-12 w-40 h-40 bg-red-500 opacity-5 rounded-full"></div>
        <div className="absolute bottom-1/3 right-0 w-52 h-52 bg-red-500 opacity-5 rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-lg mx-auto p-4">
        {currentView === 'emergency-list' && renderSearchAndFilters()}
        <div className="flex-1 overflow-y-auto pb-16">
          {renderCurrentView()}
        </div>
        {currentView === 'emergency-list' && filteredEmergencies.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 rounded-t-xl shadow-lg flex items-center justify-between backdrop-blur-sm bg-white/90">
            <span className="text-sm text-gray-600 flex items-center">
              <LifeBuoy size={16} className="text-red-500 mr-2" />
              {filteredEmergencies.length} active {filteredEmergencies.length === 1 ? 'request' : 'requests'}
            </span>
            <button
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              View all
              <ChevronDown size={16} className="ml-1 transform rotate-180" />
            </button>
          </div>
        )}
      </div>

      {showChat && renderChatInterface()}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}