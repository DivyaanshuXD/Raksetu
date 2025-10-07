import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Voice Search Component
 * 
 * Implements Web Speech API for voice-based search
 * English-only voice recognition for medical resources and blood banks
 * 
 * Features:
 * - Real-time speech recognition
 * - Visual feedback during recording
 * - Transcript display
 * - Error handling for unsupported browsers
 * - Microphone permission handling
 */
const VoiceSearch = ({ onSearch, placeholder, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after user stops speaking
      recognition.interimResults = true; // Show results as user speaks
      recognition.lang = 'en-US'; // English only
      recognition.maxAlternatives = 1;

      // Handle recognition results
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        
        setTranscript(transcriptText);
        
        // If result is final, trigger search
        if (event.results[current].isFinal) {
          console.log('[VoiceSearch] Final transcript:', transcriptText);
          if (onSearch && transcriptText.trim()) {
            onSearch(transcriptText.trim());
          }
        }
      };

      // Handle recognition end
      recognition.onend = () => {
        console.log('[VoiceSearch] Recognition ended');
        setIsListening(false);
      };

      // Handle errors
      recognition.onerror = (event) => {
        console.error('[VoiceSearch] Recognition error:', event.error);
        
        let errorMessage = t('voice_search.error_generic');
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = t('voice_search.error_no_speech');
            break;
          case 'audio-capture':
            errorMessage = t('voice_search.error_no_microphone');
            break;
          case 'not-allowed':
            errorMessage = t('voice_search.error_permission_denied');
            break;
          case 'network':
            errorMessage = t('voice_search.error_network');
            break;
          default:
            errorMessage = t('voice_search.error_generic');
        }
        
        setError(errorMessage);
        setIsListening(false);
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('[VoiceSearch] Speech recognition not supported');
      setIsSupported(false);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSearch, t]);

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log('[VoiceSearch] Started listening');
    } catch (error) {
      console.error('[VoiceSearch] Error starting recognition:', error);
      setError(t('voice_search.error_generic'));
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('[VoiceSearch] Stopped listening');
    } catch (error) {
      console.error('[VoiceSearch] Error stopping recognition:', error);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <AlertCircle size={18} className="text-yellow-600" />
        <span className="text-sm text-yellow-700">
          {t('voice_search.not_supported')}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Voice Search Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleListening}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium
            transition-all duration-300 transform
            ${isListening
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg scale-105 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg hover:scale-105'
            }
          `}
          aria-label={isListening ? t('voice_search.stop') : t('voice_search.start')}
          disabled={!isSupported}
        >
          {isListening ? (
            <>
              <MicOff size={20} />
              <span>{t('voice_search.listening')}</span>
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>{t('voice_search.start')}</span>
            </>
          )}
        </button>

        {/* Text-to-speech button (optional) */}
        {transcript && !isListening && (
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(transcript);
              utterance.lang = 'en-US';
              speechSynthesis.speak(utterance);
            }}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label={t('voice_search.speak')}
          >
            <Volume2 size={20} />
          </button>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || isListening) && (
        <div className={`
          p-4 rounded-xl border-2 transition-all duration-300
          ${isListening 
            ? 'bg-blue-50 border-blue-300 animate-pulse' 
            : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div className="flex items-start gap-2">
            <Mic size={16} className={isListening ? 'text-blue-600' : 'text-gray-500'} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isListening ? t('voice_search.transcript_live') : t('voice_search.transcript')}
              </p>
              <p className="text-gray-900">
                {transcript || <span className="text-gray-400 italic">{placeholder || t('voice_search.speak_now')}</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 mb-1">
              {t('voice_search.error')}
            </p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs text-gray-600 mb-2">
          <strong>{t('voice_search.instructions_title')}</strong>
        </p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>{t('voice_search.instruction_1')}</li>
          <li>{t('voice_search.instruction_2')}</li>
          <li>{t('voice_search.instruction_3')}</li>
        </ul>
      </div>
    </div>
  );
};

VoiceSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default VoiceSearch;
