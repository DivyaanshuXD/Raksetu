import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!message) return;

    const newHistory = [...chatHistory, { text: message, sender: 'user' }];
    setChatHistory(newHistory);
    setMessage('');

    try {
      const response = await fetch('https://raksetu-backend-ex4399x0i-divyaanshus-projects-4912ba04.vercel.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setChatHistory([...newHistory, { text: data.reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory([...newHistory, { text: 'Sorry, something went wrong.', sender: 'bot' }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 h-[500px] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-red-600 text-white rounded-t-lg">
            <h3 className="text-lg font-bold">Raksetu Assistant</h3>
            <button onClick={toggleChatbot} className="hover:bg-red-700 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {chatHistory.map((item, index) => (
              <div key={index} className={`mb-2 ${item.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${item.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 border rounded-l-lg"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-red-600 text-white p-2 rounded-r-lg hover:bg-red-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}