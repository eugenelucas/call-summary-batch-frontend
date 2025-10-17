// page.tsx
"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import AgentFilterForm from "./card/AgentFilterForm"
import AgentTable from "./card/AgentTable" // Import the new table component
import AgentDetailsView from "./card/AgentDetailsView" // Import the details view component
import { Agent } from "./types" // Adjust the import path if needed

function formatForApi(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return ""
  const normalized = datetimeLocalValue.replace("T", " ")
  return /:\d{2}$/.test(normalized) ? normalized : `${normalized}:00`
}

export default function AgentSummaryPage() {
  const [start, setStart] = useState<string>("")
  const [end, setEnd] = useState<string>("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(true)
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null)

  const canFetch = useMemo(() => Boolean(start && end), [start, end])

  const fetchAgents = useCallback(async () => {
    if (!canFetch) return
    setLoading(true)
    try {
      const startParam = encodeURIComponent(formatForApi(start))
      const endParam = encodeURIComponent(formatForApi(end))
      const url = `https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/agent_statistics?start_datetime=${startParam}&end_datetime=${endParam}`
      const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" })
      if (!response.ok) {
        setAgents([])
        return
      }
      const data: Agent[] = await response.json()
      const list = Array.isArray(data) ? data : []
      setAgents(list)
      if (list.length >= 0) {
        setShowFilters(false)
      }
    } catch (e) {
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [start, end, canFetch])

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgentForDetails(agent)
  }

  const handleBack = () => {
    setSelectedAgentForDetails(null)
  }

  const handleBackToFilters = () => {
    setSelectedAgentForDetails(null)
    setAgents([])
    setShowFilters(true)
  }

  useEffect(() => {
    if (canFetch) {
      fetchAgents()
    }
  }, [canFetch, fetchAgents])

  return (
    <div className="hidden-1 ot-dashbord-main-container pt-8">
      <div className="ot-min-h-screen flex items-top justify-center mt-12 items-center">
        <div>
          {showFilters && (
            <AgentFilterForm
              start={start}
              setStart={setStart}
              end={end}
              setEnd={setEnd}
              fetchAgents={fetchAgents}
              canFetch={canFetch}
              loading={loading}
            />
          )}
        </div>
        <div>
        {!showFilters && !selectedAgentForDetails && (
            <div className="mb-2  w-full max-w-7xl">
              <button
                onClick={handleBackToFilters}
                className="flex items-center gap-2 mb-4 px-4 py-2 text-blue-600 rounded"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.18131 5.68546L5.12734 8.9011C5.36542 9.18211 5.33092 9.60317 5.05027 9.84156C4.76962 10.0799 4.3491 10.0454 4.11102 9.7644L0.193359 5.4882C0.137024 5.43153 0.0913745 5.36513 0.0586068 5.29221C0.0178584 5.20157 -0.00210677 5.10295 0.000175844 5.00357L0.00018562 5.00295C0.00245399 4.9038 0.0267135 4.80639 0.071208 4.71778C0.0755347 4.7092 0.0800457 4.70071 0.0847379 4.69233C0.11189 4.64368 0.145072 4.59867 0.183495 4.55835L4.20532 0.213664C4.4555 -0.0566061 4.87713 -0.0726201 5.14705 0.177878C5.41696 0.428375 5.43296 0.850553 5.18279 1.12081L2.19266 4.35098H9.33361C9.70165 4.35098 10 4.64972 10 5.01822C10 5.38673 9.70165 5.68547 9.33361 5.68547H2.18131V5.68546Z" fill="url(#paint0_linear_3656_10002)" />
                  <defs>
                    <linearGradient id="paint0_linear_3656_10002" x1="1.24996" y1="0.958503" x2="9.70977" y2="9.36583" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2E6DCC" />
                      <stop offset="1" stopColor="#4938CF" />
                    </linearGradient>
                  </defs>
                </svg>
                Back
              </button>
            </div>
          )}
          {!showFilters && agents.length > 0 && !selectedAgentForDetails && (
            <AgentTable agents={agents} onViewDetails={handleViewDetails} />
          )}
        </div>
        {!showFilters && agents.length === 0 && !loading && !selectedAgentForDetails && (
          <div className="py-8 text-center text-gray-500">No data for selected range.</div>
        )}
        {selectedAgentForDetails && (
          <AgentDetailsView agent={selectedAgentForDetails} onBack={handleBack} />
        )}
      </div>
    </div>
  )
}