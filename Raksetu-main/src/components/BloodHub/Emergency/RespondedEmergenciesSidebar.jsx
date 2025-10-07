/**
 * RespondedEmergenciesSidebar Component
 * Slide-in sidebar showing user's responded emergencies
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, History, Droplets, CheckCircle, Clock, Loader } from 'lucide-react';
import RespondedEmergencyItem from './RespondedEmergencyItem';
import { getUserResponses } from '../../../services/emergencyResponseService';

const RespondedEmergenciesSidebar = ({ isOpen, onClose, userId }) => {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Fetch user responses
  useEffect(() => {
    if (isOpen && userId) {
      loadResponses();
    }
  }, [isOpen, userId]);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserResponses(userId);
      setResponses(data);
    } catch (err) {
      console.error('Error loading responses:', err);
      setError('Failed to load your responses');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter responses
  const filteredResponses = responses.filter(response => {
    if (!response?.donation) return false;
    
    if (filter === 'pending') return response.donation.status === 'pending';
    if (filter === 'completed') return response.donation.status === 'completed';
    return true; // 'all'
  });

  // Count stats
  const pendingCount = responses.filter(r => r?.donation?.status === 'pending').length;
  const completedCount = responses.filter(r => r?.donation?.status === 'completed').length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[28rem] bg-white shadow-2xl z-50
          flex flex-col
          animate-in slide-in-from-right duration-300
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <History size={24} />
              </div>
              <h2 className="text-xl font-bold">My Responses</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              All ({responses.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'pending'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size={32} className="text-red-600 animate-spin mb-3" />
              <p className="text-gray-600">Loading your responses...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800 mb-3">{error}</p>
              <button
                onClick={loadResponses}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredResponses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Droplets size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'pending' && 'No pending responses'}
                {filter === 'completed' && 'No completed donations yet'}
                {filter === 'all' && 'No responses yet'}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                {filter === 'all'
                  ? 'Start by responding to emergency blood requests'
                  : 'Switch to another tab to see your responses'
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  View All
                </button>
              )}
            </div>
          )}

          {/* Response List */}
          {!isLoading && !error && filteredResponses.length > 0 && (
            <div className="space-y-3">
              {filteredResponses.map((response) => (
                <RespondedEmergencyItem
                  key={response.donationId}
                  response={response}
                  onComplete={loadResponses}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-600 text-center">
            Your donations save lives. Thank you for being a hero! ❤️
          </p>
        </div>
      </div>
    </>
  );
};

RespondedEmergenciesSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string
};

export default RespondedEmergenciesSidebar;
