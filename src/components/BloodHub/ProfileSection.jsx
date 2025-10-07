import { useState, useEffect } from 'react';
import { auth, db, storage } from '../utils/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, User, Calendar, MapPin, Phone, Droplet, Clock, X } from 'lucide-react';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileSection({ userProfile, setUserProfile }) {
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('No authenticated user found');
          return;
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

        console.log('Fetched user data:', userData);
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

        // Update userProfile prop with the fetched data, including privacy settings
        setUserProfile(prev => ({
          ...prev,
          ...userData
        }));
      } catch (err) {
        console.error('Error fetching profile:', err.message, err.code);
      }
    };

    fetchUserProfile();
  }, [setUserProfile]);

  useEffect(() => {
    if (showEditModal) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [showEditModal]);

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
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB.');
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      console.log('Selected file:', { name: file.name, size: file.size, type: file.type });
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

      console.log("Uploading image to:", storageRef.fullPath);

      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          console.error("Upload failed:", error.message, error.code);
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
            console.log("Image URL retrieved:", downloadURL);
            setUploadProgress(0);
            setUploadError('');
            resolve(downloadURL);
          } catch (err) {
            console.error("Failed to get download URL:", err.message, err.code);
            setUploadError('Failed to retrieve image URL after upload.');
            reject(err);
          }
        }
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        if (uploadTask.snapshot.state === 'running') {
          uploadTask.cancel();
          const timeoutError = new Error('Image upload timed out after 10 seconds');
          setUploadError(timeoutError.message);
          reject(timeoutError);
        }
      }, 10000);
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
        console.error("Auth profile update failed:", err.message, err.code);
        throw new Error("Failed to update authentication profile");
      });

      const firestoreUpdatePromise = updateDoc(doc(db, 'users', currentUser.uid), {
        name: editData.name,
        phone: editData.phone,
        photoURL: photoURL || null,
        bloodType: editData.bloodType,
        dob: editData.dob,
        lastDonated: editData.lastDonated,
        address: editData.address,
        city: editData.city,
        updatedAt: new Date().toISOString(),
        // Preserve privacy settings
        shareBloodType,
        shareLocation
      }).catch(err => {
        console.error("Firestore update failed:", err.message, err.code);
        throw new Error("Failed to update user data in database");
      });

      await Promise.all([authUpdatePromise, firestoreUpdatePromise]);
      console.log("Profile updates completed");

      const updatedUserData = {
        ...user,
        ...editData,
        photoURL: photoURL || user.photoURL,
        shareBloodType,
        shareLocation
      };
      setUser(updatedUserData);

      setUserProfile(prev => ({
        ...prev,
        ...editData,
        photoURL: photoURL || user.photoURL,
        shareBloodType,
        shareLocation
      }));

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(`Failed to update profile: ${err.message}. Please try again.`);
      console.error('Error updating profile:', err);
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

  const getLastDonationText = () => {
    if (!user.lastDonated) return 'No donations recorded';

    const lastDate = new Date(user.lastDonated);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays/30)} months ago`;
    return `${Math.floor(diffDays/365)} years ago`;
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">Donor Profile</h2>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="relative">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-24 w-24 rounded-full border-4 border-white object-cover" 
                    onError={(e) => {
                      console.error('Error loading profile image:', e);
                      e.target.src = 'https://via.placeholder.com/80x80';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-red-600 font-bold text-2xl border-4 border-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2 text-red-100">
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    <User size={16} />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && user.phone !== 'Not provided' && (
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Phone size={16} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-700">Blood Donation Details</h4>
                <div className="space-y-4">
                  {shareBloodType && (
                    <div className="flex items-center gap-3">
                      <div className="bg-red-50 p-2 rounded-full text-red-600">
                        <Droplet size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium">{user.bloodType || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-full text-red-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Donation</p>
                      <p className="font-medium">{getLastDonationText()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-50 p-2 rounded-full text-red-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{user.dob || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {shareLocation && (
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-full text-red-600">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{user.city || 'Not specified'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-700">Donation Statistics</h4>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-sm">Total Donations</p>
                      <p className="text-2xl font-bold text-red-600">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-sm">Lives Saved</p>
                      <p className="text-2xl font-bold text-red-600">0</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-sm">Last Donation</p>
                      <p className="text-2xl font-bold text-red-600">-</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-500 text-sm">Eligibility</p>
                      <p className="text-lg font-bold text-green-600">Eligible</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700">Upcoming Events</h4>
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <p className="text-gray-500">No upcoming blood drives in your area</p>
                    <button className="mt-4 text-red-600 font-medium hover:text-red-700 transition-colors">
                      Find blood drives
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

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
                              console.error('Error loading modal profile image:', e);
                              e.target.src = 'https://via.placeholder.com/60x60';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl border border-gray-300">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Donated On</label>
                      <input
                        type="date"
                        name="lastDonated"
                        value={editData.lastDonated || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editData.city || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
      </div>
    </section>
  );
}