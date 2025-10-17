// AgentTable.tsx
import { Agent } from "./../types" // Adjust the import path if needed

interface AgentTableProps {
  agents: Agent[]
  onViewDetails?: (agent: Agent) => void
}

export default function AgentTable({ agents, onViewDetails }: AgentTableProps) {
  return (
    <div className="overflow-x-auto w-[100%] mt-2 max-w-7xl min-h-[800px]">
      <table className="bg-white border border-gray-200 min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Agent Name</th>
            <th className="py-2 px-4 border-b text-left">Total Number of Calls</th>
            <th className="py-2 px-4 border-b text-left">Average Call Sentiment</th>
            <th className="py-2 px-4 border-b text-left">Average Rating of Agent</th>
            <th className="py-2 px-4 border-b text-left">Average Duration (s)</th>
            <th className="py-2 px-4 border-b text-left">Anomalies Detected</th>
            {/* <th className="py-2 px-4 border-b text-left">Detected Files</th> */}
            <th className="py-2 px-4 border-b text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.agent_id}>
              <td className="py-2 px-4 border-b">{agent.agent_name}</td>
              <td className="py-2 px-4 border-b">{agent.total_calls}</td>
              <td className="py-2 px-4 border-b">
                {Number.isInteger(agent.avg_sentiment_rating)
                  ? agent.avg_sentiment_rating
                  : agent.avg_sentiment_rating.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b">
                {Number.isInteger(agent.avg_agent_rating)
                  ? agent.avg_agent_rating
                  : agent.avg_agent_rating.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b">
                {Number.isInteger(agent.avg_duration_seconds)
                  ? agent.avg_duration_seconds
                  : agent.avg_duration_seconds.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b">{agent.total_anomalies}</td>
              {/* <td className="py-2 px-4 border-b">
                {agent.detected_audiofiles && agent.detected_audiofiles.length
                  ? agent.detected_audiofiles.join(", ")
                  : "-"}
              </td> */}
              <td className="py-2 px-4 border-b">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(agent)}
                    className="px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    View details
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}