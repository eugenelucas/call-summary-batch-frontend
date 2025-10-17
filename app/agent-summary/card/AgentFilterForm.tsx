"use client"

import { Dispatch, SetStateAction } from "react"
import {LoganimationsIcon} from "../../chat-ui-backup/components/icons"
import Image from 'next/image';

interface AgentFilterFormProps {
  start: string
  setStart: Dispatch<SetStateAction<string>>
  end: string
  setEnd: Dispatch<SetStateAction<string>>
  fetchAgents: () => void
  canFetch: boolean
  loading: boolean
}

export default function AgentFilterForm({
  start,
  setStart,
  end,
  setEnd,
  fetchAgents,
  canFetch,
  loading,
}: AgentFilterFormProps) {
  // Handle date change and set time to 00:00:00 for start and 23:59:59 for end
  const handleStartDateChange = (dateValue: string) => {
    if (dateValue) {
      setStart(`${dateValue}T00:00:00`)
    } else {
      setStart('')
    }
  }

  const handleEndDateChange = (dateValue: string) => {
    if (dateValue) {
      setEnd(`${dateValue}T23:59:59`)
    } else {
      setEnd('')
    }
  }

  // Extract date part from datetime string (YYYY-MM-DD)
  const getDateValue = (datetime: string) => {
    return datetime ? datetime.split('T')[0] : ''
  }

  return (
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
          <div className="text-4xl font-bold w-2xl mt-4 mb-4">
            Welcome to<br />
            Comprehensive Agent Statistics<br />
            and Analytics
          </div>
          <p className="text-base mb-6 text-gray-600">
            Monitor calls, ratings, and anomalies to drive smarter<br />
            performance decisions
          </p>
        </div>
        <div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Start date</label>
              <input
                type="date"
                value={getDateValue(start)}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">End date</label>
              <input
                type="date"
                value={getDateValue(end)}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <button
                onClick={fetchAgents}
                disabled={!canFetch || loading}
                className={`px-4 py-2 rounded text-white ${
                  !canFetch || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Loading..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}