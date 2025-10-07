import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, HelpCircle, Loader, Settings } from 'lucide-react';

/**
 * VoiceAssistant Component
 * 
 * A specialized voice assistant for blood donation platform
 * Like Siri/Alexa but LIMITED to blood donation domain
 * 
 * Supported Intents:
 * - Emergency blood requests
 * - Find blood banks/hospitals
 * - Check donation eligibility
 * - View donation history
 * - Schedule appointments
 * - Get blood donation info
 * 
 * Rejects: Math, general knowledge, unrelated queries
 */

// Intent classification keywords
const INTENT_PATTERNS = {
  // Follow-up responses
  affirmative: {
    keywords: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'alright', 'definitely', 'absolutely', 'of course', 'please', 'go ahead', 'do it', 'confirm', 'correct', 'right', 'yup', 'affirmative']
  },
  negative: {
    keywords: ['no', 'nope', 'not', 'don\'t', 'dont', 'cancel', 'nevermind', 'never mind', 'skip', 'maybe later', 'not now', 'nah', 'negative', 'decline']
  },
  // Conversation starters
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'what\'s up', 'whats up', 'sup', 'yo', 'hiya', 'namaste']
  },
  goodbye: {
    keywords: ['bye', 'goodbye', 'see you', 'see ya', 'later', 'thanks', 'thank you', 'bye bye', 'farewell', 'catch you later', 'peace', 'take care', 'ciao']
  },
  howAreYou: {
    keywords: ['how are you', 'how do you do', 'how\'s it going', 'hows it going', 'how are things', 'you doing', 'you okay', 'how\'s life', 'you good', 'all good']
  },
  yourName: {
    keywords: ['your name', 'what\'s your name', 'whats your name', 'who are you', 'what are you called', 'tell me your name', 'introduce yourself']
  },
  emergency: {
    keywords: ['emergency', 'urgent', 'urgently', 'need blood', 'require blood', 'patient needs', 'critical', 'help', 'emergency request', 'asap', 'immediately', 'quick', 'right now', 'fast', 'stat', 'life threatening', 'blood needed'],
    bloodTypes: ['o+', 'o-', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o positive', 'o negative', 'a positive', 'a negative', 'b positive', 'b negative', 'ab positive', 'ab negative', 'o plus', 'o minus', 'a plus', 'a minus', 'b plus', 'b minus', 'ab plus', 'ab minus']
  },
  findBloodBank: {
    keywords: ['find blood bank', 'nearest blood bank', 'blood bank near', 'where can i find', 'blood banks in', 'hospital', 'nearest hospital', 'find hospital', 'blood center', 'donation center', 'locate blood bank', 'search blood bank', 'show blood banks', 'list blood banks', 'blood donation center', 'nearby', 'close to me', 'around me'],
    locations: [] // Will be extracted dynamically
  },
  eligibility: {
    keywords: ['eligible', 'can i donate', 'can i give', 'am i eligible', 'eligibility', 'when can i donate', 'next donation', 'donation eligibility', 'qualify', 'allowed to donate', 'able to donate', 'permitted to donate', 'fit to donate', 'eligible to give blood']
  },
  donationHistory: {
    keywords: ['donation history', 'my donations', 'past donations', 'donation record', 'how many times', 'when did i donate', 'last donation', 'previous donations', 'donated before', 'donation count', 'times donated', 'how often have i donated']
  },
  appointment: {
    keywords: ['schedule', 'appointment', 'book', 'reserve', 'book appointment', 'schedule donation', 'make appointment', 'arrange', 'set up', 'plan donation', 'fix appointment', 'organize', 'when can i come']
  },
  bloodInfo: {
    keywords: ['blood type', 'blood group', 'what is my blood type', 'my blood group', 'compatible blood', 'blood donation info', 'benefits of donation', 'why donate', 'how to donate', 'donation process', 'donation procedure', 'what happens when', 'blood facts', 'info about donation', 'tell me about blood']
  },
  help: {
    keywords: ['help', 'what can you do', 'how to use', 'commands', 'what can i ask', 'assist me', 'guide', 'help me', 'show me', 'capabilities', 'features', 'what do you know', 'how does this work', 'instructions']
  }
};

// Out-of-scope rejection patterns (don't reject greetings or polite conversation)
const REJECT_PATTERNS = [
  'calculate', 'math', 'add', 'subtract', 'multiply', 'divide',
  'weather', 'news', 'sports', 'recipe', 'movie', 'song',
  'translate', 'define', 'meaning', 'wikipedia', 'google', 'search'
];

export default function VoiceAssistant({ userProfile, onNavigate, onCreateEmergency, onShowBloodBanks }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.2);
  
  // Conversation context for follow-up interactions
  const [conversationContext, setConversationContext] = useState({
    awaitingFollowUp: false,
    followUpType: null, // 'scheduleAppointment', 'createEmergency', 'viewHistory', etc.
    followUpData: null  // Stores context data for the follow-up
  });

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const contextRef = useRef(conversationContext); // Track context with ref
  const isListeningRef = useRef(isListening); // Track listening state with ref
  const selectedVoiceRef = useRef(selectedVoice); // Track selected voice with ref
  const voiceSpeedRef = useRef(voiceSpeed); // Track voice speed with ref

  // Update context ref whenever context changes
  useEffect(() => {
    contextRef.current = conversationContext;
  }, [conversationContext]);

  // Update listening ref whenever listening state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Update voice refs whenever they change
  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    voiceSpeedRef.current = voiceSpeed;
  }, [voiceSpeed]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = synthRef.current.getVoices();
      
      // Filter to only Google UK English voices (en-GB)
      const ukVoices = allVoices.filter(voice => 
        voice.lang === 'en-GB' && 
        voice.name.toLowerCase().includes('google')
      );
      
      setAvailableVoices(ukVoices);
      
      // Auto-select Google UK English Female as default
      if (!selectedVoice && ukVoices.length > 0) {
        const femaleVoice = ukVoices.find(voice => 
          voice.name.toLowerCase().includes('female')
        );
        const defaultVoice = femaleVoice || ukVoices[0];
        setSelectedVoice(defaultVoice);
        console.log('🎤 Default voice set to:', defaultVoice?.name);
      }
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN'; // Support Indian English

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError('');
      // Only clear if not awaiting follow-up (use ref for current value)
      if (!contextRef.current.awaitingFollowUp) {
        setTranscript('');
        setResponse('');
        setIntent(null);
      }
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        // Stop recognition immediately after getting final result
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        processVoiceCommand(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable microphone permissions.');
      } else {
        setError('Voice recognition error. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []); // Empty dependency array is fine now that we use contextRef

  // Start/Stop listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsMinimized(false);
      recognitionRef.current?.start();
    }
  };

  // Text-to-speech
  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      // CRITICAL: Use refs instead of state to get fresh values and avoid stale closures
      const currentVoice = selectedVoiceRef.current;
      const currentSpeed = voiceSpeedRef.current;
      
      utterance.lang = currentVoice?.lang || 'en-US';
      utterance.rate = currentSpeed; // User-adjustable speed from ref
      utterance.pitch = 1.1; // Slightly higher pitch for clarity
      utterance.volume = 1.0; // Full volume
      
      // Use selected voice or find Google UK English Female as fallback
      if (currentVoice) {
        utterance.voice = currentVoice;
        console.log('🎤 Using voice:', currentVoice.name, 'at speed:', currentSpeed);
      } else {
        const voices = synthRef.current.getVoices();
        // Fallback to Google UK English Female
        const fallbackVoice = voices.find(voice => 
          voice.lang === 'en-GB' && 
          voice.name.toLowerCase().includes('google') &&
          voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
          voice.lang === 'en-GB' && 
          voice.name.toLowerCase().includes('google')
        );
        if (fallbackVoice) {
          utterance.voice = fallbackVoice;
          console.log('🎤 Using fallback voice:', fallbackVoice.name, 'at speed:', currentSpeed);
        }
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-restart recognition if awaiting follow-up
        if (contextRef.current.awaitingFollowUp && !isListeningRef.current) {
          console.log('🔄 Auto-restarting recognition for follow-up');
          setTimeout(() => {
            if (recognitionRef.current && !isListeningRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Recognition already started or error:', error);
              }
            }
          }, 250); // Even faster response for better UX
        }
      };
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  // Extract blood type from text
  const extractBloodType = (text) => {
    const lowerText = text.toLowerCase();
    
    const bloodTypeMap = {
      'o positive': 'O+', 'o+': 'O+', 'o pos': 'O+',
      'o negative': 'O-', 'o-': 'O-', 'o neg': 'O-',
      'a positive': 'A+', 'a+': 'A+', 'a pos': 'A+',
      'a negative': 'A-', 'a-': 'A-', 'a neg': 'A-',
      'b positive': 'B+', 'b+': 'B+', 'b pos': 'B+',
      'b negative': 'B-', 'b-': 'B-', 'b neg': 'B-',
      'ab positive': 'AB+', 'ab+': 'AB+', 'ab pos': 'AB+',
      'ab negative': 'AB-', 'ab-': 'AB-', 'ab neg': 'AB-'
    };

    for (const [key, value] of Object.entries(bloodTypeMap)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }
    return null;
  };

  // Extract location from text
  const extractLocation = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for "near me" or "nearby"
    if (lowerText.includes('near me') || lowerText.includes('nearby') || lowerText.includes('closest')) {
      return 'USER_LOCATION'; // Trigger geolocation
    }

    // Extract city names (common Indian cities)
    const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'patna', 'vadodara', 'ludhiana', 'agra', 'nashik', 'meerut'];
    
    for (const city of cities) {
      if (lowerText.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    // Extract from "in <location>" pattern
    const inPattern = /\bin\s+([a-z]+)/i;
    const match = text.match(inPattern);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }

    return null;
  };

  // Check if query is out of scope
  const isOutOfScope = (text) => {
    const lowerText = text.toLowerCase();
    
    // CRITICAL: Allow yes/no/affirmative/negative responses always
    const isFollowUpResponse = INTENT_PATTERNS.affirmative.keywords.some(k => lowerText.includes(k)) ||
                               INTENT_PATTERNS.negative.keywords.some(k => lowerText.includes(k));
    if (isFollowUpResponse) {
      return false; // Never reject yes/no responses
    }
    
    // Allow greetings and polite conversation
    const politeKeywords = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'how are you', 'your name', 'who are you'];
    if (politeKeywords.some(keyword => lowerText.includes(keyword))) {
      return false;
    }
    
    // Check for rejection patterns
    for (const pattern of REJECT_PATTERNS) {
      if (lowerText.includes(pattern)) {
        // Allow if it's blood-related
        if (lowerText.includes('blood') || lowerText.includes('donate') || lowerText.includes('donation')) {
          return false;
        }
        return true;
      }
    }

    // Check if any blood-related keywords exist
    const bloodRelatedKeywords = ['blood', 'donate', 'donation', 'donor', 'emergency', 'hospital', 'bank', 'eligible', 'transfusion'];
    const hasBloodKeyword = bloodRelatedKeywords.some(keyword => lowerText.includes(keyword));
    
    if (!hasBloodKeyword) {
      // Check if matches any intent
      const matchesIntent = Object.values(INTENT_PATTERNS).some(pattern => 
        pattern.keywords.some(keyword => lowerText.includes(keyword))
      );
      
      return !matchesIntent;
    }

    return false;
  };

  // Classify intent from transcript
  const classifyIntent = (text) => {
    const lowerText = text.toLowerCase();

    // Check each intent pattern
    for (const [intentName, pattern] of Object.entries(INTENT_PATTERNS)) {
      for (const keyword of pattern.keywords) {
        if (lowerText.includes(keyword)) {
          return intentName;
        }
      }
    }

    return null;
  };

  // Handle follow-up responses (yes/no questions)
  const handleFollowUpResponse = async (text) => {
    console.log('🔄 Handling follow-up response:', text);
    console.log('📌 Current context (ref):', contextRef.current);
    console.log('📌 Current context (state):', conversationContext);
    const lowerText = text.toLowerCase();
    const detectedIntent = classifyIntent(text);
    
    const isAffirmative = detectedIntent === 'affirmative' || 
                          INTENT_PATTERNS.affirmative.keywords.some(k => lowerText.includes(k));
    const isNegative = detectedIntent === 'negative' || 
                       INTENT_PATTERNS.negative.keywords.some(k => lowerText.includes(k));

    console.log('✅ Affirmative:', isAffirmative, '❌ Negative:', isNegative);
    // CRITICAL: Use contextRef.current for fresh data
    const { followUpType, followUpData } = contextRef.current;
    console.log('📋 Follow-up type:', followUpType);
    console.log('📦 Follow-up data:', followUpData);

    if (isAffirmative) {
      console.log('✅ Processing affirmative response for:', followUpType);
      // User said "yes" - execute the follow-up action
      switch (followUpType) {
        case 'scheduleAppointment': {
          const confirmResponse = "Great! I'm navigating you to the blood banks section where you can choose a location and book your appointment.";
          setResponse(confirmResponse);
          speak(confirmResponse);
          if (onNavigate) {
            onNavigate('donate');
          }
          break;
        }

        case 'viewHistory': {
          const confirmResponse = "Perfect! Let me show you your donation history.";
          setResponse(confirmResponse);
          speak(confirmResponse);
          if (onNavigate) {
            onNavigate('profile');
          }
          break;
        }

        case 'findBloodBanks': {
          const confirmResponse = "Excellent! I'll show you nearby blood banks where you can donate.";
          setResponse(confirmResponse);
          speak(confirmResponse);
          if (onNavigate) {
            onNavigate('donate');
          }
          if (onShowBloodBanks) {
            onShowBloodBanks(followUpData?.location);
          }
          break;
        }

        case 'createEmergency': {
          const confirmResponse = `Creating your emergency request now for ${followUpData?.bloodType || 'the specified'} blood.`;
          setResponse(confirmResponse);
          speak(confirmResponse);
          if (onNavigate) {
            onNavigate('emergency');
          }
          if (onCreateEmergency) {
            onCreateEmergency(followUpData);
          }
          break;
        }

        case 'checkEligibilityDetails': {
          const detailResponse = "To donate blood, you must: be 18-65 years old, weigh at least 50kg, be in good health, not have donated in the last 90 days, and not have any infections or diseases. Would you like to schedule a donation?";
          setResponse(detailResponse);
          speak(detailResponse);
          // Set new follow-up for scheduling
          setConversationContext({
            awaitingFollowUp: true,
            followUpType: 'scheduleAppointment',
            followUpData: null
          });
          return; // Don't clear context yet
        }

        default: {
          console.log('⚠️ Unknown follow-up type:', followUpType);
          const defaultResponse = "Great! How else can I help you?";
          setResponse(defaultResponse);
          speak(defaultResponse);
          break;
        }
      }
    } else if (isNegative) {
      // User said "no" - cancel the follow-up
      const cancelResponses = [
        "No problem! Is there anything else I can help you with?",
        "Alright! Let me know if you need anything else.",
        "Okay, maybe another time. What else can I do for you?",
        "Sure thing! Feel free to ask me anything else."
      ];
      const cancelResponse = cancelResponses[Math.floor(Math.random() * cancelResponses.length)];
      setResponse(cancelResponse);
      speak(cancelResponse);
    } else {
      // Unclear response - ask again
      const clarifyResponse = "I didn't quite catch that. Could you please say 'yes' or 'no'?";
      setResponse(clarifyResponse);
      speak(clarifyResponse);
      console.log('⚠️ Unclear response, asking for clarification');
      // Keep context active but restart recognition
      return; // Don't clear context
    }

    // Clear conversation context
    console.log('🧹 Clearing conversation context');
    setConversationContext({
      awaitingFollowUp: false,
      followUpType: null,
      followUpData: null
    });
  };

  // Process voice command
  const processVoiceCommand = async (text) => {
    console.log('🎤 Processing voice command:', text);
    console.log('📌 Context state:', conversationContext);
    console.log('� Context ref:', contextRef.current);
    console.log('�🔍 AwaitingFollowUp (state):', conversationContext.awaitingFollowUp);
    console.log('🔍 AwaitingFollowUp (ref):', contextRef.current.awaitingFollowUp);
    setIsProcessing(true);

    try {
      // CRITICAL: Use contextRef.current instead of conversationContext
      // to avoid stale state issues when mic auto-restarts
      if (contextRef.current.awaitingFollowUp) {
        console.log('✅ Follow-up mode IS ACTIVE (using ref), calling handler');
        await handleFollowUpResponse(text);
        console.log('✅ Follow-up handler completed, returning now');
        setIsProcessing(false);
        return;
      }

      console.log('🆕 Processing as new command (not a follow-up)');

      // Check if out of scope
      if (isOutOfScope(text)) {
        const rejectResponse = "I'm sorry, I can only assist with blood donation related queries. You can ask me about finding blood banks, creating emergency requests, checking donation eligibility, or viewing your donation history.";
        setResponse(rejectResponse);
        setIntent('rejected');
        speak(rejectResponse);
        setIsProcessing(false);
        return;
      }

      // Classify intent
      const detectedIntent = classifyIntent(text);
      setIntent(detectedIntent);

      if (!detectedIntent) {
        // Get current hour for time-aware responses
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        
        const clarifyResponse = `Good ${timeGreeting}! I didn't quite catch that. Here are some things you can ask me:\n\n🚨 "I need O+ blood urgently"\n🏥 "Find nearest blood bank"\n✅ "Can I donate blood?"\n📊 "Show my donation history"\n📅 "Schedule an appointment"\n\nWhat would you like to do?`;
        setResponse(clarifyResponse);
        speak(`I didn't quite understand that. You can ask me to find blood banks, create emergency requests, check eligibility, or schedule appointments. What would you like to do?`);
        setIsProcessing(false);
        return;
      }

      // Handle each intent
      switch (detectedIntent) {
        case 'greeting': {
          // Time-aware personalized greetings
          const hour = new Date().getHours();
          const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
          const userName = userProfile?.name ? `, ${userProfile.name}` : '';
          
          const greetingResponses = [
            `${timeGreeting}${userName}! I'm your blood donation assistant. How can I help you save lives today?`,
            `${timeGreeting}! Ready to make a difference? I can help you with blood donation queries.`,
            `Hey there${userName}! Welcome to Raksetu. I'm here to assist with blood donation and emergency requests.`,
            `${timeGreeting}! I'm your voice assistant for all things blood donation. What can I do for you?`
          ];
          const greetingResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
          setResponse(greetingResponse);
          speak(greetingResponse);
          break;
        }

        case 'goodbye': {
          const goodbyeResponses = [
            "Goodbye! Thank you for being a hero. Stay safe!",
            "Take care! Remember, every donation saves lives. See you soon!",
            "Bye! Don't forget to stay hydrated and healthy for your next donation.",
            "See you later! Thanks for using Raksetu. Together we save lives!"
          ];
          const goodbyeResponse = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
          setResponse(goodbyeResponse);
          speak(goodbyeResponse);
          break;
        }

        case 'howAreYou': {
          const howAreYouResponses = [
            "I'm doing great, thank you for asking! Ready to help you with blood donation queries. How are you?",
            "I'm excellent! Always energized when I can help save lives. How can I assist you today?",
            "I'm functioning perfectly and ready to help! What can I do for you?",
            "Doing wonderful! It's a great day to donate blood and save lives. How about you?"
          ];
          const howAreYouResponse = howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)];
          setResponse(howAreYouResponse);
          speak(howAreYouResponse);
          break;
        }

        case 'yourName': {
          const nameResponse = "I'm Raksetu Voice Assistant! I'm your friendly AI helper specialized in blood donation. I can help you find blood banks, check eligibility, create emergency requests, and more. What would you like to know?";
          setResponse(nameResponse);
          speak(nameResponse);
          break;
        }

        case 'emergency': {
          const bloodType = extractBloodType(text);
          const location = extractLocation(text);
          
          let emergencyResponse = '';
          
          if (bloodType && location) {
            emergencyResponse = `Creating emergency request for ${bloodType} blood${location !== 'USER_LOCATION' ? ' in ' + location : ' at your location'}.`;
            
            // Navigate to emergency section and trigger request creation
            if (onNavigate) {
              onNavigate('emergency');
            }
            if (onCreateEmergency) {
              onCreateEmergency({ bloodType, location: location === 'USER_LOCATION' ? null : location });
            }
          } else if (bloodType) {
            emergencyResponse = `I detected ${bloodType} blood type. Please specify the location or say 'near me'.`;
          } else {
            emergencyResponse = "I'll help you create an emergency request. Please specify the blood type needed, like 'O positive' or 'AB negative'.";
          }
          
          setResponse(emergencyResponse);
          speak(emergencyResponse);
          break;
        }

        case 'findBloodBank': {
          const location = extractLocation(text);
          
          let bloodBankResponse = '';
          
          if (location) {
            bloodBankResponse = location === 'USER_LOCATION' 
              ? 'Finding blood banks near your location. Would you like to schedule a donation at one of these locations?'
              : `Showing blood banks in ${location}. Would you like to schedule a donation?`;
            
            // Navigate to donate section where blood banks are displayed
            if (onNavigate) {
              onNavigate('donate');
            }
            if (onShowBloodBanks) {
              onShowBloodBanks(location === 'USER_LOCATION' ? null : location);
            }
            
            // Set follow-up context
            setConversationContext({
              awaitingFollowUp: true,
              followUpType: 'scheduleAppointment',
              followUpData: { location: location === 'USER_LOCATION' ? null : location }
            });
          } else {
            bloodBankResponse = "I'll help you find blood banks. Please specify a city or say 'near me'.";
          }
          
          setResponse(bloodBankResponse);
          speak(bloodBankResponse);
          break;
        }

        case 'eligibility': {
          // Check user's last donation date
          if (userProfile?.lastDonationDate) {
            const lastDonation = new Date(userProfile.lastDonationDate);
            const daysSince = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
            const daysUntilEligible = 90 - daysSince;
            
            let eligibilityResponse = '';
            if (daysUntilEligible <= 0) {
              eligibilityResponse = `Great news! You are eligible to donate blood. Your last donation was ${daysSince} days ago. Would you like to schedule a donation appointment?`;
              // Set follow-up context
              setConversationContext({
                awaitingFollowUp: true,
                followUpType: 'scheduleAppointment',
                followUpData: null
              });
            } else {
              eligibilityResponse = `You can donate again in ${daysUntilEligible} days. You need to wait 90 days between donations. Would you like me to remind you when you're eligible?`;
            }
            
            setResponse(eligibilityResponse);
            speak(eligibilityResponse);
          } else {
            const firstTimeResponse = "It looks like you haven't donated before. You're likely eligible! Would you like to know more about the eligibility requirements?";
            setResponse(firstTimeResponse);
            speak(firstTimeResponse);
            // Set follow-up context
            setConversationContext({
              awaitingFollowUp: true,
              followUpType: 'checkEligibilityDetails',
              followUpData: null
            });
          }
          break;
        }

        case 'donationHistory': {
          const donationCount = userProfile?.totalDonations || 0;
          let historyResponse = '';
          
          if (donationCount > 0) {
            historyResponse = `You have donated blood ${donationCount} time${donationCount > 1 ? 's' : ''}. Thank you for being a hero! Would you like to see your detailed donation history?`;
            // Set follow-up context
            setConversationContext({
              awaitingFollowUp: true,
              followUpType: 'viewHistory',
              followUpData: null
            });
          } else {
            historyResponse = "You haven't donated blood yet through our platform. Would you like to schedule your first donation?";
            // Set follow-up context
            setConversationContext({
              awaitingFollowUp: true,
              followUpType: 'scheduleAppointment',
              followUpData: null
            });
          }
          
          setResponse(historyResponse);
          speak(historyResponse);
          break;
        }

        case 'appointment': {
          const appointmentResponse = "I'll help you schedule a donation appointment. Navigating to the blood banks section where you can book an appointment.";
          setResponse(appointmentResponse);
          speak(appointmentResponse);
          
          // Navigate immediately for appointment
          if (onNavigate) {
            onNavigate('donate');
          }
          break;
        }

        case 'bloodInfo': {
          let infoResponse = '';
          
          if (text.toLowerCase().includes('blood type') || text.toLowerCase().includes('blood group')) {
            infoResponse = userProfile?.bloodType 
              ? `Your blood type is ${userProfile.bloodType}.`
              : "I don't have your blood type on record. Please update your profile.";
          } else if (text.toLowerCase().includes('benefits')) {
            infoResponse = "Blood donation has many benefits: it helps save lives, reduces heart disease risk, burns calories, and provides a free health screening.";
          } else if (text.toLowerCase().includes('process') || text.toLowerCase().includes('how to')) {
            infoResponse = "The donation process takes about 10 minutes. You'll have a quick health check, then donate about 350ml of blood. You can donate every 3 months.";
          } else {
            infoResponse = "Blood donation is safe and saves lives. One donation can help up to three patients. You can donate every 90 days.";
          }
          
          setResponse(infoResponse);
          speak(infoResponse);
          break;
        }

        case 'help': {
          const helpResponse = "I can help you with: Finding blood banks or hospitals, creating emergency blood requests, checking donation eligibility, viewing your donation history, and scheduling appointments. What would you like to do?";
          setResponse(helpResponse);
          speak(helpResponse);
          setShowHelp(true);
          break;
        }

        default: {
          const defaultResponse = "I'm not sure how to help with that. Try asking about blood banks, emergency requests, or donation eligibility.";
          setResponse(defaultResponse);
          speak(defaultResponse);
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setError('Failed to process command. Please try again.');
    }

    setIsProcessing(false);
  };

  // Stop speaking
  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // Example commands for help
  const exampleCommands = [
    { category: 'Greetings & Chat', examples: ['Hello', 'Hi, how are you?', 'What\'s your name?', 'Thank you', 'Goodbye'] },
    { category: 'Emergency', examples: ['I need O positive blood urgently', 'Emergency blood request in Mumbai', 'Patient needs AB negative blood'] },
    { category: 'Find Blood Banks', examples: ['Find nearest blood bank', 'Blood banks near me', 'Show hospitals in Delhi'] },
    { category: 'Eligibility', examples: ['Can I donate blood?', 'Am I eligible to donate?', 'When can I donate next?'] },
    { category: 'History', examples: ['Show my donation history', 'How many times have I donated?', 'When was my last donation?'] },
    { category: 'Appointments', examples: ['Schedule a donation', 'Book an appointment', 'Reserve a slot'] },
    { category: 'Information', examples: ['What is my blood type?', 'Benefits of blood donation', 'How to donate blood?'] }
  ];

  return (
    <>
      {/* Floating Voice Button */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 left-24 z-40 bg-gradient-to-r from-red-600 to-black text-white p-4 rounded-full shadow-2xl hover:shadow-red-600/50 transition-all duration-300 hover:scale-110 group"
          aria-label="Open Voice Assistant"
        >
          <Mic className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Voice Assistant Panel */}
      {!isMinimized && (
        <div className="fixed bottom-6 left-24 z-40 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5" />
              <h3 className="font-semibold">Blood Donation Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Voice Settings"
                title="Voice Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Minimize"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 max-h-64 overflow-y-auto">
              <h4 className="font-semibold text-gray-900 mb-3">What can I help you with?</h4>
              <div className="space-y-3">
                {exampleCommands.map((cmd, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-medium text-red-600 mb-1">{cmd.category}</p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                      {cmd.examples.map((example, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>"{example}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Voice Settings
              </h4>
              
              {/* Voice Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Voice:
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name.includes('Female') ? '👩 Female (UK English)' : '👨 Male (UK English)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {availableVoices.length} UK English voice{availableVoices.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {/* Speed Control */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Speech Speed: {voiceSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x Slow</span>
                  <span>1.0x Normal</span>
                  <span>2.0x Fast</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <button
                onClick={() => speak("Hello! This is how I sound. How do you like it?")}
                disabled={isSpeaking}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isSpeaking ? 'Speaking...' : 'Test Voice'}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">You said:</p>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}

            {/* Intent Badge */}
            {intent && intent !== 'rejected' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Detected:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {intent.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className={`${intent === 'rejected' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border p-3 rounded-lg`}>
                <p className={`text-xs ${intent === 'rejected' ? 'text-yellow-600' : 'text-green-600'} font-medium mb-1`}>
                  {intent === 'rejected' ? 'Out of scope:' : 'Assistant:'}
                </p>
                <p className="text-gray-900 text-sm">{response}</p>
                
                {/* Follow-up indicator */}
                {conversationContext.awaitingFollowUp && (
                  <div className="mt-2 pt-2 border-t border-green-300">
                    <p className="text-xs text-green-700 font-medium flex items-center">
                      <span className="animate-pulse mr-2">💬</span>
                      Waiting for your response (say "yes" or "no")
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}

            {/* Microphone Button */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`relative p-6 rounded-full transition-all duration-300 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-red-600 to-black text-white hover:shadow-lg hover:shadow-red-600/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Listening... Click to stop
                    </span>
                  </>
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              {/* Stop Speaking Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Stop speaking"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Instructions */}
            {!transcript && !response && (
              <p className="text-center text-sm text-gray-500">
                Click the microphone and speak your query
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
