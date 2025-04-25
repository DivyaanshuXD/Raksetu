const testimonials = [
    { name: 'Arjun Mehta', bloodType: 'O+', message: 'Raksetu helped me find donors within minutes during my father\'s emergency surgery.' },
    { name: 'Priya Singh', bloodType: 'AB-', message: 'The tracking feature let me know exactly when my donation was used. It\'s incredibly fulfilling.' },
    { name: 'Dr. Sharma', role: 'Cardiac Surgeon', message: 'The real-time availability map has revolutionized how we handle blood requirements during surgeries.' },
  ];
  
  export default function TestimonialsSection() {
    return (
      <section className="py-16 bg-red-950 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Blood Donation Stories</h2>
            <p className="text-red-100 max-w-3xl mx-auto">
              Hear from donors, recipients, and healthcare professionals about their experiences with Raksetu
            </p>
          </div>
  
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-maroon p-6 rounded-xl relative">
                <div className="mb-4 text-lg italic">"{testimonial.message}"</div>
                <div className="font-medium">{testimonial.name}</div>
                <div className="text-red-200 text-sm">{testimonial.bloodType || testimonial.role}</div>
                <div className="absolute top-3 right-4 opacity-20">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 11H6C6 7 8 5 10 5V3C6 3 4 7 4 11V17H10V11ZM20 11H16C16 7 18 5 20 5V3C16 3 14 7 14 11V17H20V11Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
  
          <div className="mt-12 text-center">
            <button className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Share Your Story
            </button>
          </div>
        </div>
      </section>
    );
  }