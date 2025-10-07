/**
 * Validation utility functions
 */

import { BLOOD_TYPES } from '../constants';
import { calculateAge } from './dateTime';

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate blood type
 * @param {string} bloodType - Blood type to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidBloodType = (bloodType) => {
  return BLOOD_TYPES.includes(bloodType);
};

/**
 * Validate age for blood donation (18-65 years)
 * @param {string|Date} dob - Date of birth
 * @returns {boolean} True if eligible age, false otherwise
 */
export const isValidDonorAge = (dob) => {
  const age = calculateAge(dob);
  return age >= 18 && age <= 65;
};

/**
 * Validate required fields in form data
 * @param {Object} formData - Form data object
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate emergency request form
 * @param {Object} formData - Emergency request form data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateEmergencyRequest = (formData) => {
  const errors = {};
  
  if (!formData.patientName?.trim()) {
    errors.patientName = 'Patient name is required';
  }
  
  if (!formData.hospital?.trim()) {
    errors.hospital = 'Hospital name is required';
  }
  
  if (!formData.bloodType || !isValidBloodType(formData.bloodType)) {
    errors.bloodType = 'Valid blood type is required';
  }
  
  if (!formData.urgency) {
    errors.urgency = 'Urgency level is required';
  }
  
  if (!formData.units || formData.units < 1) {
    errors.units = 'At least 1 unit is required';
  }
  
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user profile data
 * @param {Object} profileData - User profile data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateUserProfile = (profileData) => {
  const errors = {};
  
  if (!profileData.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!profileData.email || !isValidEmail(profileData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (profileData.bloodType && !isValidBloodType(profileData.bloodType)) {
    errors.bloodType = 'Invalid blood type';
  }
  
  if (profileData.phone && !isValidPhone(profileData.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  if (profileData.dob && !isValidDonorAge(profileData.dob)) {
    errors.dob = 'Donor must be between 18 and 65 years old';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
