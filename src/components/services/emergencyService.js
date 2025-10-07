/**
 * Emergency Service (Component Level)
 * Re-export from centralized service for backward compatibility
 */

export { 
  addEmergencyRequest,
  getEmergencyRequest,
  updateEmergencyRequest,
  deleteEmergencyRequest,
  getActiveEmergencyRequests,
  subscribeToEmergencyRequests,
  getEmergencyRequestsByUser,
  markEmergencyAsFulfilled,
  cancelEmergencyRequest
} from '../../services/emergencyService';