import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useRef } from 'react'
import { FaRobot } from 'react-icons/fa'

export const Route = createFileRoute('/demo/start/chatbot')({
  component: RouteComponent,
})

interface Message {
  sender: 'user' | 'bot'
  text: string
}

type ChatState =
  | 'idle'
  | 'awaiting_tax_request'
  | 'awaiting_tax_details'
  | 'awaiting_anything_else'

function RouteComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [state, setState] = useState<ChatState>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial bot message
  useEffect(() => {
    const initialMessage: Message = {
      sender: 'bot',
      text: 'Hello, my name is Jacob. How can I help you?',
    }
    setMessages([initialMessage])
    setState('awaiting_tax_request')
  }, [])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMessage])

    const botMessage: Message = { sender: 'bot', text: handleBotResponse(input) }
    setMessages(prev => [...prev, botMessage])

    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

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

        /*regex for calculating taxes and parsing information from response*/ 
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

          // After calculation, ask if user wants help with anything else
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
                setState('awaiting_anything_else') // Stop prompting further
                return 'Thanks, have a nice day!'
            }
            if (lowerInput.includes('tax')) {
                setState('awaiting_tax_details')
                return 'Sure! Please include your information like so, "hours: 40, rate: 35, state: NY, county: Kings, city: NYC".'
            }
            // If user says anything else, default idle response
            setState('awaiting_tax_request')
            return 'Okay! Let me know if you would like me to calculate taxes again.'

            default:
                // Reset conversation to beginning
                setState('awaiting_anything_else')
                return 'Okay! Let me know if you would like me to calculate taxes again.'

    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)',
      }}
    >
        <div style={{ maxWidth: 500, margin: '20px auto', fontFamily: 'sans-serif', background: '#18181b', padding: 20, borderRadius: 8 }}>
        <h2>Income Tax Chatbot</h2>
        <div
            style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 10,
            height: 300,
            overflowY: 'auto',
            marginBottom: 10,
            scrollbarWidth: 'thin',
            scrollbarColor: '#3b82f6 #15181fff',  
            }}
        >
            {messages.map((msg, idx) => (
            <div
                key={idx}
                style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                margin: '5px 0',
                alignItems: 'center',
                gap: 5,
                }}
            >
                {msg.sender === 'bot' && <FaRobot />}
                <span
                style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 15,
                    backgroundColor: msg.sender === 'user' ? '#007bff' : '#e5e5ea',
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    maxWidth: '70%',
                    wordWrap: 'break-word',
                }}
                >
                {msg.text}
                </span>
            </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
            marginBottom: 5,
            }}
        />
        <button
            onClick={handleSend}
            style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
            }}
        >
            Send
        </button>
        </div>
    </div>
  )
}

