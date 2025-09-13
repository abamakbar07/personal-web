'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

const STORAGE_KEY = 'chat-conversations'

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Conversation[]
  } catch {
    return []
  }
}

function saveConversations(convos: Conversation[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const convos = loadConversations()
    if (convos.length === 0) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'New chat',
        messages: [],
        createdAt: Date.now()
      }
      setConversations([newConv])
      setCurrentId(newConv.id)
    } else {
      setConversations(convos)
      setCurrentId(convos[0].id)
    }
  }, [])

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, currentId, isStreaming])

  const current = conversations.find(c => c.id === currentId)

  const updateConversation = (convId: string, updater: (c: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => (c.id === convId ? updater(c) : c)))
  }

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentId(newConv.id)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !current) return
    setInput('')

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: Date.now() }
    updateConversation(current.id, c => ({
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 20) : c.title,
      messages: [...c.messages, userMsg]
    }))

    try {
      setIsStreaming(true)
      const history = [...current.messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history })
      })

      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      const botMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() }
      updateConversation(current.id, c => ({ ...c, messages: [...c.messages, botMsg] }))

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        updateConversation(current.id, c => {
          const msgs = [...c.messages]
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: msgs[msgs.length - 1].content + chunk }
          return { ...c, messages: msgs }
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="font-semibold">Chats</h2>
          <button
            onClick={handleNewConversation}
            className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setCurrentId(c.id)}
              className={`w-full text-left px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${currentId === c.id ? 'bg-neutral-100 dark:bg-neutral-900' : ''}`}
            >
              <div className="font-medium text-sm truncate">{c.title}</div>
              <div className="text-xs text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {current?.messages.map(m => (
            <div key={m.timestamp} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">AI</div>
              )}
              <div className="max-w-[80%]">
                <div className={`rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'}`}>
                  {/* @ts-expect-error className is valid for react-markdown */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none">
                    {m.content}
                  </ReactMarkdown>
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
    </div>
  )
}

