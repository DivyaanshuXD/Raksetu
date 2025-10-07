import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * AI-Powered Eligibility Chatbot
 * Rule-based conversational interface for blood donation eligibility screening
 */

const EligibilityChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState([]);
  const messagesEndRef = useRef(null);

  // Eligibility screening questions
  const questions = [
    {
      id: 'age',
      question: "Let's start! What's your age?",
      type: 'range',
      quickReplies: ['18-25', '26-35', '36-45', '46-55', '56-65', 'Under 18', 'Over 65'],
      validation: (value) => {
        // Handle range selections
        if (value === 'Under 18') return { valid: false, message: 'Sorry, you must be at least 18 years old to donate blood.', disqualified: true };
        if (value === 'Over 65') return { valid: false, message: 'Sorry, donors must be 65 years or younger.', disqualified: true };
        if (['18-25', '26-35', '36-45', '46-55', '56-65'].includes(value)) return { valid: true };
        
        // Handle manual number input
        const age = parseInt(value);
        if (isNaN(age)) return { valid: false, message: 'Please select an age range or enter a number.' };
        if (age < 18) return { valid: false, message: 'Sorry, you must be at least 18 years old to donate blood.', disqualified: true };
        if (age > 65) return { valid: false, message: 'Sorry, donors must be 65 years or younger.', disqualified: true };
        return { valid: true };
      }
    },
    {
      id: 'weight',
      question: "What's your weight?",
      type: 'range',
      quickReplies: ['50-60 kg', '61-70 kg', '71-80 kg', '81-90 kg', '90+ kg', 'Under 50 kg'],
      validation: (value) => {
        // Handle range selections
        if (value === 'Under 50 kg') return { valid: false, message: 'Sorry, you must weigh at least 50 kg to donate blood safely.', disqualified: true };
        if (['50-60 kg', '61-70 kg', '71-80 kg', '81-90 kg', '90+ kg'].includes(value)) return { valid: true };
        
        // Handle manual number input
        const weight = parseFloat(value);
        if (isNaN(weight)) return { valid: false, message: 'Please select a weight range or enter a number.' };
        if (weight < 50) return { valid: false, message: 'Sorry, you must weigh at least 50 kg to donate blood safely.', disqualified: true };
        return { valid: true };
      }
    },
    {
      id: 'recentDonation',
      question: "Have you donated blood in the last 3 months?",
      type: 'yesno',
      quickReplies: ['✅ No, I haven\'t', '⏰ Yes, recently'],
      validation: (value) => {
        const answer = value.toLowerCase().trim();
        // Check for NO first (including button text "✅ No, I haven't")
        if (/\bno\b|haven't|havent|never/i.test(answer)) {
          return { valid: true };
        }
        // Then check for YES (including button text "⏰ Yes, recently")
        if (/\byes\b|recently|i have donated|i did donate/i.test(answer)) {
          return { valid: false, message: 'You need to wait 3 months between donations to ensure your health and safety.', disqualified: true };
        }
        return { valid: false, message: 'Please click a button or answer yes/no.' };
      }
    },
    {
      id: 'healthConditions',
      question: "Do you have any health issues? (fever, infection, chronic diseases, or taking medications)",
      type: 'yesno',
      quickReplies: ['✅ No, I\'m healthy', '⚠️ Yes, I have issues'],
      validation: (value) => {
        const answer = value.toLowerCase().trim();
        // Check for NO/HEALTHY first (including button text "✅ No, I'm healthy")
        if (/\bno\b|healthy|fine|good|don't have|dont have/i.test(answer)) {
          return { valid: true };
        }
        // Then check for YES/ISSUES (including button text "⚠️ Yes, I have issues")
        if (/\byes\b|issues|sick|ill|fever|infection|disease|medication/i.test(answer)) {
          return { valid: false, message: 'Please wait until you\'re fully recovered and medication-free. Consult your doctor first.', disqualified: true };
        }
        return { valid: false, message: 'Please click a button or answer yes/no.' };
      }
    },
    {
      id: 'lifestyle',
      question: "Any recent tattoos, piercings, alcohol (24h), surgery (6mo), or pregnancy?",
      type: 'yesno',
      quickReplies: ['✅ None of these', '⚠️ Yes, one or more'],
      validation: (value) => {
        const answer = value.toLowerCase().trim();
        // Check for NONE first (including button text "✅ None of these")
        if (/\bnone\b|\bno\b/i.test(answer)) {
          return { valid: true };
        }
        // Then check for YES/ONE OR MORE (including button text "⚠️ Yes, one or more")
        if (/\byes\b|one or more|tattoo|piercing|alcohol|surgery|pregnant/i.test(answer)) {
          return { valid: false, message: 'Please wait: 24h after alcohol, 6 months after tattoos/surgery, or until after pregnancy/breastfeeding.', disqualified: true };
        }
        return { valid: false, message: 'Please click a button or answer yes/no.' };
      }
    },
    {
      id: 'travel',
      question: "Have you traveled to malaria-risk areas in the last year?",
      type: 'yesno',
      quickReplies: ['✅ No travel', '✈️ Yes, I traveled'],
      validation: (value) => {
        const answer = value.toLowerCase().trim();
        // Check for NO TRAVEL first (including button text "✅ No travel")
        if (/no travel|\bno\b|haven't|havent|never traveled|didn't travel/i.test(answer)) {
          return { valid: true };
        }
        // Then check for YES/TRAVELED (including button text "✈️ Yes, I traveled")
        if (/\byes\b.*traveled|i traveled|travelled|trip to|visited/i.test(answer)) {
          return { valid: false, message: 'Please wait 12 months after returning from malaria-endemic areas to ensure you haven\'t contracted the disease.', disqualified: true };
        }
        return { valid: false, message: 'Please click a button or answer yes/no.' };
      }
    }
  ];

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "👋 Hi! I'm your AI eligibility assistant. I'll help you check if you're eligible to donate blood. This will only take 2 minutes!\n\nReady to start? (Type 'yes' to begin)"
        );
      }, 300);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (text, type = 'text', delay = 0) => {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text, type, timestamp: new Date() }]);
        setIsTyping(false);
      }, 800); // Simulate typing delay
    }, delay);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text, timestamp: new Date() }]);
  };

  // Handle quick reply button clicks
  const handleQuickReply = (reply) => {
    setInputValue(reply);
    setShowQuickReplies(false);
    addUserMessage(reply);
    // Process the reply
    setTimeout(() => {
      processMessage(reply);
    }, 100);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowQuickReplies(false); // Hide quick replies when typing manually
    addUserMessage(userMessage);
    
    // Process the message
    setTimeout(() => {
      processMessage(userMessage);
    }, 100);
  };

  const processMessage = (userMessage) => {
    // Better yes/no detection
    const isYes = /^(yes|yeah|yep|sure|ok|okay|y|start|begin|let's go|lets go)$/i.test(userMessage);
    const isNo = /^(no|nope|nah|n|not now|maybe later|cancel)$/i.test(userMessage);

    // Check if user is starting the questionnaire
    if (messages.length === 1 && isYes) {
      setCurrentQuestion(0);
      addBotMessage(questions[0].question, 'text', 500);
      // Show quick replies for first question
      const firstQuestion = questions[0];
      if (firstQuestion.quickReplies) {
        setTimeout(() => {
          setCurrentQuickReplies(firstQuestion.quickReplies);
          setShowQuickReplies(true);
        }, 1300); // Show after bot message appears
      }
      return;
    }

    // If user says no to starting
    if (messages.length === 1 && isNo) {
      addBotMessage("No problem! Feel free to start whenever you're ready. Just type 'yes' when you want to begin!", 'text', 500);
      return;
    }

    // Process answers to screening questions
    if (currentQuestion < questions.length) {
      const question = questions[currentQuestion];
      const validation = question.validation(userMessage);

      if (!validation.valid) {
        if (validation.disqualified) {
          // User is disqualified
          setUserAnswers(prev => ({ ...prev, [question.id]: userMessage }));
          setEligibilityResult('ineligible');
          addBotMessage(validation.message, 'error', 500);
          addBotMessage(
            "🩺 Don't worry! This is temporary. Here are some ways you can still help:\n\n✅ Share our platform with friends\n✅ Organize awareness campaigns\n✅ Volunteer at donation drives\n✅ Come back when eligible!\n\nWould you like to learn more about blood donation? (yes/no)",
            'text',
            2000
          );
        } else {
          // Invalid input format - show quick replies again
          addBotMessage(validation.message, 'warning', 500);
          if (question.quickReplies) {
            setTimeout(() => {
              setCurrentQuickReplies(question.quickReplies);
              setShowQuickReplies(true);
            }, 1000);
          }
        }
      } else {
        // Valid answer, move to next question
        setUserAnswers(prev => ({ ...prev, [question.id]: userMessage }));
        
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(currentQuestion + 1);
          addBotMessage(questions[currentQuestion + 1].question, 'text', 800);
          // Show quick replies for next question
          const nextQuestion = questions[currentQuestion + 1];
          if (nextQuestion.quickReplies) {
            setTimeout(() => {
              setCurrentQuickReplies(nextQuestion.quickReplies);
              setShowQuickReplies(true);
            }, 1600); // Show after bot message appears
          }
        } else {
          // All questions answered - increment to show 6/6 before showing success
          setCurrentQuestion(currentQuestion + 1);
          setEligibilityResult('eligible');
          addBotMessage(
            "🎉 Congratulations! You're eligible to donate blood!\n\nYour donation can save up to 3 lives. You're about to become a hero! 🦸",
            'success',
            1000
          );
          addBotMessage(
            "📋 **Pre-Donation Preparation Tips:**\n\n💧 **Hydrate:** Drink 500ml water 2 hours before\n🍎 **Eat Well:** Have iron-rich foods (spinach, red meat, beans)\n😴 **Rest:** Get 7-8 hours sleep the night before\n☕ **Avoid:** Fatty foods, alcohol (24h), smoking (2h)\n💊 **Take:** Your regular medications (unless advised otherwise)\n\n⏰ **Best Time:** Morning donations are easier on your body!",
            'text',
            3000
          );
          addBotMessage(
            "🏥 **What to Bring:**\n\n✅ Valid photo ID (Aadhaar, Passport, License)\n✅ Comfortable clothing\n✅ List of any medications\n✅ Positive attitude! 😊\n\n📍 **After Donation Care:**\n• Rest for 10-15 minutes\n• Drink plenty of fluids\n• Avoid heavy lifting for 24 hours\n• Keep the bandage on for 4 hours\n• Eat a healthy meal\n\n🔄 You can donate again after 3 months!",
            'text',
            5500
          );
          addBotMessage(
            "💪 **Did You Know?**\n\n• One donation saves 3 lives\n• Your body replaces blood in 24-48 hours\n• Reduces risk of heart disease\n• Burns ~650 calories per donation\n• Free health checkup included!\n\n**Ready to make a difference?** Click 'Donate' in the navigation to find blood banks near you! 🚀",
            'success',
            8000
          );
        }
      }
    } else if (eligibilityResult) {
      // Handle follow-up questions after screening
      const isYes = /^(yes|yeah|yep|sure|ok|okay|y|tell me|show me)$/i.test(userMessage);
      const isNo = /^(no|nope|nah|n|not now|maybe later|i'm good|im good)$/i.test(userMessage);
      
      if (isYes) {
        addBotMessage(
          "📚 Great! Here are some interesting facts:\n\n• One donation can save 3 lives\n• Your body replaces donated blood in 24-48 hours\n• Only 3% of eligible people donate regularly\n• Every 2 seconds someone needs blood\n\nYou can be a hero today! Click the 'Donate' button in the navigation to get started.",
          'text',
          800
        );
      } else if (isNo) {
        addBotMessage(
          "Perfect! If you have any questions later, just click the chat icon. Thank you for your interest in saving lives! 💝",
          'text',
          800
        );
      } else {
        addBotMessage(
          "I didn't quite understand. Would you like to learn more about blood donation? Please answer 'yes' or 'no'.",
          'text',
          500
        );
      }
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentQuestion(0);
    setUserAnswers({});
    setEligibilityResult(null);
    setShowQuickReplies(false);
    setCurrentQuickReplies([]);
    setTimeout(() => {
      addBotMessage(
        "👋 Hi! I'm your AI eligibility assistant. I'll help you check if you're eligible to donate blood. This will only take 2 minutes!\n\nReady to start? (Type 'yes' to begin)"
      );
    }, 300);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-900 to-gray-900 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-900/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Open eligibility chatbot"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Eligibility Assistant</h3>
                <div className="text-xs text-white/80 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          {currentQuestion > 0 && currentQuestion <= questions.length && (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Question {currentQuestion} of {questions.length}</span>
                <span>{Math.round((currentQuestion / questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-900 to-gray-900 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' 
                    ? 'bg-gradient-to-br from-blue-900 to-gray-900 text-white' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                }`}>
                  {message.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-2 rounded-2xl ${
                    message.sender === 'bot'
                      ? message.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : message.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-blue-900 to-gray-900 text-white shadow-md'
                  }`}>
                    {/* Icon for special message types */}
                    {message.type === 'success' && (
                      <CheckCircle className="w-5 h-5 inline mr-2 mb-1" />
                    )}
                    {message.type === 'error' && (
                      <XCircle className="w-5 h-5 inline mr-2 mb-1" />
                    )}
                    {message.type === 'warning' && (
                      <AlertCircle className="w-5 h-5 inline mr-2 mb-1" />
                    )}
                    
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Reply Buttons */}
            {showQuickReplies && currentQuickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-10 mt-2">
                {currentQuickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-gray-200 hover:from-blue-200 hover:to-gray-300 text-gray-800 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-900/20"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-gray-900 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            {eligibilityResult && (
              <button
                onClick={handleReset}
                className="w-full mb-3 px-4 py-2 bg-gradient-to-r from-blue-900 to-gray-900 text-white rounded-lg hover:from-blue-800 hover:to-gray-800 transition-all font-medium text-sm"
              >
                Start New Screening
              </button>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-900 to-gray-900 text-white rounded-lg p-2 hover:from-blue-800 hover:to-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EligibilityChatbot;
