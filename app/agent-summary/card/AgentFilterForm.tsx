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
        {/* <h1 className="text-2xl font-bold mb-4">Agent Statistics Dashboard</h1> */}
            <div className="flex flex-col items-left justify-center">
              <LoganimationsIcon width={73} />
              <div className="text-4xl font-bold w-2xl otitle mt-4 mb-4">
                Welcome to<br></br>
                Comprehensive Agent Statistics <br></br>and Analytics
              </div>
              <p className="osubtitle text-base mb-6">
                Monitor calls, ratings, and anomalies to drive smarter<br></br> performance decisions
              </p>
            </div>
               <div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Start datetime</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">End datetime</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <button
            onClick={fetchAgents}
            disabled={!canFetch || loading}
            className={`px-4 py-2 rounded text-white ${
              !canFetch || loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Loading..." : "Fetch Summary"}
          </button>
        </div>
      </div>
    </div>
      </div>
      </div>

 
  )
}