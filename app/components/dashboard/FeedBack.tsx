"use client"

import { useState, useEffect } from 'react';

type FeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
  incidentNum: string
  onSubmitSuccess: () => void
}

interface IncidentResponse {
  incident_number: string;
  valid: boolean;
}

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  incidentNum, 
  onSubmitSuccess 
}: FeedbackModalProps) {
  const [selectedRating, setSelectedRating] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIncidentValid, setIsIncidentValid] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [incidentError, setIncidentError] = useState<string | null>(null)
  const [editableIncidentNum, setEditableIncidentNum] = useState(incidentNum)

  const ratings = [
    { value: 'Excellent', color: '#22c55e', label: 'Excellent' },
    { value: 'Good', color: '#84cc16', label: 'Good' },
    { value: 'Medium', color: '#f97316', label: 'Medium' },
    { value: 'Poor', color: '#ef4444', label: 'Poor' }
  ]

  // Reset form when modal opens/closes or incidentNum changes
  useEffect(() => {
    if (isOpen) {
      setEditableIncidentNum(incidentNum)
      setIsIncidentValid(null)
      setIncidentError(null)
      setSelectedRating('')
      setFeedback('')
      setError(null)
      
      // Auto-validate if incident number is provided
      if (incidentNum) {
        validateIncidentNumber(incidentNum);
      }
    }
  }, [isOpen, incidentNum])

  const validateIncidentNumber = async (incNumber: string): Promise<void> => {
    if (!incNumber.trim()) {
      setIncidentError("Please enter an incident number.");
      setIsIncidentValid(false);
      return;
    }

    setIsValidating(true);
    setIncidentError(null);

    try {
      const res = await fetch(
        `https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/check-incidient-number?inc_number=${encodeURIComponent(
          incNumber
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      const data: IncidentResponse = await res.json();

      if (res.ok && data.incident_number === incNumber) {
        setIsIncidentValid(data.valid);
        if (!data.valid) {
          setIncidentError("Please enter a valid Incident Number.");
        }
      } else {
        setIsIncidentValid(false);
        setIncidentError("Please enter a valid Incident Number.");
      }
    } catch (err) {
      setIsIncidentValid(false);
      setIncidentError("Error validating incident number. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleIncidentChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setEditableIncidentNum(value);
    setIsIncidentValid(null);
    setIncidentError(null);
    setError(null);
  };

  const handleIncidentBlur = (): void => {
    if (editableIncidentNum.trim()) {
      validateIncidentNumber(editableIncidentNum.trim());
    } else {
      setIncidentError("Please enter an incident number.");
      setIsIncidentValid(false);
    }
  };

  const handleSubmit = async () => {
    // Validate incident number first
    if (!editableIncidentNum.trim()) {
      setIncidentError("Please enter an incident number.");
      setIsIncidentValid(false);
      return;
    }

    if (isIncidentValid === false) {
      setError('Please ensure the incident number is valid before submitting feedback');
      return;
    }

    if (!selectedRating) {
      setError('Please select a rating')
      return;
    }

    // Re-validate incident number if not already validated
    if (isIncidentValid === null) {
      await validateIncidentNumber(editableIncidentNum.trim());
      if (isIncidentValid === false) {
        setError('Please ensure the incident number is valid before submitting feedback');
        return;
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new URLSearchParams()
      formData.append('incident_number', editableIncidentNum.trim())
      formData.append('rate', selectedRating.toLowerCase())
      formData.append('feedback', feedback || '')

      const response = await fetch(
        'https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/submit-feedback-servicenow',
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      // Call success callback and close modal
      onSubmitSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEmojiForRating = (value: string) => {
    switch(value) {
      case 'Excellent': return '😊'
      case 'Good': return '🙂'
      case 'Medium': return '😐'
      case 'Poor': return '☹️'
      default: return '😊'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="p-6">
          {/* Header with title and close button side by side */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Feedback Survey</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Editable Incident Number Field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 text-xs">
              Incident Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={editableIncidentNum}
                onChange={handleIncidentChange}
                onBlur={handleIncidentBlur}
                placeholder="Enter Incident Number"
                className={`w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm ${
                  isIncidentValid === false
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : isIncidentValid === true
                    ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                disabled={isSubmitting}
              />
              {isValidating && (
                <div className="absolute right-2 top-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {isIncidentValid === true && !isValidating && (
                <div className="absolute right-2 top-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {isIncidentValid === false && !isValidating && (
                <div className="absolute right-2 top-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Incident Error Message */}
            {incidentError && (
              <div className="mt-1 bg-red-50 border border-red-200 rounded-lg p-2 text-left">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-xs">{incidentError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rating Section */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 text-xs">
              How was your experience? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ratings.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => setSelectedRating(rating.value)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-200 ${
                    selectedRating === rating.value
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    borderColor: selectedRating === rating.value ? rating.color : undefined
                  }}
                >
                  <span className="text-xl mb-1">{getEmojiForRating(rating.value)}</span>
                  <span 
                    className="text-xs font-medium"
                    style={{
                      color: selectedRating === rating.value ? rating.color : '#6b7280'
                    }}
                  >
                    {rating.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Feedback */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 text-xs">
              Additional Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50 text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRating || isIncidentValid === false || !editableIncidentNum.trim()}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:hover:shadow-md text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}