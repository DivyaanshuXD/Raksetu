/**
 * EmergencyChat Component
 * Real-time chat interface for emergency communication
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { X, Send, MessageCircle } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { forwardChatMessageViaSMS } from '../../../services/smsNotificationService';
import { forwardChatMessageViaWhatsApp } from '../../../services/whatsappService';

const EmergencyChat = memo(({ emergency, userProfile, onClose }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatId = `emergency_${emergency.id}_${userProfile?.id}`;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages
  useEffect(() => {
    if (!emergency?.id || !userProfile?.id) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChatMessages(messages);
        setIsLoading(false);
        scrollToBottom();
      },
      (error) => {
        console.error('Error loading chat messages:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [emergency?.id, userProfile?.id, chatId, scrollToBottom]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isSending || !userProfile) return;

    setIsSending(true);
    const messageText = chatInput.trim();
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        senderId: userProfile.id,
        senderName: userProfile.name || 'Anonymous',
        timestamp: serverTimestamp(),
        emergencyId: emergency.id
      });

      setChatInput('');
      scrollToBottom();

      // Forward message via SMS/WhatsApp (non-blocking)
      try {
        // Forward via SMS if contact phone available
        if (emergency.contactPhone) {
          await forwardChatMessageViaSMS(
            emergency.contactPhone,
            userProfile.name || 'A donor',
            messageText,
            emergency.id
          );
          console.log('✅ Chat message forwarded via SMS');
        }

        // Forward via WhatsApp if available
        if (emergency.whatsappNumber || emergency.contactPhone) {
          await forwardChatMessageViaWhatsApp(
            emergency.whatsappNumber || emergency.contactPhone,
            userProfile.name || 'A donor',
            messageText,
            emergency.id
          );
          console.log('✅ Chat message forwarded via WhatsApp');
        }
      } catch (forwardError) {
        // Log error but don't fail the chat message
        console.warn('⚠️ Failed to forward chat message:', forwardError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [chatInput, isSending, userProfile, chatId, emergency, scrollToBottom]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
      <div className="bg-white rounded-xl shadow-2xl h-[500px] flex flex-col border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-red-600 text-white">
          <div>
            <h3 className="text-lg font-bold">{emergency?.hospital}</h3>
            <p className="text-xs text-red-100 mt-0.5">Emergency Chat</p>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-red-700 p-1.5 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2" />
              Loading messages...
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatMessages.map((msg) => {
                const isOwnMessage = msg.senderId === userProfile?.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {!isOwnMessage && (
                        <p className="text-xs text-gray-500 mb-1 px-1">
                          {msg.senderName}
                        </p>
                      )}
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          isOwnMessage 
                            ? 'bg-red-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp?.toDate ? 
                          new Date(msg.timestamp.toDate()).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          'Sending...'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Type a message..."
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isSending}
              className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
});

EmergencyChat.displayName = 'EmergencyChat';

EmergencyChat.propTypes = {
  emergency: PropTypes.shape({
    id: PropTypes.string.isRequired,
    hospital: PropTypes.string
  }).isRequired,
  userProfile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

export default EmergencyChat;
