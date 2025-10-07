"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AccessDeniedContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(params.get("email"))
  }, [params])

  const handleBackToLogin = () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    const loginUrl = `https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net?redirect_uri=${encodeURIComponent(
      redirectTo
    )}`
    router.replace(loginUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-xl shadow p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Access denied</h1>
        <p className="text-gray-600 mb-6">
          {email ? (
            <>No role found for user: <span className="font-medium">{email}</span></>
          ) : (
            <>No role found for this user.</>
          )}
        </p>
        {/* <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
          <button
            onClick={() => router.replace("/")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Go Home
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  )
}