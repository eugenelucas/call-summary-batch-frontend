import React from 'react'
import AudioFilesUploadComponent from '../components/dashboard/AudioFilesUpload'
import Image from 'next/image';

export default function UploadFilesPage() {
  return (
    <>
    {/* <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Files</h1>
          <UploadFiles />
        </div>
      </div>
    </div> */}

        <div className="hidden-1 ot-dashbord-main-container mt-12">
           <div className="ot-min-h-screen flex items-center justify-center">
             <div className="max-w-6xl w-full grid grid-cols-[40%_60%] gap-10 items-center">
              {/* Illustration */}
              <div className="flex justify-center">
                <Image 
                  src="/dashboard-main1.svg" 
                  alt="I Call Summary Illustration" 
                  width={349} 
                  height={282} 
                  className="w-full max-w-md"
                />
              </div>
              {/* Content */}
              <div className="space-y-6">
                <AudioFilesUploadComponent />
              </div>
             </div>
           </div>
        </div>
    </>
  )
}
