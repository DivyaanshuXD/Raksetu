import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { auth, db, storage } from '../utils/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, User, Calendar, MapPin, Phone, Droplet, Clock, X, Award, Heart, CheckCircle2, Shield, TrendingUp, Trophy, Target, Zap } from 'lucide-react';
import EmailVerificationBanner from './EmailVerificationBanner';
import AchievementTracker from './AchievementTracker';
import Leaderboard from './Leaderboard';
import ChallengesSection from './ChallengesSection';
import ProfileBadge from './ProfileBadge';
import { calculateTotalPoints, getUserBadgeLevel, getNextBadge } from '../../utils/gamification';
import { saveProfileOffline, getProfileOffline, saveDonationsOffline, getDonationsOffline } from '../../utils/offlineStorage';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileSection({ userProfile, isLoading, setActiveSection }) {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    dob: '',
    lastDonated: '',
    address: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  // Add privacy settings to state
  const [shareBloodType, setShareBloodType] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);
  // Real-time statistics
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesSaved: 0,
    upcomingAppointments: 0,
    loading: true
  });
  // Gamification state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'achievements', 'leaderboard', 'challenges'
  const [donations, setDonations] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [nextBadge, setNextBadge] = useState(null);
  // ML Engagement Score state
  const [engagementScore, setEngagementScore] = useState(null);
  const [loadingEngagement, setLoadingEngagement] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          logger.error('No authenticated user found');
          return;
        }

        // Check for offline cached profile first
        if (!navigator.onLine) {
          logger.info('📴 Offline - loading cached profile');
          const cachedProfile = await getProfileOffline(currentUser.uid);
          if (cachedProfile) {
            setUser(cachedProfile);
            setEditData({
              name: cachedProfile.name,
              email: cachedProfile.email,
              phone: cachedProfile.phone,
              bloodType: cachedProfile.bloodType,
              dob: cachedProfile.dob,
              lastDonated: cachedProfile.lastDonated,
              address: cachedProfile.address,
              city: cachedProfile.city
            });
            setShareBloodType(cachedProfile.shareBloodType ?? true);
            setShareLocation(cachedProfile.shareLocation ?? false);
            logger.info('✅ Loaded cached profile');
            return;
          }
        }

        const providerData = currentUser.providerData || [];
        const googleProvider = providerData.find(provider => provider.providerId === 'google.com');
        setIsGoogleUser(!!googleProvider);

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        let userData = {
          name: currentUser.displayName || 'User',
          email: currentUser.email || 'Not provided',
          phone: currentUser.phoneNumber || 'Not provided',
          photoURL: currentUser.photoURL || null,
          bloodType: '',
          dob: '',
          lastDonated: '',
          address: '',
          city: ''
        };

        if (userDoc.exists()) {
          const firebaseData = userDoc.data();
          userData = {
            ...userData,
            name: firebaseData.name || userData.name,
            phone: firebaseData.phone || userData.phone,
            photoURL: firebaseData.photoURL || userData.photoURL,
            bloodType: firebaseData.bloodType || userData.bloodType,
            dob: firebaseData.dob || userData.dob,
            lastDonated: firebaseData.lastDonated || userData.lastDonated,
            address: firebaseData.address || userData.address,
            city: firebaseData.city || userData.city,
            // Fetch privacy settings
            shareBloodType: firebaseData.shareBloodType ?? true,
            shareLocation: firebaseData.shareLocation ?? false
          };
          // Update local state for privacy settings
          setShareBloodType(userData.shareBloodType);
          setShareLocation(userData.shareLocation);
        }

        logger.info('Fetched user data:', userData);
        setUser(userData);
        setEditData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          bloodType: userData.bloodType,
          dob: userData.dob,
          lastDonated: userData.lastDonated,
          address: userData.address,
          city: userData.city
        });

        // Cache profile for offline access
        await saveProfileOffline(currentUser.uid, userData);
        logger.info('💾 Profile cached for offline access');

        // userProfile will be automatically updated by AuthContext via Firestore subscription
      } catch (err) {
        logger.error('Error fetching profile:', err.message, err.code);
      }
    };

    fetchUserProfile();
  }, []); // No dependencies needed - runs once on mount

  useEffect(() => {
    if (showEditModal) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [showEditModal]);

  // Fetch REAL-TIME donation statistics from ACTUAL donations
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Check for offline cached donations first
    const loadCachedData = async () => {
      if (!navigator.onLine) {
        logger.info('📴 Offline - loading cached donations');
        const cachedDonations = await getDonationsOffline(currentUser.uid);
        if (cachedDonations && cachedDonations.length > 0) {
          const completedDonations = cachedDonations.filter(d => 
            d.type === 'donation' || d.status === 'completed'
          );
          const totalDonations = completedDonations.length;
          const livesSaved = totalDonations * 3;
          
          let lastDonationDate = null;
          if (completedDonations.length > 0) {
            const sortedDonations = completedDonations
              .filter(d => d.createdAt || d.date)
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date);
                const dateB = new Date(b.createdAt || b.date);
                return dateB - dateA;
              });
            if (sortedDonations.length > 0) {
              const lastDonation = sortedDonations[0];
              lastDonationDate = new Date(lastDonation.createdAt || lastDonation.date);
            }
          }

          const now = new Date();
          const upcomingAppointments = cachedDonations.filter(doc => {
            if (doc.type !== 'appointment' || !doc.appointmentDate) return false;
            const appointmentDate = new Date(doc.appointmentDate);
            return appointmentDate > now && doc.status !== 'completed' && doc.status !== 'cancelled';
          }).length;

          setStats({
            totalDonations,
            livesSaved,
            upcomingAppointments,
            lastDonationDate,
            loading: false
          });
          setDonations(cachedDonations);
          logger.info('✅ Loaded cached donations');
          return true;
        }
      }
      return false;
    };

    loadCachedData().then(usedCache => {
      if (usedCache) return; // Don't set up Firebase listeners if offline

      // Query both collections for comprehensive data
      const donationsQuery = query(
        collection(db, 'donations'),
        where('userId', '==', currentUser.uid)
      );
      
      const donationsDoneQuery = query(
        collection(db, 'donationsDone'),
        where('userId', '==', currentUser.uid)
      );

      // Subscribe to both collections
      const unsubscribe1 = onSnapshot(donationsQuery, (donationsSnapshot) => {
        const unsubscribe2 = onSnapshot(donationsDoneQuery, (donationsDoneSnapshot) => {
          // Get all donations from both collections
          const allDonationsData = [
            ...donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ...donationsDoneSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          ];

          // Count completed donations (exclude appointments)
          const completedDonations = allDonationsData.filter(d => 
            d.type === 'donation' || d.status === 'completed'
          );
          const totalDonations = completedDonations.length;
          const livesSaved = totalDonations * 3; // Each donation saves up to 3 lives

          // Find last donation date from ACTUAL donations
          let lastDonationDate = null;
          if (completedDonations.length > 0) {
            const sortedDonations = completedDonations
              .filter(d => d.createdAt || d.date)
              .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.date || a.createdAt);
                const dateB = b.createdAt?.toDate?.() || new Date(b.date || b.createdAt);
                return dateB - dateA;
              });
            if (sortedDonations.length > 0) {
              const lastDonation = sortedDonations[0];
              lastDonationDate = lastDonation.createdAt?.toDate?.() || new Date(lastDonation.date || lastDonation.createdAt);
            }
          }

          // Count upcoming appointments
          const now = new Date();
          const upcomingAppointments = allDonationsData.filter(doc => {
            if (doc.type !== 'appointment' || !doc.appointmentDate) return false;
            const appointmentDate = new Date(doc.appointmentDate);
            return appointmentDate > now && doc.status !== 'completed' && doc.status !== 'cancelled';
          }).length;

          logger.info('📊 Real-time stats calculated:', {
            totalDonations,
            livesSaved,
            upcomingAppointments,
            lastDonationDate: lastDonationDate?.toISOString()
          });

          setStats({
            totalDonations,
            livesSaved,
            upcomingAppointments,
            lastDonationDate, // Add this to stats
            loading: false
          });

          // Store donations for gamification
          setDonations(allDonationsData);

          // Cache donations for offline access
          saveDonationsOffline(currentUser.uid, allDonationsData.map(d => ({
            ...d,
            createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt,
            date: d.date,
            appointmentDate: d.appointmentDate
          }))).then(() => {
            logger.info('💾 Donations cached for offline access');
          }).catch(err => {
            logger.error('Error caching donations:', err);
          });
        });

        return () => unsubscribe2();
      });

      return () => unsubscribe1();
    });
  }, []);

  // Calculate gamification data when donations change
  useEffect(() => {
    if (donations.length > 0 && user) {
      const points = calculateTotalPoints(donations);
      const completedCount = donations.filter(d => d.status === 'completed').length;
      const badge = getUserBadgeLevel(completedCount);
      const next = getNextBadge(completedCount);
      
      setTotalPoints(points);
      setCurrentBadge(badge);
      setNextBadge(next);
    }
  }, [donations, user]);

  // Fetch ML Engagement Score
  useEffect(() => {
    const fetchEngagementScore = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setLoadingEngagement(true);
      try {
        const response = await fetch('http://localhost:3000/api/ml/predict-churn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser.uid }),
        });

        if (response.ok) {
          const data = await response.json();
          setEngagementScore(data.prediction);
        } else {
          logger.warn('Failed to fetch engagement score');
        }
      } catch (error) {
        logger.error('Error fetching engagement score:', error);
      } finally {
        setLoadingEngagement(false);
      }
    };

    fetchEngagementScore();
  }, [user]);

  if (!user) return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB. Please compress your image or choose a smaller one.');
        setImageFile(null);
        setImagePreview(null);
        // Reset the file input
        e.target.value = '';
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
        setImageFile(null);
        setImagePreview(null);
        e.target.value = '';
        return;
      }

      logger.info('Selected file:', { name: file.name, size: `${(file.size / 1024).toFixed(2)} KB`, type: file.type });
      setError(''); // Clear any previous errors
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = () => {
    if (!imageFile) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        reject(new Error("No user authenticated"));
        return;
      }

      const fileName = `profile_${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, `profileImages/${currentUser.uid}/${fileName}`);

      logger.info("Uploading image to:", storageRef.fullPath);

      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          logger.info(`Upload progress: ${progress}%`);
        },
        (error) => {
          logger.error("Upload failed:", error.message, error.code);
          let errorMessage = `Upload failed: ${error.message}`;
          if (error.code === 'storage/canceled') {
            errorMessage = 'Upload was canceled, possibly due to a timeout or network issue.';
          } else if (error.code === 'storage/unauthorized') {
            errorMessage = 'Upload failed: You do not have permission to upload to this location. Check Firebase Storage rules.';
          } else if (error.message.includes('CORS')) {
            errorMessage = 'Upload failed due to a CORS issue. Ensure Firebase Storage CORS settings are configured correctly.';
          }
          setUploadError(errorMessage);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            logger.info("Image URL retrieved:", downloadURL);
            setUploadProgress(0);
            setUploadError('');
            resolve(downloadURL);
          } catch (err) {
            logger.error("Failed to get download URL:", err.message, err.code);
            setUploadError('Failed to retrieve image URL after upload.');
            reject(err);
          }
        }
      );

      // Timeout after 30 seconds (increased from 10)
      setTimeout(() => {
        if (uploadTask.snapshot.state === 'running') {
          uploadTask.cancel();
          const timeoutError = new Error('Image upload timed out after 30 seconds. Please try a smaller image or check your internet connection.');
          setUploadError(timeoutError.message);
          reject(timeoutError);
        }
      }, 30000); // 30 seconds
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      let photoURL = user.photoURL;
      try {
        if (imageFile) {
          photoURL = await uploadImage();
        }
      } catch (uploadErr) {
        throw new Error(`Failed to upload image: ${uploadErr.message}`);
      }

      const authUpdatePromise = updateProfile(currentUser, {
        displayName: editData.name,
        photoURL: photoURL || null,
      }).catch(err => {
        logger.error("Auth profile update failed:", err.message, err.code);
        throw new Error("Failed to update authentication profile");
      });

      const firestoreUpdatePromise = updateDoc(doc(db, 'users', currentUser.uid), {
        name: editData.name,
        phone: editData.phone,
        photoURL: photoURL || null,
        bloodType: editData.bloodType,
        dob: editData.dob,
        // REMOVED: lastDonated - now auto-calculated from real donations
        address: editData.address,
        city: editData.city,
        updatedAt: new Date().toISOString(),
        // Preserve privacy settings
        shareBloodType,
        shareLocation
      }).catch(err => {
        logger.error("Firestore update failed:", err.message, err.code);
        throw new Error("Failed to update user data in database");
      });

      await Promise.all([authUpdatePromise, firestoreUpdatePromise]);
      logger.info("Profile updates completed");

      const updatedUserData = {
        ...user,
        ...editData,
        photoURL: photoURL || user.photoURL,
        shareBloodType,
        shareLocation
      };
      setUser(updatedUserData);

      // userProfile will be automatically updated by AuthContext via Firestore subscription

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(`Failed to update profile: ${err.message}. Please try again.`);
      logger.error('Error updating profile:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setShowEditModal(false);
      setImagePreview(null);
      setImageFile(null);
      setUploadProgress(0);
      setUploadError('');
    }, 300);
  };

  // Calculate last donation text from REAL donation data (not user profile!)
  const getLastDonationText = () => {
    // Use REAL data from stats, not user profile
    if (!stats.lastDonationDate) return 'No donations yet';

    const lastDate = stats.lastDonationDate;
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays/30)} months ago`;
    return `${Math.floor(diffDays/365)} years ago`;
  };

  // Calculate eligibility from REAL donation data (not user profile!)
  const getEligibilityStatus = () => {
    // Use REAL data from stats, not user profile
    if (!stats.lastDonationDate) {
      return { status: 'Eligible Now', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    }

    const lastDate = stats.lastDonationDate;
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Blood donation eligibility: 56-90 days (8-12 weeks)
    if (diffDays >= 90) {
      return { status: 'Eligible Now', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    } else if (diffDays >= 56) {
      return { status: 'Eligible Soon', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    } else {
      const daysLeft = 90 - diffDays;
      return { status: `${daysLeft}d left`, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
  };

  const eligibilityInfo = user ? getEligibilityStatus() : { status: '-', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-red-50/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Donor Profile</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage your information and track your donation journey</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <User size={18} className="sm:w-5 sm:h-5" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'achievements'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Target size={18} className="sm:w-5 sm:h-5" />
            Achievements
            {totalPoints > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">
                {totalPoints}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'leaderboard'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Trophy size={20} />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <Zap size={20} />
            Challenges
            <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold animate-pulse">
              NEW
            </span>
          </button>
        </div>
        
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        {/* Tab Content */}
        {activeTab === 'achievements' && (
          <AchievementTracker 
            userProfile={user} 
            donations={donations}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard 
            currentUserId={auth.currentUser?.uid}
            userBloodType={user?.bloodType}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesSection 
            userProfile={user}
          />
        )}

        {activeTab === 'profile' && (
          <>
        {/* Enhanced Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          {/* Header with Gradient */}
          <div className="p-8 md:p-10 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-3xl border-4 border-white shadow-2xl object-cover group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => {
                      // Prevent infinite error loop - Google images often blocked by CORS
                      if (!e.target.dataset.errorHandled) {
                        e.target.dataset.errorHandled = 'true';
                        // Silently switch to fallback (Google CORS is expected)
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                {/* Fallback avatar - shown when image fails or no photoURL */}
                {!user.photoURL || user.photoURL ? (
                  <div 
                    className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 bg-white rounded-3xl flex items-center justify-center text-red-600 font-bold text-3xl sm:text-4xl md:text-5xl border-4 border-white shadow-2xl"
                    style={{ display: user.photoURL ? 'none' : 'flex' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : null}
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-1.5 sm:p-2 shadow-lg">
                  <CheckCircle2 size={16} className="sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">{user.name}</h3>
                  
                  {/* Featured Badge if active */}
                  {user.featuredBadge?.active && 
                   user.featuredBadge?.expiresAt?.toDate() > new Date() && (
                    <ProfileBadge 
                      type="featured" 
                      expiresAt={user.featuredBadge.expiresAt.toDate()}
                      size="large"
                    />
                  )}
                  
                  {/* Priority Access Badge if active */}
                  {user.priorityAccess?.active && 
                   user.priorityAccess?.expiresAt?.toDate() > new Date() && (
                    <ProfileBadge 
                      type="priority" 
                      expiresAt={user.priorityAccess.expiresAt.toDate()}
                      size="medium"
                    />
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-red-50">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <User size={18} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.phone && user.phone !== 'Not provided' && (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Phone size={18} />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                    <Award size={18} className="text-yellow-300" />
                    <span className="text-sm font-semibold">
                      {stats.totalDonations === 0 && 'New Hero'}
                      {stats.totalDonations >= 1 && stats.totalDonations < 5 && 'Bronze Donor'}
                      {stats.totalDonations >= 5 && stats.totalDonations < 10 && 'Silver Donor'}
                      {stats.totalDonations >= 10 && 'Gold Donor'}
                    </span>
                  </div>
                  <div className="bg-white/30 px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                    <Shield size={18} className="text-blue-300" />
                    <span className="text-sm font-semibold">Verified Donor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-8 md:p-10">
            {/* Statistics Section - Enhanced with Real Data */}
            <div className="mb-10">
              <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <TrendingUp size={24} className="text-red-600" />
                Your Impact
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-2xl border-2 border-red-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-red-600 p-2 sm:p-3 rounded-xl text-white shadow-md">
                      <Heart size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    {stats.loading && (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total Donations</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-600">{stats.totalDonations}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border-2 border-green-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-green-600 p-2 sm:p-3 rounded-xl text-white shadow-md">
                      <Award size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    {stats.loading && (
                      <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Lives Saved</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-600">{stats.livesSaved}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-600 p-2 sm:p-3 rounded-xl text-white shadow-md">
                      <Calendar size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    {stats.loading && (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Last Donation</p>
                  <p className="text-lg font-bold text-blue-600">{getLastDonationText().split(' ').slice(0, 2).join(' ')}</p>
                </div>
                
                <div className={`bg-gradient-to-br ${eligibilityInfo.bgColor} p-6 rounded-2xl border-2 ${eligibilityInfo.borderColor} shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${eligibilityInfo.color.replace('text-', 'bg-')} p-3 rounded-xl text-white shadow-md`}>
                      <Shield size={24} />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Eligibility</p>
                  <p className={`text-2xl font-extrabold ${eligibilityInfo.color}`}>{eligibilityInfo.status}</p>
                </div>
              </div>

              {/* ML Engagement Score Card */}
              {engagementScore && !loadingEngagement && (
                <div className={`mt-6 p-5 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  engagementScore.riskLevel === 'low' 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
                    : engagementScore.riskLevel === 'medium'
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200'
                    : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg text-white shadow-md ${
                      engagementScore.riskLevel === 'low' ? 'bg-green-600' 
                      : engagementScore.riskLevel === 'medium' ? 'bg-yellow-600'
                      : 'bg-red-600'
                    }`}>
                      <TrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Engagement Score</h3>
                  </div>

                  {/* Large Score Display */}
                  <div className="text-center">
                    <div className={`text-5xl font-extrabold mb-2 ${
                      engagementScore.riskLevel === 'low' ? 'text-green-600' 
                      : engagementScore.riskLevel === 'medium' ? 'text-yellow-600'
                      : 'text-red-600'
                    }`}>
                      {Math.round((1 - engagementScore.churnProbability) * 100)}%
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                      engagementScore.riskLevel === 'low' 
                        ? 'bg-green-600 text-white' 
                        : engagementScore.riskLevel === 'medium' 
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {engagementScore.riskLevel === 'low' ? '🟢 Active Donor' 
                       : engagementScore.riskLevel === 'medium' ? '🟡 Stay Connected'
                       : '🔴 We Miss You!'}
                    </div>
                  </div>
                </div>
              )}

              {loadingEngagement && (
                <div className="mt-6 p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 shadow-md">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600 font-medium">Loading your engagement score...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Personal Details - Enhanced */}
              <div>
                <h4 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                  <Droplet size={22} className="text-red-600" />
                  Blood Donation Details
                </h4>
                <div className="space-y-4">
                  {shareBloodType && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100 hover:shadow-md transition-shadow">
                      <div className="bg-red-600 p-3 rounded-xl text-white shadow-md">
                        <Droplet size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Blood Type</p>
                        <p className="text-xl font-bold text-gray-900">{user.bloodType || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Last Donation</p>
                      <p className="text-lg font-bold text-gray-900">{getLastDonationText()}</p>
                    </div>
                  </div>

                  {stats.upcomingAppointments > 0 && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 hover:shadow-md transition-shadow">
                      <div className="bg-green-600 p-3 rounded-xl text-white shadow-md">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Upcoming Appointments</p>
                        <p className="text-lg font-bold text-gray-900">{stats.upcomingAppointments} scheduled</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <h4 className="text-xl font-bold mt-8 mb-5 text-gray-900 flex items-center gap-2">
                  <User size={22} className="text-blue-600" />
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="bg-purple-600 p-3 rounded-xl text-white shadow-md">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                      <p className="text-lg font-bold text-gray-900">{user.dob || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {shareLocation && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-2xl border border-orange-100 hover:shadow-md transition-shadow">
                      <div className="bg-orange-600 p-3 rounded-xl text-white shadow-md">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Location</p>
                        <p className="text-lg font-bold text-gray-900">{user.city || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column - Achievements and Quick Actions */}
              <div>
                <h4 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                  <Award size={22} className="text-yellow-600" />
                  Achievements & Milestones
                </h4>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-md mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-500 p-3 rounded-xl shadow-lg">
                        <Award size={28} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Current Badge</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stats.totalDonations === 0 && 'New Hero'}
                          {stats.totalDonations >= 1 && stats.totalDonations < 5 && 'Bronze Donor'}
                          {stats.totalDonations >= 5 && stats.totalDonations < 10 && 'Silver Donor'}
                          {stats.totalDonations >= 10 && 'Gold Donor'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Progress to next badge</p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ 
                            width: `${(
                              (stats.totalDonations || 0) === 0 ? 0 :
                              (stats.totalDonations || 0) < 5 ? ((stats.totalDonations || 0) / 5) * 100 :
                              (stats.totalDonations || 0) < 10 ? (((stats.totalDonations || 0) - 5) / 5) * 100 :
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {(stats.totalDonations || 0) < 5 && `${5 - (stats.totalDonations || 0)} more donations to Bronze`}
                        {(stats.totalDonations || 0) >= 5 && (stats.totalDonations || 0) < 10 && `${10 - (stats.totalDonations || 0)} more donations to Silver`}
                        {(stats.totalDonations || 0) >= 10 && 'Maximum level achieved! 🎉'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                  <Heart size={22} className="text-red-600" />
                  Quick Actions
                </h4>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (setActiveSection) {
                        setActiveSection('emergency');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-2xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Heart size={20} />
                      View Emergencies
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (setActiveSection) {
                        setActiveSection('donate');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-2xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar size={20} />
                      Schedule Donation
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (setActiveSection) {
                        setActiveSection('track');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-2xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Track Donations
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>


                <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <p className="text-sm text-gray-600 mb-3">💡 <span className="font-semibold">Did you know?</span></p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    One blood donation can save up to <span className="font-bold text-purple-700">3 lives</span>. Your contribution makes a real difference in emergency situations!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Enhanced */}
            <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-2xl transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                onClick={handleEditProfile}
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </button>
              <button
                className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-10 py-4 rounded-2xl transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    auth.signOut();
                  }
                }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
              className={`bg-white rounded-xl shadow-xl max-w-lg w-full transform transition-all duration-300 ${
                animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Edit Profile</h3>
                  <button 
                    onClick={handleClose} 
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    {error}
                  </div>
                )}
                
                {uploadError && (
                  <div className="mb-4 p-3 bg-yellow-50 text-yellow-600 rounded-lg text-sm border border-yellow-100">
                    {uploadError}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile Preview" 
                            className="h-16 w-16 rounded-full object-cover border border-gray-300" 
                          />
                        ) : user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Current Profile" 
                            className="h-16 w-16 rounded-full object-cover border border-gray-300" 
                            onError={(e) => {
                              if (!e.target.dataset.errorHandled) {
                                e.target.dataset.errorHandled = 'true';
                                // Silently switch to fallback (Google CORS is expected)
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback && fallback.classList.contains('fallback-avatar')) {
                                  fallback.style.display = 'flex';
                                }
                              }
                            }}
                          />
                        ) : null}
                        {/* Fallback avatar */}
                        {!imagePreview ? (
                          <div 
                            className="fallback-avatar h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl border border-gray-300"
                            style={{ display: user.photoURL ? 'none' : 'flex' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        ) : null}
                        
                        <label htmlFor="profile-photo-upload" className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50">
                          <Camera size={16} className="text-gray-600" />
                          <input 
                            id="profile-photo-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          Upload a new photo (max 2MB)
                          {isGoogleUser && user.photoURL && !imagePreview && (
                            <span> - Currently using Google profile picture</span>
                          )}
                        </p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading: {Math.round(uploadProgress)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>     
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      <select
                        name="bloodType"
                        value={editData.bloodType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={editData.dob || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* REMOVED: Last Donated field - now auto-calculated from real donations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editData.city || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={editData.address || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )} {/* End of profile tab */}
      </div>
    </section>
  );
}
