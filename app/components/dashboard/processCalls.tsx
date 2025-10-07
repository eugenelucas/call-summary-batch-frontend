"use client"

import React, { useState, useEffect } from "react"
import { API_ROUTES } from "../../constants/api"
import { fetchWithAuth } from "../../utils/axios"
import { X } from "lucide-react"

interface CallResult {
  call_summary: string
  sentiment: string
  sentiment_score: number
  call_purpose: string
  speaker_insights: {
    Customer: string
    Agent: string
  }
  email_sent: string[]
  action_items: { task: string }[]
  Agent_rating: number
  Customer_name: string
  Agent_name: string
  sentiment_chunks: { time_sec: number; text: string; sentiment: string }[]
  call_outs: { time_sec: number; label: string; description: string }[]
  anomaly_detection: { isAnomaly: boolean; reason: string }
}

interface ApiResponse {
  results: Record<string, CallResult>
}

const CallProcessor: React.FC = () => {
  const [audioMap, setAudioMap] = useState<Record<string, string>>({})
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [filenames, setFilenames] = useState<string>("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    summary: true,
    sentiment: true,
    purpose: true,
    speakerInsights: true,
    actionItems: true,
    emailSent: true,
    agentRating: true,
    names: true,
    sentimentChunks: false,
    callOuts: false,
    anomalyDetection: true,
  })

  // Fetch models and set mock audio files on component mount
  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.audioFiles)
        const data = await res.json()
        setAudioMap(data)
      } catch (err) {
        console.error("Failed to load audio files:", err)
        setError("Failed to fetch audio files")
      }
    }

    const fetchModels = async () => {
      try {
        const response = await fetch(
          "https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/models",
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        )
        const data: string[] = await response.json()
        setModels(data)
        if (data.length > 0) {
          setSelectedModel(data[0]) // Default to first model
        }
      } catch (err) {
        console.error("Failed to load models:", err)
        setError("Failed to fetch models")
      }
    }

    Promise.all([fetchAudioFiles(), fetchModels()]).finally(() =>
      setIsLoading(false)
    )
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".audio-selector-dropdown")) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle file selection from dropdown
  const handleFileSelect = (filename: string) => {
    setFilenames(filename) // Replace with the selected filename
    setIsDropdownOpen(false)
  }

  // Clear the selected filename
  const clearFile = () => {
    setFilenames("")
  }

  // Handle form submission to process calls
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)
    setResponse(null)

    if (!filenames.trim()) {
      setError("Please select or enter a filename")
      setIsProcessing(false)
      return
    }

    // Create payload with filenames as a string
    const payload = {
      filenames: [filenames.trim()],
      model_option: selectedModel,
    }

    console.log("Payload being sent:", JSON.stringify(payload))

    try {
      const response = await fetch(
        "https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/process-calls",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        )
      }

      const data: ApiResponse = await response.json()
      setResponse(data)
    } catch (err) {
      setError("Failed to process call")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle section visibility
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (isLoading) {
    return <p>Loading audio files and models...</p>
  }

  const audioFiles = Object.keys(audioMap)

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Call Processor</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Select Model
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={models.length === 0}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          {filenames && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Selected File
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  <span className="truncate max-w-[150px]">{filenames}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative audio-selector-dropdown">
            <label
              htmlFor="filenames"
              className="block text-sm font-medium text-gray-700"
            >
              Filename
            </label>
            <input
              id="filenames"
              type="text"
              value={filenames}
              onChange={(e) => setFilenames(e.target.value)}
              placeholder="e.g., file1.mp3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-2 top-8 px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              <svg
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M1.10378 1.09419L5.82044 6.00739L10.5371 1.09419"
                  stroke="#34334B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                {audioFiles.map((filename) => (
                  <div
                    key={filename}
                    onClick={() => handleFileSelect(filename)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                      filenames === filename ? "bg-blue-50" : ""
                    }`}
                  >
                    <span
                      className={`truncate text-sm ${
                        filenames === filename
                          ? "text-blue-700 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {filename}
                    </span>
                    {filenames === filename && (
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0 ml-2">
                        <svg
                          width="12"
                          height="9"
                          viewBox="0 0 12 9"
                          fill="none"
                        >
                          <path
                            d="M1 4.5L4 7.5L11 0.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !selectedModel || !filenames.trim()}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isProcessing ? "Processing..." : "Process Call"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 space-y-4">
          {Object.entries(response.results).map(([filename, result]) => (
            <div
              key={filename}
              className="bg-green-100 p-4 rounded-md text-green-700"
            >
              <h2 className="text-lg font-bold mb-2">Results for {filename}</h2>

              {/* Call Summary */}
              <div>
                <button
                  onClick={() => toggleSection("summary")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Call Summary
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.summary ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.summary && (
                  <p className="mt-2 text-sm">{result.call_summary}</p>
                )}
              </div>

              {/* Sentiment */}
              <div>
                <button
                  onClick={() => toggleSection("sentiment")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Sentiment
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.sentiment ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.sentiment && (
                  <div className="mt-2 text-sm">
                    <p>{result.sentiment}</p>
                    <p>
                      <strong>Score:</strong> {result.sentiment_score}/10
                    </p>
                  </div>
                )}
              </div>

              {/* Call Purpose */}
              <div>
                <button
                  onClick={() => toggleSection("purpose")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Call Purpose
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.purpose ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.purpose && (
                  <p className="mt-2 text-sm">{result.call_purpose}</p>
                )}
              </div>

              {/* Speaker Insights */}
              <div>
                <button
                  onClick={() => toggleSection("speakerInsights")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Speaker Insights
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.speakerInsights ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.speakerInsights && (
                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Customer ({result.Customer_name}):</strong>{" "}
                      {result.speaker_insights.Customer}
                    </p>
                    <p>
                      <strong>Agent ({result.Agent_name}):</strong>{" "}
                      {result.speaker_insights.Agent}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div>
                <button
                  onClick={() => toggleSection("actionItems")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Action Items
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.actionItems ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.actionItems && (
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {result.action_items.map((item, index) => (
                      <li key={index}>{item.task}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Email Sent */}
              <div>
                <button
                  onClick={() => toggleSection("emailSent")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Email Sent
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.emailSent ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.emailSent && (
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {result.email_sent.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Agent Rating */}
              <div>
                <button
                  onClick={() => toggleSection("agentRating")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Agent Rating
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.agentRating ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.agentRating && (
                  <p className="mt-2 text-sm">{result.Agent_rating}/10</p>
                )}
              </div>

              {/* Names */}
              <div>
                <button
                  onClick={() => toggleSection("names")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Names
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.names ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.names && (
                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Customer:</strong> {result.Customer_name}
                    </p>
                    <p>
                      <strong>Agent:</strong> {result.Agent_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Sentiment Chunks */}
              <div>
                <button
                  onClick={() => toggleSection("sentimentChunks")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Sentiment Chunks
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.sentimentChunks ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.sentimentChunks && (
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {result.sentiment_chunks.map((chunk, index) => (
                      <li key={index}>
                        <strong>{chunk.time_sec}s:</strong> &quot;{chunk.text}
                        &quot; ({chunk.sentiment})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Call Outs */}
              <div>
                <button
                  onClick={() => toggleSection("callOuts")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Call Outs
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.callOuts ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.callOuts && (
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {result.call_outs.map((callOut, index) => (
                      <li key={index}>
                        <strong>
                          {callOut.time_sec}s - {callOut.label}:
                        </strong>{" "}
                        {callOut.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Anomaly Detection */}
              <div>
                <button
                  onClick={() => toggleSection("anomalyDetection")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-700"
                >
                  Anomaly Detection
                  <svg
                    className={`w-4 h-4 transform ${
                      expandedSections.anomalyDetection ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedSections.anomalyDetection && (
                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Anomaly Detected:</strong>{" "}
                      {result.anomaly_detection.isAnomaly ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Reason:</strong> {result.anomaly_detection.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CallProcessor
