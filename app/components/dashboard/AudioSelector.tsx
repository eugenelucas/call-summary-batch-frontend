"use client"

import { useEffect, useState } from "react"
import { API_ROUTES } from "../../constants/api"
import AudioPlayer from "./AudioPlayer"
import { fetchWithAuth } from "../../utils/axios"
import { X } from "lucide-react"

type Props = {
  selectedAudio: string[] | null
  setSelectedAudio: (filenames: string[]) => void
  clearGraphData: () => void
}

export default function AudioSelector({
  selectedAudio,
  setSelectedAudio,
  clearGraphData,
}: Props) {
  const [audioMap, setAudioMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {

    const fetchAudioFiles = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.audioFiles)
        const data = await res.json()
        setAudioMap(data)
      } catch (err) {
        console.error("Failed to load audio files:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAudioFiles()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.audio-selector-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleFileToggle = (filename: string) => {
    const currentSelection = selectedAudio || []
    const isSelected = currentSelection.includes(filename)
    
    let newSelection: string[]
    if (isSelected) {
      newSelection = currentSelection.filter(f => f !== filename)
    } else {
      newSelection = [...currentSelection, filename]
    }
    
    setSelectedAudio(newSelection)
    clearGraphData()
  }

  const removeFile = (filename: string) => {
    const currentSelection = selectedAudio || []
    const newSelection = currentSelection.filter(f => f !== filename)
    setSelectedAudio(newSelection)
    clearGraphData()
  }

  const clearAll = () => {
    setSelectedAudio([])
    clearGraphData()
  }

  if (loading) {
    return <p>Loading audio files...</p>
  }

  const audioFiles = Object.keys(audioMap)
  const selectedFiles = selectedAudio || []

  return (
    <>
      <div className="relative">
        {selectedFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Selected Files ({selectedFiles.length})
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((filename) => (
                <div
                  key={filename}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <span className="truncate max-w-[150px]">{filename}</span>
                  <button
                    onClick={() => removeFile(filename)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dropdown selector */}
        <div className="relative audio-selector-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-[45px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white hover:border-gray-400 transition-colors"
          >
            <span className={selectedFiles.length === 0 ? "text-gray-500" : "text-gray-900"}>
              {selectedFiles.length === 0 
                ? "Select audio files..." 
                : `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
              }
            </span>
          </button>
          
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <svg 
              width="12" 
              height="7" 
              viewBox="0 0 12 7" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path 
                d="M1.10378 1.09419L5.82044 6.00739L10.5371 1.09419" 
                stroke="#34334B" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
              <div className="p-2 border-b border-gray-200">
                <button
                  onClick={() => {
                    if (selectedFiles.length === audioFiles.length) {
                      setSelectedAudio([])
                    } else {
                      setSelectedAudio(audioFiles)
                    }
                    clearGraphData()
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedFiles.length === audioFiles.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {audioFiles.map((filename) => {
                const isSelected = selectedFiles.includes(filename)
                return (
                  <div
                    key={filename}
                    onClick={() => handleFileToggle(filename)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className={`truncate text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
                      {filename}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0 ml-2">
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
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
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Audio players for selected files */}
      <div className="dashbord-miannot space-y-3">
        {selectedFiles.map((filename) => {
          const audioUrl = audioMap[filename] 
            ? "/" + audioMap[filename].replace(/\\/g, "/")
            : ""
          return (
            <div key={filename} className="border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2 truncate">
                {filename}
              </div>
              <AudioPlayer src={audioUrl} />
            </div>
          )
        })}
      </div>
    </>
  )
}