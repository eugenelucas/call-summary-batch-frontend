import EmailSentTags from "./EmailSentTags"
import FeedbackModal from "./FeedBack"
import Image from 'next/image';
import { API_ROUTES } from "../../constants/api"
import { fetchWithAuth } from "../../utils/axios"
import { useState, useEffect } from "react"

type ActionItem = {
  task: string
}

type Props = {
  actionItems: ActionItem[]
  emailSent: string[]
  audioId: string
  sentimentScore?: number
  incidentNumber?: string // Add this line
}

export default function ActionItemsList({ 
  actionItems, 
  emailSent, 
  audioId, 
  sentimentScore,
  incidentNumber = "" // Add this with default value
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false)

  // Check sessionStorage on component mount to maintain button state
  useEffect(() => {
    const hasUploaded = sessionStorage.getItem(`reportUploaded_${audioId}`)
    const hasSurveySubmitted = sessionStorage.getItem(`surveySubmitted_${audioId}`)
    
    if (hasUploaded === 'true') {
      setIsButtonDisabled(true)
      setSuccessMessage('Report successfully uploaded')
    }
    
    if (hasSurveySubmitted === 'true') {
      setIsSurveySubmitted(true)
    }
  }, [audioId])

  const handleUploadReport = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const url = audioId 
        ? `${API_ROUTES.downloadReport}?filename=${audioId}`
        : API_ROUTES.downloadReport;

      const response = await fetchWithAuth(url, {
        method: 'GET',
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload report');
      }

      const serviceNowResult = response.headers.get('x-servicenow-upload-result');
      if (serviceNowResult) {
        const result = JSON.parse(serviceNowResult);
        if (result.error) {
          throw new Error(result.error);
        }
      }

      setSuccessMessage('Report successfully uploaded');
      setIsButtonDisabled(true)
      sessionStorage.setItem(`reportUploaded_${audioId}`, 'true')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while uploading the report';
      setError(errorMessage);
      console.error('Upload error:', err);
      if (errorMessage.includes('token error')) {
        console.error('Token error details: Check if the access token is valid, not expired, and correctly formatted in the Authorization header.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitSurvey = () => {
    setIsFeedbackModalOpen(true)
  }

  const handleFeedbackSuccess = () => {
    setIsSurveySubmitted(true)
    sessionStorage.setItem(`surveySubmitted_${audioId}`, 'true')
    setSuccessMessage('Survey submitted successfully')
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-4 gap-6 items-stretch">
        <div className="w-[65%] p-12 rounded-2xl boxshadow bg-white">
          <div className="flex items-baseline mb-2">
            <h2 className="text-xl font-semibold mb-4 ot-title">Action Items</h2>
          </div>
          <ul className="space-y-3">
            {actionItems.map((item, idx) => (
              <li key={idx} className="flex items-center justify-left gap-3 border-o2 p-4 rounded-md">
                <Image
                  src="/checkbox.svg"
                  alt="Check"
                  width={18}
                  height={18}
                />
                <span className="text-base osubtitle">{item.task}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-4 flex-wrap">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
              onClick={handleUploadReport}
              disabled={isLoading || isButtonDisabled}
            >
              {isLoading ? 'Uploading...' : 'Upload Report'}
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
              onClick={handleSubmitSurvey}
              disabled={isSurveySubmitted}
            >
              {isSurveySubmitted ? 'Survey Submitted' : 'Submit Survey'}
            </button>
          </div>
          
          {isLoading && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full animate-progress"
                style={{
                  animation: 'progress 3.5s ease-in-out infinite',
                }}
              ></div>
            </div>
          )}
          
          {successMessage && (
            <p className="mt-2 text-sm text-green-500">{successMessage}</p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
        
        <div className="w-[35%] rounded-2xl boxshadow bg-white emailactivatbg emailBoder">
          <EmailSentTags emailSent={emailSent} sentimentScore={sentimentScore}/>
        </div>
      </div>
      
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        incidentNum={incidentNumber}
        onSubmitSuccess={handleFeedbackSuccess}
      />
      
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            transform: translateX(0);
          }
          50% {
            width: 100%;
            transform: translateX(0);
          }
          100% {
            width: 0%;
            transform: translateX(100%);
          }
        }
        .animate-progress {
          width: 50%;
          transform-origin: left;
        }
      `}</style>
    </div>
  )
}