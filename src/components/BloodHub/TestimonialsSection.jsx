import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Award, Quote, MessageCircle, Star, Users } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import debounce from 'lodash/debounce';

// Reference the public asset directly
const userIcon = '/assets/user-icon.png';

// Memoized Testimonial Card to prevent unnecessary re-renders
const TestimonialCard = React.memo(({ testimonial }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <div 
      className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-red-200/50 hover:-translate-y-2 relative overflow-hidden"
    >
      {/* Card Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Quote size={128} className="text-red-500" />
      </div>
      
      {/* Quote Icon */}
      <div className="absolute top-6 left-6 opacity-20 group-hover:opacity-30 transition-opacity">
        <Quote size={24} className="text-red-400" />
      </div>
      
      {/* User Info */}
      <div className="flex items-center mb-6 relative z-10">
        <div className="relative mr-4">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center ring-4 ring-white shadow-lg">
            <img 
              src={avatarFailed ? userIcon : (testimonial.avatar || userIcon)} 
              alt={testimonial.name} 
              className="h-full w-full object-cover" 
              onError={(e) => {
                console.error('Error loading testimonial avatar:', testimonial.avatar);
                setAvatarFailed(true);
                e.target.src = userIcon;
                e.target.onerror = null;
              }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Heart size={10} className="text-white" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-slate-800">{testimonial.name}</div>
          <div className="flex items-center gap-2 mt-1">
            {testimonial.bloodType && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                {testimonial.bloodType}
              </span>
            )}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                  fill={i < testimonial.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Highlight Badge */}
      {testimonial.highlight && (
        <div className="mb-4">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center w-fit shadow-sm">
            <Award size={12} className="mr-1.5" />
            {testimonial.highlight}
          </span>
        </div>
      )}
      
      {/* Message */}
      <div className="text-slate-700 text-base leading-relaxed mb-6 italic">
        "{testimonial.message}"
      </div>
      
      {/* Bottom Section */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {new Date(testimonial.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} className="text-red-400" />
          <span className="text-xs text-slate-500">Verified Story</span>
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
      console.log('Fetched testimonials:', newTestimonials);
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
      console.error('Detailed error fetching testimonials:', err.message, err.code);
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

      console.log('Submitting testimonial:', testimonialData);
      const docRef = await addDoc(collection(db, 'testimonials'), testimonialData);
      console.log('Testimonial added with ID:', docRef.id);
      setFormData({ message: '', highlight: '', rating: 0 });
      setShowForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Detailed error submitting testimonial:', err.message, err.code);
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
    <section className="py-24 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-rose-200 to-red-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-100 to-red-100 rounded-full blur-2xl opacity-50"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={32} fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Star size={12} className="text-white" fill="currentColor" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-6">
            Stories That Inspire
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-red-400 to-rose-400 mx-auto mb-8 rounded-full shadow-sm"></div>
          <p className="text-slate-600 max-w-4xl mx-auto text-xl leading-relaxed">
            Every drop counts, every story matters. Discover how Raksetu has touched lives through 
            the generosity of donors and the gratitude of recipients.
          </p>
          
          {/* Stats Section */}
          <div className="flex justify-center mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/20">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testimonials.length}</div>
                  <div className="text-sm text-slate-600">Stories Shared</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">4.9</div>
                  <div className="text-sm text-slate-600">Average Rating</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">98%</div>
                  <div className="text-sm text-slate-600">Satisfaction</div>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 max-w-2xl mx-auto">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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