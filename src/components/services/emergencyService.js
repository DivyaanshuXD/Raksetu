import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';

export const addEmergencyRequest = async (emergencyForm, userLocation) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to submit an emergency request');
  }

  const emergencyData = {
    ...emergencyForm,
    userId: currentUser.uid,
    userName: currentUser.displayName || 'Anonymous',
    userEmail: currentUser.email,
    status: 'active',
    urgencyLevel: getUrgencyLevel(emergencyForm.urgency),
    timestamp: serverTimestamp(),
    coordinates: userLocation || null,
  };

  const docRef = await addDoc(collection(db, 'emergencyRequests'), emergencyData);
  return docRef.id;
};

const getUrgencyLevel = (urgency) => {
  switch(urgency) {
    case 'Critical': return 4;
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    default: return 2;
  }
};