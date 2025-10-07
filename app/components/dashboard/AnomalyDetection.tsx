import React, { useEffect } from "react"

type AnomalyDetectionProps = {
  isAnomaly: boolean
  anomalyCount: number
  reasons: string[]
  setToast:(loading: boolean) => void;
}

export default function AnomalyDetection({
  isAnomaly,
  anomalyCount,
  reasons,
  setToast
}: AnomalyDetectionProps) {
  useEffect(() => {
    if(isAnomaly){
      setToast(true)
      setTimeout(() => {
        setToast(false)
      },60000)
    }else{
      setToast(false)
    }
  },[])
  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <h2 className="ot-title font-semibold text-xl">Anomaly Detection</h2>
        <span
          className={
            "text-xs px-2 py-1 rounded-full " +
            (isAnomaly
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700")
          }
        >
          {isAnomaly ? "Anomalies Found" : "No Anomalies"}
        </span>
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">Count:</span> {anomalyCount}
      </div>
      {reasons && reasons.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Reasons</div>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


