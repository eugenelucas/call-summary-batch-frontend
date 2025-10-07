// "use client"
// import { useEffect, useState } from "react"
// import {
//   LoganimationsIcon,
//   SendIcon,
//   AttachemntIcon,
//   AIsearchIcon,
//   DOCIcon,
//   PDFIcon,
//   LogIcon
// } from "../components/icons"
// import { useAISearch } from "../../context/AISearchContext"
// import { fetchWithAuth } from "@/app/utils/axios"
// import { API_ROUTES } from "../../constants/api"
// import { decodeJWT } from "@/app/utils/decodeJWT"

// export default function Aisearch({ onSend }: { onSend: () => void }) {
//   const [fileName, setFileName] = useState("")
//   const [fileType, setFileType] = useState("")
//   const [fileInput, setFileInput] = useState<File | null>(null)
//   const [username, setUsername] = useState<string | null>(null)

//   const {
//     query,
//     setQuery,
//     isLoading,
//     setIsLoading,
//     setConversationId,
//     setMessages,
//     messages,
//     conversationId,
//     setConversationHistory,
//   } = useAISearch()

//   useEffect(() => {
//     const cookies = document.cookie.split(";").map((c) => c.trim())
//     const token = cookies
//       .find((c) => c.startsWith("access_token="))
//       ?.split("=")[1]

//     if (token) {
//       const decoded = decodeJWT(token)
//       if (decoded?.name) {
//         setUsername(decoded.name)
//       }
//     }
//   }, [])


//   useEffect(() => {
//     const fetchConversationId = async () => {
//       try {
//         const res = await fetchWithAuth(API_ROUTES.conversations, {
//           method: "POST",
//         })
//         const data = await res.json()
//         if (data?.conversation_id) {
//           console.log(data.conversation_id)
//           setConversationId(data?.conversation_id)
//         }
//       } catch (err) {
//         console.error("Failed to fetch conversation ID:", err)
//       }
//     }

//     fetchConversationId()
//   }, [setConversationId])

//   function extractLastResponse(response: string): string {
//     // Check if the response has numbered items pattern
//     if (response.match(/\d+\s[^0-9]+/)) {
//       // Split by numbers followed by space
//       const matches = response.match(/(\d+\s[^0-9]+)/g)
//       if (matches) {
//         // Join with proper line breaks between each numbered item
//         return matches.map((item) => item.trim()).join("\n")
//       }
//     }
//     return response
//   }

//   //ask function to send the message to the API and get the response
//   // and update the messages state with the response
//   const sendMessage = async () => {
//     if (!query?.trim() && !fileInput) return

//     setIsLoading(true)

//     // Add user message to messages
//     if (query?.trim()) {
//       setMessages((prev) => [...prev, { sender: "user", content: query }])
//     }
    
//     // Add a loading message to show while waiting for response
//     setMessages((prev) => [...prev, { sender: "ai", content: "Thinking...", isLoading: true }])
    
//     setQuery("")

//     try {
//       if (fileName && fileInput) {
//         const formData = new FormData()
//         formData.append("file", fileInput)

//         const uploadRes = await fetchWithAuth(API_ROUTES.upload, {
//           method: "POST",
//           body: formData,
//         })

//         if (!uploadRes.ok) throw new Error("File upload failed")

//         if (fileInput) {
//           setMessages((prev) =>
//             prev.filter((msg) => !msg.isLoading).concat([
//               {
//                 sender: "user",
//                 content: `📎 ${fileName}`,
//                 fileType: fileType,
//               },
//             ])
//           );
//         }
//       }

//       if (!query.trim() && !fileInput) {
//         setIsLoading(false)
//         setFileName("")
//         setFileType("")
//         setFileInput(null)
//         // Remove the loading message
//         setMessages((prev) => prev.filter((msg) => !msg.isLoading))
//         return
//       }

//       const res = await fetchWithAuth(API_ROUTES.ask, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           conversationId,
//           query: query,
//         }),
//       })

//       const data = await res.json()
//       const extracted = extractLastResponse(data?.response || "")

//       // Replace loading message with AI response
//       setMessages((prev) =>
//         prev.filter((msg) => !msg.isLoading).concat([
//           { sender: "ai", content: extracted || data.response },
//         ])
//       );
//       setConversationHistory(data?.conversation_history)
//     } catch (err) {
//       console.error("Error during ask:", err)
//       // Replace loading message with error message
//       setMessages((prev) =>
//         prev.filter((msg) => !msg.isLoading).concat([
//           { sender: "ai", content: "Something went wrong." },
//         ])
//       )
//     }

//     setFileName("")
//     setFileType("")
//     setFileInput(null)
//     setIsLoading(false)
//   }

//   const handleFileChange = (e: any) => {
//     const file = e.target.files[0]
//     if (file) {
//       setFileInput(file)
//       setFileName(file.name)
//       const extension = file.name.split(".").pop().toLowerCase()
//       setFileType(extension)
//     }
//   }

//   useEffect(() => {
//     const chatContainer = document.getElementById("chat-box")
//     chatContainer?.scrollTo({
//       top: chatContainer.scrollHeight,
//       behavior: "smooth",
//     })
//   }, [messages])

//   function getInitials(name: string): string {
//     if (!name) return ""
//     const parts = name.trim().split(" ")
//     if (parts.length === 1) return parts[0][0].toUpperCase()
//     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
//   }

//   const initials = username ? getInitials(username) : ""

//   return (
//     <div
//       className={
//         messages.length === 0
//           ? "o2AlignSearch-center"
//           : "o2AlignSearch-center o2AlignSearchm1-center "
//       }
//     >
//       <div className="text-left p-4 mt-auto text-xs subtitle">
//         {messages.length === 0 && (
//           <div className="flex flex-col items-left justify-center mb-4">
//             <LoganimationsIcon width={73} />
//             <div className="text-5xl font-bold w-2xl otitle mt-4 mb-4">
//               Hi, {username}<br></br>
//               What would like to know?
//             </div>
//             <p className="osubtitle text-base  mb-4">
//               Use the prompts below to begin your journey. Feel free to
//               customise
//               <br />
//               them to suit your needs.
//             </p>
//           </div>
//         )}
//         <div className="flex flex-col h-full">
//           {/* Scrollable chat box */}
//           <div
//             id="chat-box"
//             className="flex-1 overflow-y-auto px-0 py-2 space-y-2"
//           >
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${
//                   msg.sender === "user" ? "justify-end gap-2" : "justify-start gap-2"
//                 }`}
//               >
//                  {msg.sender === "user" && !msg.isLoading ?( 
//                   <div> {initials && (
//                       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-xs">
//                         {initials}
//                     </div>
//                   )}
//                  </div>
//                 ): msg.sender === "ai" && !msg.isLoading ?( 
//                     <LogIcon width={36} height={36} />
//                  ): (
//                   <div></div>
//                  )}
//                 <div
//                   className={`max-w-[70%]  rounded-xl text-sm ${
//                     msg.sender === "user"
//                       ? "bg-white font-bold border-o3 px-4 py-3 boxshadow rounded-br-none"
//                       : msg.isLoading 
//                       ? "p-0"
//                       : "bg-white text-gray-800 rounded-bl-none border-o3 p-5"
//                   }`}
//                 >
//                   {/* Loading message */}
//                   {msg.isLoading ? (
//                     <div className="flex items-center gap-2">
//                       <LoganimationsIcon width={40} height={40} />
//                       {/* <span>Thinking...</span> */}
//                     </div>
//                   ) : msg.content?.startsWith("📎") && msg.fileType ? (
//                     /* File message */
//                     <div className="flex items-center gap-2">
//                       {msg.fileType === "pdf" ? <PDFIcon width={20} /> : null}
//                       {msg.fileType === "doc" || msg.fileType === "docx" ? (
//                         <DOCIcon width={20} />
//                       ) : null}
//                       <span>{msg.content.replace("📎 ", "")}</span>
//                     </div>
//                   ) : (
//                     // Use whitespace-pre-wrap to preserve line breaks
//                     <pre className="font-sans whitespace-pre-wrap break-words m-0">
//                       {msg.content}
//                     </pre>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="osubtitle text-base bottom-0 sticky">
//           <div className="flex flex-col w-full max-w-6xl px-4 p-2 rounded-xl bg-white border-o2 aisearchinput">
//             {fileName && (
//               <div className="flex flex-row mb-4">
//                 <div className="flex flex-row items-center  rounded-md border border-solid border-gray-200 p-4 bg-white gap-4">
//                   {fileType === "doc" || fileType === "docx" ? (
//                     <DOCIcon width={26} />
//                   ) : null}
//                   {fileType === "pdf" ? <PDFIcon width={24} /> : null}
//                   {fileName && (
//                     <p className="text-sm text-gray-600">{fileName}</p>
//                   )}
//                 </div>
//               </div>
//             )}
//             <div className="flex-1 text-gray-400 flex items-center space-x-2 mb-2">
//               <AIsearchIcon width={36} />
//               <input
//                 type="text"
//                 placeholder="Type your messages here..."
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                 disabled={isLoading}
//                 className={`w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ${
//                   isLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               />
//             </div>
//             <div className="flex flex-row w-full justify-between mb-2">
//               <div>
//                 <label className="cursor-pointer inline-flex items-center px-4 py-2  text-white rounded">
//                   <AttachemntIcon width={15} />
//                   <input
//                     type="file"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     accept=".doc,.docx,.pdf"
//                   />
//                 </label>
//               </div>
//               <button
//                 disabled={isLoading}
//                 onClick={sendMessage}
//                 className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
//                   isLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {isLoading ? "Processing..." : "Send"} <SendIcon width={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"
import { useEffect, useState } from "react"
import {
  LoganimationsIcon,
  SendIcon,
  AttachemntIcon,
  AIsearchIcon,
  DOCIcon,
  PDFIcon,
  LogIcon
} from "./icons"
import { useAISearch } from "../../context/AISearchContext"
import { fetchWithAuth } from "@/app/utils/axios"
import { API_ROUTES } from "../../constants/api"
import { decodeJWT } from "@/app/utils/decodeJWT"

export default function Aisearch({ onSend }: { onSend: () => void }) {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState("")
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [parentMessageId, setParentMessageId] = useState<string | null>(null)

  const {
    query,
    setQuery,
    isLoading,
    setIsLoading,
    setConversationId,
    setMessages,
    messages,
    conversationId,
    setConversationHistory,
  } = useAISearch()

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

  useEffect(() => {
    const fetchConversationId = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.conversations, {
          method: "POST",
        })
        const data = await res.json()
        if (data?.conversation_id) {
          console.log(data.conversation_id)
          setConversationId(data?.conversation_id)
        }
      } catch (err) {
        console.error("Failed to fetch conversation ID:", err)
      }
    }

    fetchConversationId()
  }, [setConversationId])

  function extractLastResponse(response: string): string {
    if (response.match(/\d+\s[^0-9]+/)) {
      const matches = response.match(/(\d+\s[^0-9]+)/g)
      if (matches) {
        return matches.map((item) => item.trim()).join("\n")
      }
    }
    return response
  }

  const sendMessage = async () => {
    if (!query?.trim() && !fileInput) return

    setIsLoading(true)

    // Add user message to messages
    if (query?.trim()) {
      setMessages((prev) => [...prev, { sender: "user", content: query }])
    }
    
    // Add a loading message to show while waiting for response
    setMessages((prev) => [...prev, { sender: "ai", content: "Thinking...", isLoading: true }])
    
    setQuery("")

    try {
      if (fileName && fileInput) {
        const formData = new FormData()
        formData.append("file", fileInput)

        const uploadRes = await fetchWithAuth(API_ROUTES.upload, {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error("File upload failed")

        if (fileInput) {
          setMessages((prev) =>
            prev.filter((msg) => !msg.isLoading).concat([
              {
                sender: "user",
                content: `📎 ${fileName}`,
                fileType: fileType,
              },
            ])
          )
        }
      }

      if (!query.trim() && !fileInput) {
        setIsLoading(false)
        setFileName("")
        setFileType("")
        setFileInput(null)
        setMessages((prev) => prev.filter((msg) => !msg.isLoading))
        return
      }

      // Construct the API URL based on whether conversationId exists
      let askUrl = API_ROUTES.ask
      if (conversationId && parentMessageId) {
        askUrl = `${API_ROUTES.ask}?conversation_id=${conversationId}&parent_message_id=${parentMessageId}`
        console.log("conversationId parentMessageId" + askUrl)
      } else if (conversationId) {
        askUrl = `${API_ROUTES.ask}?conversation_id=${conversationId}`
        // askUrl = `${API_ROUTES.ask}`
         console.log("conversationId" + askUrl)
      }

      const res = await fetchWithAuth(askUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          query: query,
        }),
      })

      const data = await res.json()
      const extracted = extractLastResponse(data?.response || "")

      // Update parentMessageId with the message_id from the API response (if provided)
      if (data?.message_id) {
        setParentMessageId(data.message_id)
      }

      // Replace loading message with AI response
      setMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat([
          { sender: "ai", content: extracted || data.response },
        ])
      )
      setConversationHistory(data?.conversation_history)
    } catch (err) {
      console.error("Error during ask:", err)
      setMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat([
          { sender: "ai", content: "Something went wrong." },
        ])
      )
    }

    setFileName("")
    setFileType("")
    setFileInput(null)
    setIsLoading(false)
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      setFileInput(file)
      setFileName(file.name)
      const extension = file.name.split(".").pop().toLowerCase()
      setFileType(extension)
    }
  }

  useEffect(() => {
    const chatContainer = document.getElementById("chat-box")
    chatContainer?.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  function getInitials(name: string): string {
    if (!name) return ""
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = username ? getInitials(username) : ""

  return (
    <div
      className={
        messages.length === 0
          ? "o2AlignSearch-center"
          : "o2AlignSearch-center o2AlignSearchm1-center "
      }
    >
      <div className="text-left p-4 mt-auto text-xs subtitle">
        {messages.length === 0 && (
          <div className="flex flex-col items-left justify-center mb-4">
            <LoganimationsIcon width={73} />
            <div className="text-5xl font-bold w-2xl otitle mt-4 mb-4">
              Hi, {username}<br></br>
              What would like to know?
            </div>
            <p className="osubtitle text-base  mb-4">
              Use the prompts below to begin your journey. Feel free to
              customise
              <br />
              them to suit your needs.
            </p>
          </div>
        )}
        <div className="flex flex-col h-full">
          <div
            id="chat-box"
            className="flex flex-col overflow-y-auto px-0 py-2 space-y-2 gap-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end gap-2" : "justify-start gap-2"
                }`}
              >
                {msg.sender === "user" && !msg.isLoading ? (
                  <div>
                    {initials && (
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-xs">
                        {initials}
                      </div>
                    )}
                  </div>
                ) : msg.sender === "ai" && !msg.isLoading ? (
                  <LogIcon width={36} height={36} />
                ) : (
                  <div></div>
                )}
                <div
                  className={`max-w-[70%] rounded-xl text-sm ${
                    msg.sender === "user"
                      ? "bg-white font-bold border-o3 px-4 py-3 boxshadow rounded-br-none"
                      : msg.isLoading
                      ? "p-0"
                      : "bg-white text-gray-800 rounded-bl-none border-o3 p-5"
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoganimationsIcon width={40} height={40} />
                    </div>
                  ) : msg.content?.startsWith("📎") && msg.fileType ? (
                    <div className="flex items-center gap-2">
                      {msg.fileType === "pdf" ? <PDFIcon width={20} /> : null}
                      {msg.fileType === "doc" || msg.fileType === "docx" ? (
                        <DOCIcon width={20} />
                      ) : null}
                      <span>{msg.content.replace("📎 ", "")}</span>
                    </div>
                  ) : (
                    <pre className="font-sans whitespace-pre-wrap break-words m-0">
                      {msg.content}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="osubtitle text-base bottom-0 sticky">
          <div className="flex flex-col w-full max-w-6xl px-4 p-2 rounded-xl bg-white border-o2 aisearchinput">
            {fileName && (
              <div className="flex flex-row mb-4">
                <div className="flex flex-row items-center rounded-md border border-solid border-gray-200 p-4 bg-white gap-4">
                  {fileType === "doc" || fileType === "docx" ? (
                    <DOCIcon width={26} />
                  ) : null}
                  {fileType === "pdf" ? <PDFIcon width={24} /> : null}
                  {fileName && (
                    <p className="text-sm text-gray-600">{fileName}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex-1 text-gray-400 flex items-center space-x-2 mb-2">
              <AIsearchIcon width={36} />
              <input
                type="text"
                placeholder="Type your messages here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
                className={`w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </div>
            <div className="flex flex-row w-full justify-between mb-2">
              <div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 text-white rounded">
                  <AttachemntIcon width={15} />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".doc,.docx,.pdf"
                  />
                </label>
              </div>
              <button
                disabled={isLoading}
                onClick={sendMessage}
                className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Processing..." : "Send"} <SendIcon width={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}