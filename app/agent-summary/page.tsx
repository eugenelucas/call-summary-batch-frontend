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

  useEffect(() => {
    if (canFetch) {
      fetchAgents()
    }
  }, [canFetch, fetchAgents])

  return (
    <div className="hidden-1 ot-dashbord-main-container pt-8">
      <div className="ot-min-h-screen flex items-top justify-center mt-12">
         {/* {!showFilters && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-2 text-blue-600 hover:text-blue-800"
            >
              Change Filters
            </button>
          </div>
        )} */}
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
       
        {!showFilters && agents.length > 0 && !selectedAgentForDetails && (
          <AgentTable agents={agents} onViewDetails={handleViewDetails} />
        )}
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