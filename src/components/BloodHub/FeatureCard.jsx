export default function FeatureCard({ icon, title, description }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    );
  }