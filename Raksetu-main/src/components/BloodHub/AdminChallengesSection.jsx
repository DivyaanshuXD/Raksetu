import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  addDoc, 
  Timestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Target, 
  Calendar, 
  Award,
  TrendingUp,
  X,
  Check,
  AlertCircle,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import { CHALLENGE_TYPES, CHALLENGE_STATUS } from '../../services/challengesService';

/**
 * Admin Challenge Management Component
 * Allows admins to create, edit, delete, and manage gamification challenges
 */
export default function AdminChallengesSection() {
  // State
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedChallengeStats, setSelectedChallengeStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: CHALLENGE_TYPES.MONTHLY_STREAK,
    target: 5,
    rewardPoints: 100,
    rewardBadge: '🏆',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: CHALLENGE_STATUS.ACTIVE
  });

  // Fetch challenges from Firebase
  useEffect(() => {
    const challengesQuery = query(
      collection(db, 'challenges'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(challengesQuery, 
      async (snapshot) => {
        const challengesList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Get participant count
            const participantsSnap = await getDocs(
              collection(db, 'challenges', docSnap.id, 'participants')
            );
            const participantCount = participantsSnap.size;
            
            // Calculate completion rate
            let completedCount = 0;
            participantsSnap.forEach(doc => {
              const participantData = doc.data();
              if (participantData.current >= data.target) {
                completedCount++;
              }
            });
            
            const completionRate = participantCount > 0 
              ? Math.round((completedCount / participantCount) * 100) 
              : 0;

            return {
              id: docSnap.id,
              ...data,
              participantCount,
              completedCount,
              completionRate,
              startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
              endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            };
          })
        );
        
        setChallenges(challengesList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching challenges:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      type: CHALLENGE_TYPES.MONTHLY_STREAK,
      target: 5,
      rewardPoints: 100,
      rewardBadge: '🏆',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: CHALLENGE_STATUS.ACTIVE
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (challenge) => {
    setModalMode('edit');
    setSelectedChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      target: challenge.target,
      rewardPoints: challenge.rewardPoints,
      rewardBadge: challenge.rewardBadge || '🏆',
      startDate: challenge.startDate.toISOString().split('T')[0],
      endDate: challenge.endDate.toISOString().split('T')[0],
      status: challenge.status
    });
    setShowModal(true);
  };

  // Create or update challenge
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const challengeData = {
        ...formData,
        target: parseInt(formData.target),
        rewardPoints: parseInt(formData.rewardPoints),
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        updatedAt: Timestamp.now()
      };

      if (modalMode === 'create') {
        await addDoc(collection(db, 'challenges'), {
          ...challengeData,
          createdAt: Timestamp.now(),
          totalCompletions: 0
        });
      } else {
        await updateDoc(doc(db, 'challenges', selectedChallenge.id), challengeData);
      }

      setShowModal(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Failed to save challenge. Please try again.');
    }
  };

  // Delete challenge
  const handleDelete = async () => {
    if (!challengeToDelete) return;

    try {
      await deleteDoc(doc(db, 'challenges', challengeToDelete.id));
      setShowDeleteConfirm(false);
      setChallengeToDelete(null);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge. Please try again.');
    }
  };

  // View challenge statistics
  const viewStats = async (challenge) => {
    try {
      const participantsSnap = await getDocs(
        collection(db, 'challenges', challenge.id, 'participants')
      );
      
      const participants = [];
      participantsSnap.forEach(doc => {
        participants.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setSelectedChallengeStats({
        ...challenge,
        participants
      });
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error fetching challenge stats:', error);
    }
  };

  // Get challenge type label
  const getChallengeTypeLabel = (type) => {
    const labels = {
      [CHALLENGE_TYPES.MONTHLY_STREAK]: 'Monthly Streak',
      [CHALLENGE_TYPES.COMMUNITY_GOAL]: 'Community Goal',
      [CHALLENGE_TYPES.REFERRAL]: 'Referral',
      [CHALLENGE_TYPES.SPEED_DEMON]: 'Speed Demon',
      [CHALLENGE_TYPES.DISTANCE_WARRIOR]: 'Distance Warrior',
      [CHALLENGE_TYPES.EMERGENCY_HERO]: 'Emergency Hero'
    };
    return labels[type] || type;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      [CHALLENGE_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
      [CHALLENGE_STATUS.COMPLETED]: 'bg-blue-100 text-blue-700',
      [CHALLENGE_STATUS.EXPIRED]: 'bg-gray-100 text-gray-700',
      [CHALLENGE_STATUS.UPCOMING]: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Render create/edit modal
  const renderModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-red-600" />
            {modalMode === 'create' ? 'Create New Challenge' : 'Edit Challenge'}
          </h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Challenge Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Blood Donation Hero"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the challenge..."
            />
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.values(CHALLENGE_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getChallengeTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.values(CHALLENGE_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target and Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target (Goal) *
              </label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Points *
              </label>
              <input
                type="number"
                name="rewardPoints"
                value={formData.rewardPoints}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., 100"
              />
            </div>
          </div>

          {/* Badge Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Emoji *
            </label>
            <input
              type="text"
              name="rewardBadge"
              value={formData.rewardBadge}
              onChange={handleInputChange}
              required
              maxLength="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., 🏆"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common options: 🏆 🎖️ ⭐ 🔥 💪 🎯 👑 💎
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              {modalMode === 'create' ? 'Create Challenge' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render delete confirmation modal
  const renderDeleteConfirm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Challenge?
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete "{challengeToDelete?.title}"? This action cannot be undone and will remove all participant data.
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setChallengeToDelete(null);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Render statistics modal
  const renderStatsModal = () => {
    if (!selectedChallengeStats) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Challenge Statistics
            </h3>
            <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Content */}
          <div className="p-6">
            {/* Challenge Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedChallengeStats.rewardBadge} {selectedChallengeStats.title}
              </h4>
              <p className="text-gray-600">{selectedChallengeStats.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">
                  {selectedChallengeStats.participantCount}
                </div>
                <div className="text-sm text-blue-600">Total Participants</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {selectedChallengeStats.completedCount}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">
                  {selectedChallengeStats.completionRate}%
                </div>
                <div className="text-sm text-purple-600">Completion Rate</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">
                  {selectedChallengeStats.target}
                </div>
                <div className="text-sm text-orange-600">Target Goal</div>
              </div>
            </div>

            {/* Participants Table */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">
                Top Participants ({selectedChallengeStats.participants.length})
              </h5>
              
              {selectedChallengeStats.participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No participants yet
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedChallengeStats.participants
                          .sort((a, b) => b.current - a.current)
                          .map((participant, index) => {
                            const percentage = Math.min(100, Math.round((participant.current / selectedChallengeStats.target) * 100));
                            const isCompleted = participant.current >= selectedChallengeStats.target;
                            
                            return (
                              <tr key={participant.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  #{index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                  {participant.id.substring(0, 8)}...
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-red-600 h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                      {participant.current}/{selectedChallengeStats.target}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {isCompleted ? (
                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-red-600" />
            Challenge Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage gamification challenges to engage donors
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{challenges.length}</span>
          </div>
          <div className="text-sm text-gray-600">Total Challenges</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {challenges.filter(c => c.status === CHALLENGE_STATUS.ACTIVE).length}
            </span>
          </div>
          <div className="text-sm text-gray-600">Active Challenges</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {challenges.reduce((sum, c) => sum + c.participantCount, 0)}
            </span>
          </div>
          <div className="text-sm text-gray-600">Total Participants</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {challenges.length > 0 
                ? Math.round(challenges.reduce((sum, c) => sum + c.completionRate, 0) / challenges.length)
                : 0}%
            </span>
          </div>
          <div className="text-sm text-gray-600">Avg Completion</div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges yet</h3>
            <p className="text-gray-600 mb-6">Create your first challenge to start engaging donors!</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    {/* Challenge Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{challenge.rewardBadge}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {challenge.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {challenge.rewardPoints} points
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getChallengeTypeLabel(challenge.type)}
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">{challenge.target}</span>
                      </div>
                    </td>

                    {/* Participants */}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">{challenge.participantCount}</span>
                      </div>
                    </td>

                    {/* Completion Rate */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${challenge.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {challenge.completionRate}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(challenge.status)}`}>
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="text-xs">
                          {challenge.startDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="text-xs">
                          {challenge.endDate.toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => viewStats(challenge)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Statistics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(challenge)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Challenge"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setChallengeToDelete(challenge);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && renderModal()}
      {showDeleteConfirm && renderDeleteConfirm()}
      {showStatsModal && renderStatsModal()}
    </div>
  );
}
