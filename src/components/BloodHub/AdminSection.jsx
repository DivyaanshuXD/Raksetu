import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { ChevronDown, ChevronUp, Trash2, ArrowLeft, Users, MessageSquare, Shield, Activity, TrendingUp, Search, X } from 'lucide-react';

export default function AdminSection({ setActiveSection }) {
  const [users, setUsers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState({ users: true, testimonials: true });
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    testimonials: true,
  });
  const [userPage, setUserPage] = useState(1);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const entriesPerPage = 8;

  // Toggle section visibility
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setUserPage(1); // Reset to first page when searching
  }, [users, searchTerm]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Fetch data from Firestore collections in real-time
  useEffect(() => {
    // Fetch Users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      setLoading((prev) => ({ ...prev, users: false }));
      if (usersList.length === 0) {
        console.log('No users found in the "users" collection.');
      }
    }, (err) => {
      console.error('Error fetching users:', {
        message: err.message,
        code: err.code,
        details: err.details || 'No additional details',
      });
      setError(`Failed to load users: ${err.message} (Code: ${err.code})`);
      setLoading((prev) => ({ ...prev, users: false }));
    });

    // Fetch Testimonials and resolve user names
    const testimonialsQuery = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribeTestimonials = onSnapshot(testimonialsQuery, async (snapshot) => {
      const testimonialsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt).toLocaleString() : 'N/A',
      }));

      // Fetch user names for each testimonial
      const testimonialsWithUserNames = await Promise.all(
        testimonialsList.map(async (testimonial) => {
          if (testimonial.userId) {
            try {
              const userDocRef = doc(db, 'users', testimonial.userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                return { ...testimonial, userName: userDoc.data().name || 'Anonymous' };
              }
            } catch (err) {
              console.error(`Error fetching user ${testimonial.userId} for testimonial:`, err);
            }
          }
          return { ...testimonial, userName: 'Anonymous' };
        })
      );

      setTestimonials(testimonialsWithUserNames);
      setLoading((prev) => ({ ...prev, testimonials: false }));
    }, (err) => {
      console.error('Error fetching testimonials:', {
        message: err.message,
        code: err.code,
        details: err.details || 'No additional details',
      });
      setError(`Failed to load testimonials: ${err.message} (Code: ${err.code})`);
      setLoading((prev) => ({ ...prev, testimonials: false }));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeTestimonials();
    };
  }, []);

  // Handle deleting an entry from any collection
  const handleDelete = useCallback(async (collectionName, itemId) => {
    try {
      await deleteDoc(doc(db, collectionName, itemId));
      console.log(`Item ${itemId} deleted from ${collectionName} successfully.`);
      setDeleteConfirm({ show: false, type: '', id: '' });
    } catch (err) {
      console.error(`Error deleting item from ${collectionName}:`, err);
      setError(`Failed to delete item from ${collectionName}: ${err.message}`);
    }
  }, []);

  // Pagination for Users (using filtered users)
  const totalUserPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * entriesPerPage,
    userPage * entriesPerPage
  );

  // Pagination for Testimonials
  const totalTestimonialPages = Math.ceil(testimonials.length / entriesPerPage);
  const paginatedTestimonials = testimonials.slice(
    (testimonialPage - 1) * entriesPerPage,
    testimonialPage * entriesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('home')}
              className="group p-3 rounded-xl bg-white hover:bg-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 border border-gray-200"
            >
              <ArrowLeft size={20} className="text-gray-600 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your application data with ease</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <Activity size={16} className="text-green-600" />
              <span className="text-green-700 text-sm font-medium">System Online</span>
            </div>
            <Shield size={24} className="text-red-500" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp size={14} className="text-green-600 mr-1" />
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Testimonials</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{testimonials.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <MessageSquare size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp size={14} className="text-green-600 mr-1" />
              <span className="text-green-600 font-medium">Growing</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">System Status</p>
                <p className="text-lg font-bold text-green-600 mt-1">Operational</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Activity size={24} className="text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-600 font-medium">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <Users size={20} className="text-blue-600" />
                </div>
                Users Management
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {filteredUsers.length}
                </span>
                {searchTerm && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Filtered
                  </span>
                )}
              </h3>
              <button 
                onClick={() => toggleSection('users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {expandedSections.users ? 
                  <ChevronUp size={20} className="text-gray-600" /> : 
                  <ChevronDown size={20} className="text-gray-600" />
                }
              </button>
            </div>
            
            {expandedSections.users && (
              <div className="p-6">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X size={18} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="mt-2 text-sm text-gray-600">
                      Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
                    </p>
                  )}
                </div>

                {loading.users ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-400 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    {searchTerm ? (
                      <>
                        <Search size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No users found matching "{searchTerm}"</p>
                        <button
                          onClick={clearSearch}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <Users size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No users found in the system</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {paginatedUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {user.name || 'Anonymous User'}
                              </p>
                              <p className="text-gray-600 text-sm">{user.email || 'No email provided'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm({ show: true, type: 'users', id: user.id })}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination for Users */}
                    {totalUserPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                          {Array.from({ length: totalUserPages }, (_, index) => (
                            <button
                              key={index + 1}
                              onClick={() => setUserPage(index + 1)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                userPage === index + 1
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <MessageSquare size={20} className="text-purple-600" />
                </div>
                Testimonials Management
                <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                  {testimonials.length}
                </span>
              </h3>
              <button 
                onClick={() => toggleSection('testimonials')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {expandedSections.testimonials ? 
                  <ChevronUp size={20} className="text-gray-600" /> : 
                  <ChevronDown size={20} className="text-gray-600" />
                }
              </button>
            </div>
            
            {expandedSections.testimonials && (
              <div className="p-6">
                {loading.testimonials ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
                    </div>
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No testimonials found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {paginatedTestimonials.map((testimonial, index) => (
                        <div
                          key={testimonial.id}
                          className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-xs">
                                    {(testimonial.userName || 'A').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{testimonial.userName}</p>
                                  <p className="text-gray-500 text-xs">{testimonial.createdAt}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                                "{testimonial.message || 'No message provided'}"
                              </p>
                            </div>
                            <button
                              onClick={() => setDeleteConfirm({ show: true, type: 'testimonials', id: testimonial.id })}
                              className="ml-4 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination for Testimonials */}
                    {totalTestimonialPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                          {Array.from({ length: totalTestimonialPages }, (_, index) => (
                            <button
                              key={index + 1}
                              onClick={() => setTestimonialPage(index + 1)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                testimonialPage === index + 1
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirm.type.slice(0, -1)}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, type: '', id: '' })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}