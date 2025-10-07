import React from 'react'
import AudioFilesUploadComponent from '../components/dashboard/AudioFilesUpload'
import Image from 'next/image'

export default function AudioUploadPage() {
  return (
    <>
      <div className="hidden-1 ot-dashbord-main-container mt-12">
        <div className="ot-min-h-screen flex items-center justify-center">
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
            <div className="space-y-6">
              <AudioFilesUploadComponent />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
