"use client"

import {
  SentimentChart,
  SentimentScoreGauge,
  ActionItemsList,
  SpeakerInsights,
  CallSummaryCard,
  CallCard,
  OSCard,
  ProgressBar,
  SentimentChartNew,
  Dashbordmain,
  AnomalyDetection,
} from "./dashboard/index"
import { useDashboard } from "../context/DashboardContext"
import SentimentScoreCard from "./dashboard/cards/SentimentScoreCard"
import { SentimentScoreChart } from "./dashboard/SentimentScoreGauge"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { decodeJWT } from "@/app/utils/decodeJWT"
import { API_ROUTES } from "../constants/api"
import { fetchWithAuth } from "../utils/axios"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import type React from "react"
import Toast from "./dashboard/Toast"

interface Section {
  id: string
  component: React.ReactElement
  visible: boolean
}

// SortableItem component for each draggable section
const SortableItem = ({
  id,
  children,
  visible,
  onClose,
}: {
  id: string
  children: React.ReactElement
  visible: boolean
  onClose: (id: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!visible) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative transition-shadow"
    >
      <button
        onClick={() => onClose(id)}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 focus:outline-none"
        aria-label={`Close ${id} section`}
      >
        ✕
      </button>
      {children}
    </div>
  )
}

const Dashboard = () => {
  const {
    graphData,
    loading,
    selectedAudio,
    hasProcessed,
    setHasProcessed,
    resetDashboard,
  } = useDashboard()
  const [isToast, setIsToast] = useState(false)
  const formattedResults = Object.entries(graphData?.results ?? {}).map(
    ([key, value]) => ({
      id: key,
      ...(value as Record<string, any>),
    })
  )

  const hasAnyAnomaly = formattedResults.some((item: any) => {
    const ad = item?.anomaly_detection
    return (
      Boolean(ad?.isAnomaly) ||
      (ad?.anomalyCount ?? 0) > 0 ||
      (ad?.reasons?.length ?? 0) > 0
    )
  })

  // FIXED: Use simpler, working condition from old code instead of over-strict validation
  const showAudioInsights = !loading && formattedResults.length > 0
  // const showAudioInsights = !loading && graphData?.sentiment_chunks?.length > 0;
  const showDashboardMain = !loading && !hasProcessed

  const [progress, setProgress] = useState(0)
  const [username, setUsername] = useState<string | null>(null)
  const [useremail, setUseremail] = useState<string | null>(null)
  const [useAccess, setUseAccess] = useState<Record<string, string>>({})
  const [loadinguse, setLoading] = useState(true)

  // FIXED: Use in-memory state instead of localStorage to prevent failures
  const [sections, setSections] = useState<Section[]>([])

  // JWT decoding
  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1]

    if (!token) {
      console.log("No access token found in cookies")
      setLoading(false)
      return
    }

    const decoded = decodeJWT(token)
    if (!decoded) {
      console.log("Failed to decode JWT")
      setLoading(false)
      return
    }

    if (decoded?.name) setUsername(decoded.name)
    if (decoded?.email || decoded?.Email || decoded?.user_email) {
      setUseremail(decoded.email || decoded.Email || decoded.user_email)
    }
  }, [])

  // Fetch user access role
  useEffect(() => {
    const fetchUseaccess = async () => {
      if (!useremail) {
        console.log("Skipping API call: useremail is not yet set")
        setLoading(false)
        return
      }

      const url = `${API_ROUTES.useaccess}?email=${useremail}`
      try {
        const res = await fetchWithAuth(url)
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        const data = await res.json()
        setUseAccess(data)
      } catch (err) {
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict"

        console.error("Failed to fetch user role:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUseaccess()
  }, [useremail])

  // // Progress bar
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (loading) {
      setProgress(10)
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 80 / 60, 99))
      }, 800)
    } else {
      setProgress(0)
    }
    return () => clearInterval(timer!)
  }, [loading])

  // Handle drag end
  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections((prev) => {
      const oldIndex = prev.findIndex((section) => section.id === active.id)
      const newIndex = prev.findIndex((section) => section.id === over.id)
      const newSections = [...prev]
      const [movedSection] = newSections.splice(oldIndex, 1)
      newSections.splice(newIndex, 0, movedSection)
      return newSections
    })
  }

  // Handle section close
  const handleCloseSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, visible: false } : section
      )
    )
  }

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )


  return (
    <>
      <div className="relative z-0 max-w-7xl mx-auto space-y-6 px-4">
        {/* Audio Insights */}
        <div
          className={clsx(
            "transition-opacity duration-300",
            showAudioInsights
              ? "opacity-100 block audio-insights-main"
              : "opacity-0 hidden"
          )}
        >
          {showAudioInsights && (
            <div className="mt-6 pt-4 audio-insights-main flex flex-col gap-6 ">
              {hasAnyAnomaly && (
                <Toast
                  open={isToast}
                  title="Success!"
                  description="Anomaly detected"
                  buttonText="Close"
                  onButtonClick={() => setIsToast(false)}
                />
              )}
              <h1 className="text-2xl font-bold mt-1 pt-6 ot-title">
                Audio Insights
              </h1>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                {formattedResults &&
                  formattedResults.map((graphData: any, index: number) => (
                    <div
                      className="flex flex-col gap-6"
                      key={graphData?.id ?? index}
                    >
                      {/* call-info component */}
                      <div className="flex flex-row gap-6">
                        <CallCard
                          audioId={graphData?.id}
                          customerName={graphData?.Customer_name || ""}
                          agentName=""
                        />
                        <OSCard
                          sentiment={
                            graphData?.sentiment_score?.toString() || "N/A"
                          }
                        />
                        <SentimentScoreCard
                          score={graphData?.sentiment_score ?? 0}
                        />
                        <SentimentScoreGauge
                          sentimentScore={graphData?.sentiment_score ?? 0}
                        />
                      </div>
                      {/* call-summary component */}
                      <CallSummaryCard
                        summary={graphData?.call_summary || ""}
                      />
                      {/* speaker-insights component */}
                      <SpeakerInsights
                        speakerInsights={
                          graphData?.speaker_insights ?? {
                            Customer: "",
                            Agent: "",
                          }
                        }
                        agentRating={graphData?.Agent_rating ?? 0}
                        role={useAccess.role || ""}
                        customerName={graphData?.Customer_name || ""}
                      />
                      {/* sentiment-chart component */}
                      <div className="flex flex-col gap-6 p-12 rounded-xl shadow-sm from-indigo-50 to-blue-50 bg-white">
                        <div>
                          <h2 className="ot-title font-semibold text-xl">
                            Call Sentiment Over Time
                          </h2>
                          <p className="text-base osubtitle">
                            This chart shows the sentiment score over time based
                            on the audio file(s) selected.
                          </p>
                        </div>
                        <SentimentChartNew data={graphData?.sentiment_chunks} />
                      </div>
                      {/* sentiment-score-chart component */}
                      <SentimentScoreChart
                        sentimentScore={graphData?.sentiment_score ?? 0}
                      />
                      {/* action-items component */}
                      <ActionItemsList
                        actionItems={graphData?.action_items ?? []}
                        emailSent={graphData?.email_sent ?? []}
                        audioId={graphData?.id}
                        sentimentScore={graphData?.sentiment_score ?? 0}
                        incidentNumber={graphData?.inc_number || ""}
                      />
                      {/* anomaly-detection component */}
                      {(() => {
                        const isAnomaly =
                          graphData?.anomaly_detection?.isAnomaly ?? false
                        const anomalyCount =
                          graphData?.anomaly_detection?.anomalyCount ?? 0
                        const reasons =
                          graphData?.anomaly_detection?.reasons ?? []
                        const hasAnomaly =
                          Boolean(isAnomaly) || anomalyCount > 0 || reasons.length > 0
                        if (!hasAnomaly) return null
                        return (
                          <AnomalyDetection
                            isAnomaly={isAnomaly}
                            anomalyCount={anomalyCount}
                            reasons={reasons}
                            setToast={setIsToast}
                          />
                        )
                      })()}
                    </div>
                  ))}
              </DndContext>

              <div className="text-center">
                <button
                  onClick={() => resetDashboard()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Process New Audio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboardmain */}
        <div
          className={clsx(
            "transition-opacity duration-300",
            showDashboardMain
              ? "opacity-100 block Dashbordmain-main"
              : "opacity-0 hidden"
          )}
        >
          {showDashboardMain && <Dashbordmain setProgress={setProgress} />}
        </div>

        {/* Loading message */}
        {loading && (
          <div className="mt-4 text-sm text-gray-500">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* FIXED: Use simpler fallback condition that works */}
        {!loading &&
          hasProcessed &&
          (!graphData || graphData?.sentiment_chunks?.length === 0) && (
            <div className="text-center">
              <p className="mt-4 text-sm text-red-500">
                No data available. Please try processing another audio file.
              </p>
              <button
                onClick={() => resetDashboard()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Process New Audio
              </button>
            </div>
          )}
      </div>
    </>
  )
}

export default Dashboard
