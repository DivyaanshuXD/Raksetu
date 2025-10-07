import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '../../utils/logger';
import { Heart, Award, Quote, MessageCircle, Star, Users } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';

// Custom debounce implementation with cancel method
const debounce = (func, wait) => {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};

// Reference the public asset directly
const userIcon = '/assets/user-icon.png';

// Memoized Testimonial Card to prevent unnecessary re-renders
const TestimonialCard = React.memo(({ testimonial }) => {
  const [imageError, setImageError] = useState(false);
  const [showFallback, setShowFallback] = useState(!testimonial.avatar);

  // Get user initials for fallback
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div 
      className="group bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-red-200/50 hover:-translate-y-1 relative overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Card Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
        <Quote size={96} className="text-red-500" />
      </div>
      
      {/* User Info - More Compact */}
      <div className="flex items-center mb-4 relative z-10">
        <div className="relative mr-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center ring-2 ring-white shadow-md">
            {/* Show image if available and not errored */}
            {testimonial.avatar && !showFallback && (
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name} 
                className="h-full w-full object-cover" 
                style={{ display: imageError ? 'none' : 'block' }}
                onError={(e) => {
                  if (!e.target.dataset.errorHandled) {
                    e.target.dataset.errorHandled = 'true';
                    setImageError(true);
                    setShowFallback(true);
                  }
                }}
              />
            )}
            {/* Fallback: Show initials */}
            {showFallback && (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-sm">
                {getInitials(testimonial.name)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Heart size={8} className="text-white" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base text-slate-800 truncate">{testimonial.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            {testimonial.bloodType && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {testimonial.bloodType}
              </span>
            )}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                  fill={i < testimonial.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Highlight Badge - Smaller */}
      {testimonial.highlight && (
        <div className="mb-3">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center w-fit">
            <Award size={10} className="mr-1" />
            {testimonial.highlight}
          </span>
        </div>
      )}
      
      {/* Message - Compact */}
      <div className="text-slate-700 text-sm leading-relaxed mb-4 italic line-clamp-3">
        "{testimonial.message}"
      </div>
      
      {/* Bottom Section - Smaller */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {new Date(testimonial.createdAt).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={12} className="text-red-400" />
          <span className="text-xs text-slate-500">Verified</span>
        </div>
      </div>
    </div>
  );
});

export default function TestimonialsSection({ userProfile, isLoggedIn, setShowAuthModal, setAuthMode }) {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    highlight: '',
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSetTestimonials = useCallback(
    debounce((newTestimonials) => {
      setTestimonials(newTestimonials);
      logger.info('Fetched testimonials:', newTestimonials);
    }, 500),
    []
  );

  useEffect(() => {
    const testimonialsRef = collection(db, 'testimonials');
    const q = query(testimonialsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const testimonialsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      debouncedSetTestimonials(testimonialsList);
    }, (err) => {
      logger.error('Detailed error fetching testimonials:', err.message, err.code);
      setError(`Failed to load testimonials: ${err.message} (${err.code}). Please try again.`);
    });
    return () => {
      unsubscribe();
      debouncedSetTestimonials.cancel();
    };
  }, [debouncedSetTestimonials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (formData.rating === 0) {
      setError("Please provide a rating (1 to 5 stars).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const testimonialData = {
        name: userProfile?.name || 'Anonymous',
        bloodType: userProfile?.bloodType || 'Not specified',
        message: formData.message,
        highlight: formData.highlight || 'Donor Story',
        rating: formData.rating,
        avatar: userProfile?.photoURL || userIcon, // Use Flaticon icon as default
        createdAt: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'anonymous',
      };

      logger.info('Submitting testimonial:', testimonialData);
      const docRef = await addDoc(collection(db, 'testimonials'), testimonialData);
      logger.info('Testimonial added with ID:', docRef.id);
      setFormData({ message: '', highlight: '', rating: 0 });
      setShowForm(false);
      setLoading(false);
    } catch (err) {
      logger.error('Detailed error submitting testimonial:', err.message, err.code);
      setError(`Failed to submit your story: ${err.message} (${err.code}). Please try again.`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 relative overflow-hidden">
      {/* Simpler Background - No blur animations for performance */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 bg-red-200 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-rose-200 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Compact Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-md">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
            Stories That Inspire
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-red-400 to-rose-400 mx-auto mb-4 rounded-full"></div>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-4">
            Every drop counts, every story matters. Discover how Raksetu has touched lives.
          </p>
          
          {/* Compact Stats */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/90 rounded-xl px-6 py-3 shadow-md border border-white/20">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{testimonials.length}</div>
                  <div className="text-xs text-slate-600">Stories</div>
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">4.9</div>
                  <div className="text-xs sm:text-sm text-slate-600">Average Rating</div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">98%</div>
                  <div className="text-xs sm:text-sm text-slate-600">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-20">
          {testimonials.length > 0 ? testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          )) : (
            <div className="col-span-full text-center py-20">
              <div className="mb-6">
                <Users size={48} className="text-slate-300 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Stories Yet</h3>
              <p className="text-slate-500">Be the first to share your inspiring blood donation story!</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/90 rounded-3xl p-8 shadow-lg border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Share Your Story</h3>
            <p className="text-slate-600 mb-8">
              Your experience could inspire others to become life-saving donors. Share your journey with the Raksetu community.
            </p>
            <button 
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-12 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Heart size={20} className="mr-3 group-hover:animate-pulse" />
                {loading ? 'Submitting...' : 'Share Your Story'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <a href="https://www.flaticon.com/free-icons/user" title="user icons">
            User icons created by Freepik - Flaticon
          </a>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
              {/* Modal Background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Heart size={128} className="text-red-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mr-4">
                    <Heart className="text-white" size={20} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Share Your Story</h3>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">Your Story</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder-slate-400 transition-all duration-200"
                      rows="4"
                      placeholder="Share your experience with Raksetu and how it impacted your life..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">Your Rating</label>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`cursor-pointer transition-colors ${
                            i < formData.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill={i < formData.rating ? "currentColor" : "none"}
                          onClick={() => handleRatingChange(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">Story Category (Optional)</label>
                    <input
                      type="text"
                      name="highlight"
                      value={formData.highlight}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder-slate-400 transition-all duration-200"
                      placeholder="e.g., Emergency Response, First Time Donor, Life Saved"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-colors font-semibold"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                      disabled={loading}
                    >
                      {loading ? 'Sharing...' : 'Share Story'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
