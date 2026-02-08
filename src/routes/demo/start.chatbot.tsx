import { createFileRoute } from '@tanstack/react-router'
import { Mic  } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react'
import { FaRobot } from 'react-icons/fa'

/**
 * Route - Registers this component as a file route with TanStack Router
 */
export const Route = createFileRoute('/demo/start/chatbot')({
  component: RouteComponent,
})

/**
 * Message - Represents a single chat message
 * @property sender - 'user' or 'bot' indicating who sent the message
 * @property text - The content of the message
 */
interface Message {
  sender: 'user' | 'bot'
  text: string
}

/**
 * ChatState - Represents the different stages of the chatbot conversation
 */
type ChatState =
  | 'idle'
  | 'awaiting_tax_request'
  | 'awaiting_tax_details'
  | 'awaiting_anything_else'

/**
 * RouteComponent - Main chatbot interface component
 *
 * Handles chat conversation between the user and bot.
 * Features:
 * - Displays messages in a scrollable chat window
 * - Handles user input via text box or Enter key
 * - Bot provides responses based on conversation state
 */
function RouteComponent() {
  // State to hold all chat messages
  const [messages, setMessages] = useState<Message[]>([])
  // State for the current input in the text box
  const [input, setInput] = useState('')
  // State machine to control conversation flow
  const [state, setState] = useState<ChatState>('idle')
  // Ref to scroll chat to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Initial bot greeting
   * Sets the first message and moves chatbot to awaiting_tax_request state
   */
  useEffect(() => {
    const initialMessage: Message = {
      sender: 'bot',
      text: 'Hello, my name is Jacob. How can I help you?',
    }
    setMessages([initialMessage])
    setState('awaiting_tax_request')
  }, [])

  /**
   * Automatically scrolls the chat to the latest message whenever messages update
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Sends user message and gets bot response
   */
  const handleSend = () => {
    if (!input.trim()) return // ignore empty input

    const userMessage: Message = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMessage])

    const botMessage: Message = { sender: 'bot', text: handleBotResponse(input) }
    setMessages(prev => [...prev, botMessage])

    setInput('') // clear input after sending
  }

  /**
   * Handle Enter key press to send messages
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  /**
   * Handles the chatbot response logic based on current state and user input
   * @param userInput - Text input from the user
   * @returns Bot's response text
   */
  const handleBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    switch (state) {
      case 'awaiting_tax_request':
        if (lowerInput.includes('tax')) {
          setState('awaiting_tax_details')
          return 'Sure! Please include your information like so, "hours: 40, rate: 35, state: NY, county: Kings, city: NYC".'
        }
        if (lowerInput.includes('no')) {
          setState('awaiting_anything_else') // Stop prompting further
          return 'Thanks, have a nice day!'
        }
        return 'I can help you calculate taxes. Please type "please calculate my taxes" to begin.'

      case 'awaiting_tax_details':
        // Regex to parse user input for tax calculation
        const regex =
          /hours:\s*(\d+\.?\d*).*rate:\s*(\d+\.?\d*).*state:\s*(\w+).*county:\s*(\w+).*city:\s*(\w+)/i
        const match = userInput.match(regex)
        if (match) {
          const hours = parseFloat(match[1])
          const rate = parseFloat(match[2])
          const stateName = match[3]
          const countyName = match[4]
          const cityName = match[5]

          const federalRate = 0.12
          const stateRate = 0.05
          const totalRate = federalRate + stateRate
          const grossPay = hours * rate
          const taxes = grossPay * totalRate
          const netPay = grossPay - taxes

          // Move to next state after calculation
          setState('awaiting_anything_else')

          return `Estimated taxes for ${cityName}, ${countyName} County, ${stateName}:
Gross Pay: $${grossPay.toFixed(2)}
Taxes: $${taxes.toFixed(2)}
Net Pay: $${netPay.toFixed(2)}
(Note: this is an estimate.)

Would you like help with anything else?`
        }
        return 'Please include your information like so, "hours: 40, rate: 35, state: NY, county: Kings, city: NYC".'

      case 'awaiting_anything_else':
        if (lowerInput.includes('no')) {
          setState('awaiting_tax_request') // Reset to initial state
          return 'Thanks, have a nice day!'
        }
        if (lowerInput.includes('tax')) {
          setState('awaiting_tax_details')
          return 'Sure! Please include your information like so, "hours: 40, rate: 35, state: NY, county: Kings, city: NYC".'
        }
        setState('awaiting_tax_request')
        return 'Okay! Let me know if you would like me to calculate taxes again.'

      default:
        // Fallback to reset conversation
        setState('awaiting_anything_else')
        return 'Okay! Let me know if you would like me to calculate taxes again.'
    }
  }

  return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            ✨
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Financial Advisor</h1>
            <p className="text-sm opacity-90">
              Tax calculations & personalized financial guidance
            </p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">

        {/* Initial bot message */}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            {msg.sender === 'bot' && (
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FaRobot size={14} />
              </div>
            )}

            <div
              className={`rounded-xl border px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                msg.sender === 'user'
                  ? 'ml-auto bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />

        {/* Suggestion cards (static UI, no logic impact) */}
        <div className="pt-4">
          <p className="text-sm text-slate-600 mb-3">Try asking about:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Calculate Tax',
              'Retirement Plan',
              'Investment Advice',
              'Tax Deductions',
            ].map(label => (
              <div
                key={label}
                className="border border-slate-200 rounded-xl p-4 text-center text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer bg-white"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about taxes, retirement, investments..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />


          <button onClick={handleSend} className="rounded-lg border border-black bg-white px-4 py-2 text-black hover:bg-slate-100 transition">
            <Mic className="w-6 h-6 text-black-600" />
          </button>
          
              
          <button onClick={handleSend} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">
            ➤
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          💡 This is a demo with mock calculations and under testing. Consult with a certified financial advisor.
        </p>
      </div>
    </div>
  </div>
);

}


