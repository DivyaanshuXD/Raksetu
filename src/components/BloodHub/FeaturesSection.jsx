import { Clock, MapPin, Bell, Phone, Heart, Users, ChevronRight, Shield, Zap } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-red-600 font-medium mb-3">WHY CHOOSE US</p>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">What Makes Raksetu Different</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're revolutionizing blood donation with unique features designed for India's specific challenges,
            connecting donors and recipients faster than ever before.
          </p>
        </div>
      </div>
    </section>
  );
}