import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Share2, 
  Award,
  Clock,
  TrendingUp,
  CheckCircle,
  Lock,
  Flame,
  Gift,
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { auth } from '../utils/firebase';
import { 
  getUserActiveChallenges,
  getUserCompletedChallenges,
  subscribeToChallenges,
  getChallengeLeaderboard,
  generateShareText,
  CHALLENGE_TYPES
} from '../../services/challengesService';

/**
 * Dynamic Challenges Section
 * Displays adaptive challenges that change based on user behavior
 */
const ChallengesSection = ({ userProfile }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed'

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    loadChallenges();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChallenges(userId, (challenges) => {
      setActiveChallenges(challenges);
    });

    return () => unsubscribe();
  }, [userId]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [active, completed] = await Promise.all([
        getUserActiveChallenges(userId),
        getUserCompletedChallenges(userId)
      ]);

      setActiveChallenges(active);
      setCompletedChallenges(completed);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = async (challenge) => {
    setSelectedChallenge(challenge);
    
    // Load leaderboard for this challenge
    const leaderboardData = await getChallengeLeaderboard(challenge.id, 10);
    setLeaderboard(leaderboardData);
  };

  const handleShare = (challenge, platform) => {
    const shareText = generateShareText(challenge, challenge.userProgress);
    const url = 'https://raksetu.live';

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`,
          '_blank'
        );
        break;
      default:
        break;
    }
  };

  const getChallengeIcon = (type) => {
    switch (type) {
      case CHALLENGE_TYPES.MONTHLY_STREAK:
        return <Flame className="w-6 h-6" />;
      case CHALLENGE_TYPES.COMMUNITY_GOAL:
        return <Users className="w-6 h-6" />;
      case CHALLENGE_TYPES.REFERRAL:
        return <Share2 className="w-6 h-6" />;
      case CHALLENGE_TYPES.SPEED_DEMON:
        return <Zap className="w-6 h-6" />;
      case CHALLENGE_TYPES.DISTANCE_WARRIOR:
        return <Target className="w-6 h-6" />;
      case CHALLENGE_TYPES.EMERGENCY_HERO:
        return <Trophy className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getChallengeColor = (type) => {
    switch (type) {
      case CHALLENGE_TYPES.MONTHLY_STREAK:
        return 'from-orange-500 to-red-500';
      case CHALLENGE_TYPES.COMMUNITY_GOAL:
        return 'from-blue-500 to-indigo-600';
      case CHALLENGE_TYPES.REFERRAL:
        return 'from-purple-500 to-pink-500';
      case CHALLENGE_TYPES.SPEED_DEMON:
        return 'from-yellow-400 to-orange-500';
      case CHALLENGE_TYPES.DISTANCE_WARRIOR:
        return 'from-green-500 to-teal-500';
      case CHALLENGE_TYPES.EMERGENCY_HERO:
        return 'from-red-600 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Dynamic Challenges
            </h2>
            <p className="text-red-100 text-lg">
              Complete challenges, earn rewards, and compete with the community!
            </p>
          </div>
          <div className="text-center bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-4xl font-bold">{completedChallenges.length}</div>
            <div className="text-sm text-red-100">Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'active'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Challenges ({activeChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'completed'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedChallenges.length})
        </button>
      </div>

      {/* Active Challenges */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeChallenges.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Challenges</h3>
              <p className="text-gray-600">
                New challenges will be available soon! Keep donating to unlock more.
              </p>
            </div>
          ) : (
            activeChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-red-200 transition-all cursor-pointer"
                onClick={() => handleChallengeClick(challenge)}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getChallengeColor(challenge.type)} p-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{challenge.title}</h3>
                        <p className="text-sm text-white/80">{challenge.description}</p>
                      </div>
                    </div>
                    {challenge.isCompleted && (
                      <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress: {challenge.userProgress.current}/{challenge.target}
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {challenge.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-gradient-to-r ${getChallengeColor(challenge.type)}`}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.rewardPoints && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="text-gray-600">
                          <span className="font-bold text-yellow-600">{challenge.rewardPoints}</span> points
                        </span>
                      </div>
                    )}
                    {challenge.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {getDaysRemaining(challenge.endDate)} days left
                        </span>
                      </div>
                    )}
                    {challenge.totalParticipants > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">
                          {challenge.totalParticipants} participants
                        </span>
                      </div>
                    )}
                    {challenge.type === CHALLENGE_TYPES.COMMUNITY_GOAL && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Community goal</span>
                      </div>
                    )}
                  </div>

                  {/* Share Buttons */}
                  {challenge.userProgress.current > 0 && (
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600 mr-2">Share:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(challenge, 'facebook');
                        }}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Share on Facebook"
                      >
                        <Facebook size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(challenge, 'twitter');
                        }}
                        className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        title="Share on Twitter"
                      >
                        <Twitter size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(challenge, 'whatsapp');
                        }}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Completed Challenges */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedChallenges.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Challenges Yet</h3>
              <p className="text-gray-600">
                Start participating in active challenges to see your achievements here!
              </p>
            </div>
          ) : (
            completedChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-200"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      <div>
                        <h3 className="text-lg font-bold">{challenge.title}</h3>
                        <p className="text-sm text-green-100">Completed!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Achieved: {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                    {challenge.rewardPoints && (
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-yellow-600">
                          +{challenge.rewardPoints} pts
                        </span>
                      </div>
                    )}
                  </div>
                  {challenge.completedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      Completed on {challenge.completedAt.toDate().toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Challenge Detail Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${getChallengeColor(selectedChallenge.type)} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedChallenge.title}</h2>
                    <p className="text-white/90">{selectedChallenge.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Your Progress */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Your Progress</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        {selectedChallenge.userProgress.current} / {selectedChallenge.target}
                      </span>
                      <span className="font-bold text-red-600">
                        {selectedChallenge.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getChallengeColor(selectedChallenge.type)}`}
                        style={{ width: `${selectedChallenge.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Top Participants
                    </h3>
                    <div className="space-y-2">
                      {leaderboard.map((participant, index) => (
                        <div
                          key={participant.userId}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            participant.userId === userId
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0
                                  ? 'bg-yellow-400 text-yellow-900'
                                  : index === 1
                                  ? 'bg-gray-300 text-gray-700'
                                  : index === 2
                                  ? 'bg-orange-400 text-orange-900'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {participant.userName}
                                {participant.userId === userId && (
                                  <span className="ml-2 text-xs text-red-600">(You)</span>
                                )}
                              </div>
                              {participant.userBloodType && (
                                <div className="text-xs text-gray-500">
                                  {participant.userBloodType}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-gray-900">
                            {participant.progress} / {selectedChallenge.target}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reward Info */}
                {selectedChallenge.rewardPoints && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Gift className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="font-bold text-gray-900">Reward</div>
                        <div className="text-yellow-700">
                          Earn <span className="font-bold">{selectedChallenge.rewardPoints}</span> points upon completion!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengesSection;
