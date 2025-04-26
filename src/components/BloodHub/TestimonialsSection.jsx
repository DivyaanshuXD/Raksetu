import { Heart, User, Award, Quote } from 'lucide-react';

const testimonials = [
  { 
    name: 'Arjun Mehta', 
    bloodType: 'O+', 
    message: 'Raksetu helped me find donors within minutes during my father\'s emergency surgery.', 
    avatar: '/api/placeholder/60/60',
    highlight: 'Emergency Response'
  },
  { 
    name: 'Priya Singh', 
    bloodType: 'AB-', 
    message: 'The tracking feature let me know exactly when my donation was used. It\'s incredibly fulfilling.', 
    avatar: '/api/placeholder/60/60',
    highlight: 'Donation Tracking'
  },
  { 
    name: 'Dr. Sharma', 
    role: 'Cardiac Surgeon', 
    message: 'The real-time availability map has revolutionized how we handle blood requirements during surgeries.', 
    avatar: '/api/placeholder/60/60',
    highlight: 'Medical Professional'
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-red-950 to-red-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-red-600 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-red-600 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Heart className="text-red-400" size={32} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Blood Donation Stories</h2>
          <div className="w-24 h-1 bg-red-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-red-100 max-w-3xl mx-auto text-lg">
            Hear from donors, recipients, and healthcare professionals about their experiences with Raksetu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-red-900/80 to-red-950/80 p-6 rounded-xl relative shadow-lg backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-3 right-4 opacity-20">
                <Quote size={32} />
              </div>
              
              <div className="flex items-center mb-4">
                <div className="mr-4 rounded-full overflow-hidden bg-red-800 h-12 w-12 flex items-center justify-center">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} className="h-full w-full object-cover" />
                  ) : (
                    <User size={24} className="text-red-100" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-lg">{testimonial.name}</div>
                  <div className="text-red-300 text-sm flex items-center">
                    {testimonial.bloodType && (
                      <span className="bg-red-800/50 px-2 py-0.5 rounded-full text-xs mr-2">
                        {testimonial.bloodType}
                      </span>
                    )}
                    {testimonial.role || ''}
                  </div>
                </div>
              </div>
              
              {testimonial.highlight && (
                <div className="mb-3">
                  <span className="bg-red-700/30 text-red-200 text-xs px-2 py-1 rounded-full flex items-center w-fit">
                    <Award size={12} className="mr-1" />
                    {testimonial.highlight}
                  </span>
                </div>
              )}
              
              <div className="text-lg italic mb-4">"{testimonial.message}"</div>
              
              <div className="flex justify-end">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      size={14} 
                      className="text-red-400" 
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-white text-red-700 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center">
              <Heart size={18} className="mr-2 group-hover:animate-pulse" />
              Share Your Story
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white to-red-100 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
          </button>
        </div>
      </div>
    </section>
  );
}