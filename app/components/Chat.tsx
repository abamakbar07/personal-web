'use client'

import { useEffect, useRef, useState } from 'react'
import Markdown from 'markdown-to-jsx'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const SESSION_KEY = 'chat-session-id'

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>('')

  useEffect(() => {
    sessionIdRef.current = getSessionId()
    fetch(`/api/chat?sessionId=${sessionIdRef.current}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])

    try {
      setIsStreaming(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId: sessionIdRef.current })
      })

      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: Date.now() }])
      let acc = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        acc += chunk
        setMessages(prev => {
          const msgs = [...prev]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: acc }
          return msgs
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.timestamp} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">AI</div>
            )}
            <div className="max-w-[80%]">
              <div className={`rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'}`}>
                <Markdown 
                  options={{ 
                    forceBlock: true,
                    wrapper: 'div',
                    overrides: {
                      div: {
                        props: {
                          className: 'prose dark:prose-invert max-w-none'
                        }
                      }
                    }
                  }}
                >
                  {m.content}
                </Markdown>
              </div>
              <div className="text-xs text-neutral-500 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">You</div>
            )}
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">AI</div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
          <button
            type="submit"
            disabled={isStreaming}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
