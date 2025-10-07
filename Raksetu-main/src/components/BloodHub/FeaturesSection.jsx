import { memo } from 'react';
import { Clock, MapPin, Bell, Phone, Heart, Users, ChevronRight, Shield, Zap } from 'lucide-react';

const FeaturesSection = memo(() => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <p className="text-red-600 font-medium mb-2 sm:mb-3 text-sm sm:text-base">WHY CHOOSE US</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 px-4">What Makes Raksetu Different</h2>
          <div className="w-20 sm:w-24 h-1 bg-red-600 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
            We're revolutionizing blood donation with unique features designed for India's specific challenges,
            connecting donors and recipients faster than ever before.
          </p>
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;