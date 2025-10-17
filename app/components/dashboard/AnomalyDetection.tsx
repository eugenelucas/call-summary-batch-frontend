import React, { useEffect } from "react"
import Image from 'next/image';
import { Key } from "lucide-react";
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
      // setTimeout(() => {
      //   setToast(false)
      // },60000)
    }else{
      setToast(false)
    }
  },[])
  return (
    <div className="flex justify-between rounded-xl shadow-sm bg-white anomalyDetaction-main-bg mb-12">
      <div>
        <div className="flex items-center justify-between p-6 pl-12 pb-0">
          <h2 className=" text-white text-[26px]">Anomaly detected</h2>
          {/* <span
            className={
              "text-xs px-2 py-1 rounded-full " +
              (isAnomaly
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700")
            }
          >
            {isAnomaly ? "Anomalies Found" : "No Anomalies"}
          </span> */}
        </div>
        <div className="flex gap-6 p-6 pl-12 items-center h-[260px]">
            <div className="text-sm text-gray-700 Anomaly-Detection-round flex flex-col items-center gap-3 text-white ">
              <div className="text-[50px] text-white" >{anomalyCount}</div>
              <div className="font-medium text-white ">Count:</div> 
            </div>
            {reasons && reasons.length > 0 && (
              <div>
                <div className="font-medium text-gray-700 mb-2 text-white text-[18px]">Reasons</div>
                <div className="overflow-anomaly-reas-ato">
                  {reasons.map((reason, idx) => (
                    <div className="text-white text-[16px] resons-slot-list flex gap-3" key={idx}>
                     <span>{idx+1}</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="pb-12">
          <Image
                  src="/Anomaly-detaction-4.svg"
                  alt="Anomaly Detaction"
                  width={349}
                  height={282}
                  className="w-full max-w-md"
                />
      </div>
    </div>
  )
}


