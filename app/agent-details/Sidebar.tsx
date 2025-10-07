'use client'

import React, { useMemo } from 'react'
import type { Agent } from './AgentDetailsPage'

type AgentSidebarProps = {
  agents: Agent[]
  selectedAgentIds: string[]
}

export default function AgentSidebar({ agents, selectedAgentIds }: AgentSidebarProps) {
  const visibleAgents = useMemo(() => {
    if (!selectedAgentIds || selectedAgentIds.length === 0) return agents
    const ids = new Set(selectedAgentIds)
    return agents.filter(a => ids.has(a.agent_id.toString()))
  }, [agents, selectedAgentIds])

  const totals = useMemo(() => {
    const totalCalls = visibleAgents.reduce((sum, a) => sum + (a.total_calls || 0), 0)
    const avgAgentRating = visibleAgents.length
      ? visibleAgents.reduce((sum, a) => sum + (a.avg_agent_rating || 0), 0) / visibleAgents.length
      : 0
    const avgSentiment = visibleAgents.length
      ? visibleAgents.reduce((sum, a) => sum + (a.avg_sentiment_rating || 0), 0) / visibleAgents.length
      : 0
    const totalAnomalies = visibleAgents.reduce((sum, a) => sum + (a.total_anomalies || 0), 0)
    return { totalCalls, avgAgentRating, avgSentiment, totalAnomalies }
  }, [visibleAgents])

  return (
    <aside className="w-full bg-white border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agent Summary</h2>
        <span className="text-sm text-gray-600">{visibleAgents.length} selected</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Total Calls</div>
          <div className="text-2xl font-bold">{totals.totalCalls}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Avg Agent Rating</div>
          <div className="text-2xl font-bold">{Number.isInteger(totals.avgAgentRating) ? totals.avgAgentRating : totals.avgAgentRating.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Avg Sentiment</div>
          <div className="text-2xl font-bold">{Number.isInteger(totals.avgSentiment) ? totals.avgSentiment : totals.avgSentiment.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Total Anomalies</div>
          <div className="text-2xl font-bold">{totals.totalAnomalies}</div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Agents</div>
        <ul className="max-h-64 overflow-auto space-y-2">
          {visibleAgents.map(a => (
            <li key={a.agent_id} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">{a.agent_name}</span>
              <span className="text-gray-500">{a.total_calls} calls</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}


