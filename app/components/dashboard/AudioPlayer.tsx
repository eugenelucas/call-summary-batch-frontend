"use client"

import React, { useRef, useState, useEffect } from "react"
import { Mic } from "lucide-react"

interface AudioPlayerProps {
  src: string
  fileName?: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, fileName }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !src) {
      setLoading(false)
      return
    }

    // Reset state
    setLoading(true)
    setError(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    const onLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
        setLoading(false)
      }
    }
    
    const onTimeUpdate = () => {
      if (audio.currentTime !== undefined) {
        setCurrentTime(audio.currentTime)
      }
    }
    
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    const onError = () => {
      console.error("Audio loading error:", audio.error)
      setError(true)
      setLoading(false)
    }

    const onCanPlay = () => {
      setLoading(false)
    }

    const onLoadStart = () => {
      setLoading(true)
    }

    audio.addEventListener("loadedmetadata", onLoaded)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("loadstart", onLoadStart)

    // Load the audio
    audio.load()

    return () => {
      // Pause and cleanup
      audio.pause()
      audio.removeEventListener("loadedmetadata", onLoaded)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("loadstart", onLoadStart)
    }
  }, [src])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || loading || error || !src) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        // Reset if at the end
        if (audio.ended) {
          audio.currentTime = 0
        }
        await audio.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error("Playback error:", err)
      setError(true)
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    const audio = audioRef.current
    if (audio && !isNaN(time)) {
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const extractFileName = (url: string) => {
    if (!url) return "Unknown"
    // Extract the filename before query parameters from Azure URL
    const urlPath = url.split("?")[0]
    const parts = urlPath.split("/")
    return decodeURIComponent(parts[parts.length - 1])
  }

  const formatTime = (t: number) =>
    isNaN(t) || !isFinite(t) ? "00:00" : new Date(t * 1000).toISOString().substring(14, 19)

  const displayFileName = fileName || extractFileName(src)

  return (
    <div className="w-[225px] p-3 rounded-xl border border-gray-200 shadow-sm bg-white dashbord-main-audio-not">
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata"
        crossOrigin="anonymous"
      />

      <div className="flex items-center space-x-2 px-2 py-2 rounded-xl border border-gray-100 shadow-inner bg-gray-50">
        <div className="text-blue-600 text-lg">
          <Mic />
        </div>
        <div className="truncate text-sm font-semibold text-gray-700 max-w-xs" title={displayFileName}>
          {displayFileName}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-500 text-center">
          Failed to load audio
        </div>
      )}

      <div className="flex items-center mt-3 space-x-2">
        <button
          onClick={togglePlay}
          disabled={loading || error || !src}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
            loading || error || !src
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
          }`}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
              <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112C96 85.5 74.5 64 48 64zm224 0c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112c0-26.5-21.5-48-48-48z" />
            </svg>
          ) : (
            <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
              <path d="M96 64.14v383.72C96 470.52 131.6 488.7 158.6 469.3l181.5-143.7c20.8-16.5 20.8-49.3 0-65.8L158.6 116.1C131.6 96.7 96 114.9 96 148.1z" />
            </svg>
          )}
        </button>

        <div className="h-8 bg-white flex items-center justify-center">
          <div className="flex items-end gap-[2px]">
            {Array.from({ length: 30 }).map((_, i) => {
              const height = Math.random() * 10 + 4
              return (
                <div
                  key={i}
                  className="w-[2px] bg-blue-400 rounded-sm"
                  style={{ height }}
                />
              )
            })}
          </div>

          <span className="ml-1 text-xs text-gray-600">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-gray-400 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        step={0.1}
        onChange={handleSeek}
        disabled={loading || error || !src || !duration}
        className="w-full mt-1 accent-blue-500 disabled:opacity-50 cursor-pointer"
      />
    </div>
  )
}

export default AudioPlayer