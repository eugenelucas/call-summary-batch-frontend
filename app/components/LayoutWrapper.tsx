"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import HeaderAISearch from "../chat-ui-backup/components/Header"
import Sidebar from "./dashboard/Sidebar"
import Footer from "./Footer"
import FooterAISearch from "../chat-ui-backup/components/Footer"
import { DashboardProvider } from "../context/DashboardContext"
import PopupComponent from "../chat-ui-backup/components/PopupComponent"
import Popupprofile from "../components/Popupprofile"

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [hovered, setHovered] = useState(false)

  const isAltLayout = pathname === "/chat-ui"

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored !== null) setCollapsed(stored === "true")
  }, [])

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    setCollapsed(newCollapsed)
  }

  const isSidebarExpanded = !collapsed || hovered
  const sidebarWidth = isSidebarExpanded ? 306 : 64

  // ✅ Show sidebar on homepage and UploadFiles page
  const showSidebar = pathname === "/" || pathname === "/UploadFiles" || pathname === "/agent-details" || pathname === "/audio-upload" || pathname === "/agent-summary"

  return (
    <DashboardProvider>
      <div className="flex min-h-screen overflow-hidden">
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            hovered={hovered}
            toggleSidebar={toggleCollapse}
            setHovered={setHovered}
          />
        )}

        <div
          className="flex flex-col flex-1 transition-all duration-300 ease-in-out "
          style={{ marginLeft: showSidebar ? sidebarWidth : 0 }}
        >
          {isAltLayout ? (
            <>
              <HeaderAISearch  />
              <PopupComponent />
            </>
          ) : (
            <>
              <Header sidebarOpen={showSidebar && isSidebarExpanded} />
              <Popupprofile />
            </>
          )}
          <main
            className={`flex-1 ${isAltLayout}?mt-1:mt-16 overflow-auto p-6 backround-chat-ui`}
          >
            {children}
          </main>
          {isAltLayout ? <FooterAISearch /> : <Footer />}
        </div>
      </div>
    </DashboardProvider>
  )
}
