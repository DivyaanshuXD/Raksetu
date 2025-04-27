import { CheckCircle } from 'lucide-react';

export default function SuccessModal({ show, setShow, heading, message }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{heading}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => setShow(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}