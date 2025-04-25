import { Users, Heart, Clock, MapPin } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">About Raksetu</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8 text-center">
          Raksetu is India's first AI-powered blood donation network, designed to bridge the gap between donors, recipients, and hospitals. Our mission is to save lives by ensuring timely blood availability across the country.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To leverage technology to create a seamless blood donation ecosystem, reducing emergency response times and increasing donor participation. We aim to save over 1 million lives by 2030.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-600">
              A world where no one dies due to lack of blood. We strive to make blood donation accessible, efficient, and impactful for every Indian.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">Why Choose Raksetu?</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-red-600" size={32} />
              </div>
              <h4 className="font-medium">Community Driven</h4>
              <p className="text-gray-600 text-sm">Powered by 58,000+ donors nationwide.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="text-red-600" size={32} />
              </div>
              <h4 className="font-medium">Life-Saving Impact</h4>
              <p className="text-gray-600 text-sm">Over 124,000 lives saved to date.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="text-red-600" size={32} />
              </div>
              <h4 className="font-medium">Real-Time Response</h4>
              <p className="text-gray-600 text-sm">Emergencies resolved in minutes.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="text-red-600" size={32} />
              </div>
              <h4 className="font-medium">Nationwide Reach</h4>
              <p className="text-gray-600 text-sm">Serving 1,230+ hospitals.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="#" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Join Our Team
          </a>
        </div>
      </div>
    </section>
  );
}