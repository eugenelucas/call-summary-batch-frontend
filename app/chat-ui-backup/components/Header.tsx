import { HomeIcon, SearchHistoryIcon } from "./icons"
import { useState, useEffect } from "react"
import { useAISearch } from "../../context/AISearchContext"
import { decodeJWT } from "@/app/utils/decodeJWT"
import Link from "next/link"
import Image from "next/image";

export default function HeaderAISearch() {
  const [username, setUsername] = useState<string | null>(null)
  const { openPopup } = useAISearch()
  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1]

    if (token) {
      const decoded = decodeJWT(token)
      if (decoded?.name) {
        setUsername(decoded.name)
      }
    }
  }, [])

  function getInitials(name: string): string {
    if (!name) return ""
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = username ? getInitials(username) : ""

  return (
    <header className="p-4 bg-white fixed top-0 z-50 w-full backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <Image
            src="/Otow-log.svg"
            alt="Otow Logo"
            width={100}
            height={40}
            priority
          />
          </div>
          <nav className="hidden md:flex space-x-6">
          {/* <Link href="/" className="text-gray-700 hover:text-black transition">
            Home
          </Link> */}

          <Link
            href="/chat-ui"
            className="text-gray-700 hover:text-black transition"
          >
           AI ChatBot
          </Link>
          <Link
            href="/chat-ui"
            className="text-gray-700 hover:text-black transition"
          >
            About
          </Link>

          <Link
            href="/chat-ui"
            className="text-gray-700 hover:text-black transition"
          >
            Contact
          </Link>
          </nav>
          <div className="flex flex-row gap-3 items-center">
            <button
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={openPopup}
            >
              <SearchHistoryIcon
                width={28}
                color="#3b82f6"
                className="cursor-pointer"
              />
            </button>
            <div className="flex flex-row gap-3 items-center">
              {initials && (
                <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-sm">
                  {initials}
                </div>
              )}
              {/* <div className="w-[36px] h-[36px] bg-[#3C77EF] text-white rounded-full flex items-center justify-items-center pl-2" >JO</div> */}
              <span className="text-sm">{username}</span>
            </div>
          </div>
      </div>
    </header>
  )
}
