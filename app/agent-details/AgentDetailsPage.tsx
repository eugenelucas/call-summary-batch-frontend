// AgentDetailsPage.tsx
'use client'

import { useMemo, useState } from 'react';
import Head from 'next/head';
import CallProcessor from '../components/dashboard/processCalls';
import AgentTable from './AgentTable';
import Image from 'next/image';
import { LoganimationsIcon } from "../chat-ui-backup/components/icons"

export interface Agent {
  agent_id: string | number;
  agent_name: string;
  total_calls: number;
  avg_agent_rating: number;
  avg_sentiment_rating: number;
  total_anomalies: number;
  detected_audiofiles: string[]; // Updated to string[] for consistency with AgentTable
}

interface AgentDetailsPageProps {
  initialAgents?: Agent[];
}

const AgentDetailsPage: React.FC<AgentDetailsPageProps> = ({ initialAgents = [] }) => {
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    () => initialAgents.map((a) => a.agent_id.toString())
  );
  const [showReport, setShowReport] = useState<boolean>(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null); // New state for details view

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) => {
      const isSelected = prev.includes(agentId);
      const next = isSelected ? prev.filter((id) => id !== agentId) : [...prev, agentId];
      setSelectAll(next.length === initialAgents.length);
      return next;
    });
    setIsDropdownOpen(false);
  };

  const clearAll = () => {
    setSelectedAgents([]);
    setSelectAll(false);
    setIsDropdownOpen(false);
  };

  const selectAllAgents = () => {
    setSelectedAgents(initialAgents.map((a) => a.agent_id.toString()));
    setSelectAll(true);
    setIsDropdownOpen(false);
  };

  const selectedAgentsData = useMemo(
    () => {
      const ids = new Set(selectedAgents);
      return initialAgents.filter((agent) => ids.has(agent.agent_id.toString()));
    },
    [initialAgents, selectedAgents]
  );

  const handleBack = () => {
    if (selectedAgentForDetails) {
      setSelectedAgentForDetails(null); // Clear details view to return to multi-agent table
    } else {
      setShowReport(false);
      setSelectedAgents([]);
      setSelectAll(false);
    }
  };

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgentForDetails(agent); // Set the agent to view details
  };

  return (
    <>
      {!showReport && !selectedAgentForDetails && (
        <div className="max-w-6xl w-full grid grid-cols-[40%_60%] gap-10 items-center">
          <div className="flex justify-center">
            <Image
              src="/dashboard-main1.svg"
              alt="I Call Summary Illustration"
              width={349}
              height={282}
              className="w-full max-w-md"
            />
          </div>
          <div className="container mx-auto p-4">
            <div className="flex flex-col items-left justify-center">
              <LoganimationsIcon width={73} />
              <div className="text-4xl font-bold w-2xl otitle mt-4 mb-4">
                Welcome to<br />
                Comprehensive Agent Statistics <br />
                and Analytics
              </div>
              <p className="osubtitle text-base mb-6">
                Monitor calls, ratings, and anomalies to drive smarter<br /> performance decisions
              </p>
            </div>
            {initialAgents.length === 0 ? (
              <div className="text-gray-500 text-center">
                <p>No agents found. Would you like to refresh the data?</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 space-y-2">
                  <div className="relative agent-selector-dropdown">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full h-[45px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white hover:border-gray-400 transition-colors"
                    >
                      <span className={selectedAgents.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                        {selectedAgents.length === 0
                          ? 'Select Agents...'
                          : `${selectedAgents.length} agent${selectedAgents.length > 1 ? 's' : ''} selected`}
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
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-200 flex items-center gap-3">
                          <button
                            onClick={() => (selectAll ? clearAll() : selectAllAgents())}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectAll ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        {initialAgents.map((agent) => {
                          const id = agent.agent_id.toString();
                          const isSelected = selectedAgents.includes(id);
                          return (
                            <div
                              key={id}
                              onClick={() => toggleAgent(id)}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                                isSelected ? 'bg-blue-50' : ''
                              }`}
                            >
                              <span className={`truncate text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
                                {agent.agent_name} (ID: {agent.agent_id})
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0 ml-2">
                                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                    <path d="M1 4.5L4 7.5L11 0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {selectedAgents.length > 0 && (
                    <div className="mb-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Agents ({selectedAgents.length})
                        </span>
                        <button onClick={clearAll} className="text-xs text-red-600 hover:text-red-800">
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgents.map((id) => {
                          const agent = initialAgents.find((a) => a.agent_id.toString() === id);
                          if (!agent) return null;
                          return (
                            <div key={id} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              <span className="truncate max-w-[150px]">{agent.agent_name}</span>
                              <button onClick={() => toggleAgent(id)} className="ml-2 hover:text-blue-900">
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {selectedAgents.length > 0 && (
                  <button
                    onClick={() => setShowReport(!showReport)}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {showReport ? 'Hide Report' : 'Generate Report'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showReport && selectedAgentsData.length === 1 && !selectedAgentForDetails && (
        <AgentTable agents={selectedAgentsData} onBack={handleBack} />
      )}
      {showReport && selectedAgentsData.length > 1 && !selectedAgentForDetails && (
        <div className="overflow-x-auto w-[74%]">
          <button
            onClick={handleBack}
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
          <table className="bg-white border border-gray-200 w-[100%]">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Agent Name</th>
                <th className="py-2 px-4 border-b text-left">Total Number of Calls</th>
                <th className="py-2 px-4 border-b text-left">Average Call Sentiment</th>
                <th className="py-2 px-4 border-b text-left">Average Rating of Agent</th>
                <th className="py-2 px-4 border-b text-left">Anomalies Detected</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
              {selectedAgentsData.map((agent) => (
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
                  <td className="py-2 px-4 border-b">{agent.total_anomalies}</td>
                  <td  className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleViewDetails(agent)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
          </table>
        </div>
      )}
      {selectedAgentForDetails && (
        <AgentTable agents={[selectedAgentForDetails]} onBack={handleBack} />
      )}
    </>
  );
};

export default AgentDetailsPage;