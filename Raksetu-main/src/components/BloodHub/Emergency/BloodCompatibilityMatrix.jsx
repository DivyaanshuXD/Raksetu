/**
 * BloodCompatibilityMatrix Component
 * Visual matrix showing blood type donation compatibility
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Check, X, Droplet } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'];

// Compatibility rules: recipient -> compatible donors
const COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

const BloodCompatibilityMatrix = ({ userBloodType, recipientBloodType, variant = 'full' }) => {
  const canDonate = userBloodType && recipientBloodType && 
    COMPATIBILITY[recipientBloodType]?.includes(userBloodType);

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet size={18} className="text-red-500" />
            <h4 className="font-semibold text-gray-800">Blood Compatibility</h4>
          </div>
          <div className={`p-2 rounded-full ${canDonate ? 'bg-green-100' : 'bg-red-100'}`}>
            {canDonate ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <X size={16} className="text-red-600" />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Your Type</div>
            <div className="text-2xl font-bold text-red-600">{userBloodType || '?'}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Needed Type</div>
            <div className="text-2xl font-bold text-red-600">{recipientBloodType}</div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-white rounded-lg">
          <p className="text-sm text-gray-700">
            {canDonate ? (
              <span className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                <span><strong className="text-green-700">Compatible!</strong> You can donate to {recipientBloodType}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <X size={14} className="text-red-600" />
                <span><strong className="text-red-700">Not compatible.</strong> {userBloodType} cannot donate to {recipientBloodType}</span>
              </span>
            )}
          </p>
        </div>

        {/* Quick reference */}
        <div className="mt-3 p-3 bg-white rounded-lg">
          <div className="text-xs text-gray-500 mb-2">Compatible Donors for {recipientBloodType}:</div>
          <div className="flex flex-wrap gap-2">
            {COMPATIBILITY[recipientBloodType]?.map(type => (
              <span 
                key={type}
                className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  type === userBloodType 
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full matrix view
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-red-100 rounded-lg">
          <Droplet size={24} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Blood Type Compatibility Chart</h3>
          <p className="text-sm text-gray-500">Who can donate to whom</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Compatible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Not Compatible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span className="text-gray-600">Your Type</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-2 text-left text-gray-600 font-semibold">Donor →<br/>Recipient ↓</th>
              {BLOOD_TYPES.map(type => (
                <th 
                  key={type} 
                  className={`p-2 text-center font-bold ${
                    type === userBloodType ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOD_TYPES.map(recipient => {
              const isRecipientRow = recipient === recipientBloodType;
              return (
                <tr 
                  key={recipient}
                  className={`border-b border-gray-100 ${
                    isRecipientRow ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className={`p-2 font-bold ${
                    isRecipientRow ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {recipient}
                    {isRecipientRow && <span className="ml-2 text-xs text-yellow-600">(Needed)</span>}
                  </td>
                  {BLOOD_TYPES.map(donor => {
                    const compatible = COMPATIBILITY[recipient]?.includes(donor);
                    const isUserCell = donor === userBloodType;
                    const isHighlighted = isUserCell && isRecipientRow;
                    
                    return (
                      <td 
                        key={`${recipient}-${donor}`}
                        className={`p-2 text-center ${
                          compatible ? 'bg-green-50' : 'bg-red-50'
                        } ${isUserCell ? 'ring-2 ring-inset ring-blue-500' : ''}
                        ${isHighlighted ? 'ring-4 ring-yellow-400' : ''}`}
                      >
                        {compatible ? (
                          <Check size={16} className="inline text-green-600" />
                        ) : (
                          <X size={16} className="inline text-red-400" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status message */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          {canDonate ? (
            <span className="flex items-center gap-2">
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>
                <strong className="text-green-700">You're a compatible donor!</strong> 
                <br/>
                Your {userBloodType} blood can be donated to {recipientBloodType} recipients.
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <X size={18} className="text-red-600 flex-shrink-0" />
              <span>
                <strong className="text-red-700">Not compatible for this request.</strong>
                <br/>
                {userBloodType} cannot donate to {recipientBloodType}. Compatible donors: {COMPATIBILITY[recipientBloodType]?.join(', ')}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Fun facts */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>Did you know?</strong> O- is the universal donor (can donate to all), 
          while AB+ is the universal recipient (can receive from all).
        </p>
      </div>
    </div>
  );
};

BloodCompatibilityMatrix.propTypes = {
  userBloodType: PropTypes.string,
  recipientBloodType: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['compact', 'full'])
};

export default BloodCompatibilityMatrix;
