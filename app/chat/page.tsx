"use client"

import { useState } from "react"
import { Paperclip } from "lucide-react"
import { API_ROUTES } from "../constants/api" // Make sure to import your API_ROUTES correctly

export default function Chat() {
  const [userInput, setUserInput] = useState("")
  const [messages, setMessages] = useState<
    { query: string; response: string }[]
  >([])
  const [loading, setLoading] = useState(false)

  const extractLastResponse = (response: any) => {
    const responseRegex = /┌─ Response.*?┐\s*│\s*([\s\S]*?)\s*│\s*└/g
    const matches = [...response.matchAll(responseRegex)]

    if (matches.length > 0) {
      const lastResponse = matches[matches.length - 1][1].trim()
      return lastResponse
        .replace(/│/g, "") // Remove all occurrences of the line symbol
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim()
    }
    return null
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return // Don't send empty messages

    setLoading(true)

    try {
      // Send the user's message to the chatbot API
      const response = await fetch(API_ROUTES.ask, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userInput }),
      })

      const data = await response.json()

      if (response.ok) {
        // Format the response properly: Assuming the response is an array of options
        const formattedResponse = extractLastResponse(data.response)

        // Add the user's message and the most relevant response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { query: userInput, response: formattedResponse },
        ])
        setUserInput("") // Clear the input field
      } else {
        // Handle errors from the API
        console.error("Error:", data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent the default action of Enter (like inserting a newline)
      handleSendMessage() // Trigger the send message function
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Greeting Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
              AI
            </div>
            <h2 className="text-xl font-semibold bg-chatbot-header-text-gradient">
              Hi There, <span className="text-blue-600">David</span>
            </h2>
          </div>
          <h3 className="text-xl font-bold text-blue-600">
            What would you like to know?
          </h3>
          <p className="text-sm text-gray-500">
            Use the prompts below to get started. Feel free to customize them to
            suit your needs.
          </p>
        </div>

        {/* Message Box */}
        <div className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col space-y-4">
          {/* Display conversation */}
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} className="space-y-1">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <p className="text-sm text-blue-700">{message.query}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-sm text-gray-700">{message.response}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="bg-gray-200 p-2 rounded-lg">
                <p className="text-sm text-gray-600">...Processing...</p>
              </div>
            )}
          </div>

          <div className="w-full bg-white rounded-xl shadow-md p-4 flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-600">
              <Paperclip />
            </button>
            <input
              type="text"
              placeholder="Type your messages here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown} // Listen for the Enter key press
              className="flex-1 border-none outline-none bg-transparent text-gray-800"
            />
            <button
              onClick={handleSendMessage}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full text-sm"
            >
              Send ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
