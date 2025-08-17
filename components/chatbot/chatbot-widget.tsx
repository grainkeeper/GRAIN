'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, X, Send, Bot, User, Sparkles, MapPin, Droplets, Sun, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataCollectionFlow } from './data-collection-flow'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'quick_action' | 'weather' | 'recommendation' | 'data_collection'
}

interface FarmingData {
  location: {
    province: string
    city: string
    barangay?: string
  }
  crop: {
    variety: string
    plantingDate: string
    growthStage: string
  }
  soil: {
    type: string
    moisture: string
    ph: string
  }
  weather: {
    currentConditions: string
    rainfall: string
  }
}

interface QuickAction {
  id: string
  text: string
  icon: React.ReactNode
  action: string
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDataCollection, setShowDataCollection] = useState(false)
  const [userFarmingData, setUserFarmingData] = useState<FarmingData | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m GRAINKEEPER, your AI farming assistant. I can help you with rice farming advice, weather recommendations, and yield optimization. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate session ID on component mount
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [sessionId])

  const quickActions: QuickAction[] = [
    {
      id: 'weather',
      text: 'Weather Forecast',
      icon: <Sun className="h-4 w-4" />,
      action: 'weather'
    },
    {
      id: 'location',
      text: 'Set Location',
      icon: <MapPin className="h-4 w-4" />,
      action: 'location'
    },
    {
      id: 'irrigation',
      text: 'Irrigation Advice',
      icon: <Droplets className="h-4 w-4" />,
      action: 'irrigation'
    },
    {
      id: 'yield',
      text: 'Yield Prediction',
      icon: <Sparkles className="h-4 w-4" />,
      action: 'yield'
    },
    {
      id: 'profile',
      text: 'Setup Profile',
      icon: <User className="h-4 w-4" />,
      action: 'profile'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = async (action: QuickAction) => {
    if (action.action === 'profile') {
      setShowDataCollection(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: `I need help with ${action.text.toLowerCase()}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'quick_action'
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.action,
          farmingData: userFarmingData,
          conversationHistory: messages,
          sessionId,
          userId: null // TODO: Add user authentication
        }),
      })

      const data = await response.json()

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.text,
          sender: 'bot',
          timestamp: new Date(),
          type: 'recommendation'
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleDataCollectionComplete = (farmingData: FarmingData) => {
    setUserFarmingData(farmingData)
    setShowDataCollection(false)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: 'I\'ve completed my farming profile setup',
      sender: 'user',
      timestamp: new Date(),
      type: 'data_collection'
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `Perfect! I now have your farming profile. You're located in ${farmingData.location.city}, ${farmingData.location.province} growing ${farmingData.crop.variety} rice. I can now provide personalized recommendations based on your specific conditions. What would you like to know about?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage, botMessage])
  }

  const handleDataCollectionCancel = () => {
    setShowDataCollection(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          farmingData: userFarmingData,
          conversationHistory: messages,
          sessionId,
          userId: null // TODO: Add user authentication
        }),
      })

      const data = await response.json()

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.text,
          sender: 'bot',
          timestamp: new Date(),
          type: 'recommendation'
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg hover:scale-110 transition-all duration-200"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-[500px] shadow-xl border-0 animate-in slide-in-from-bottom-4 duration-300">
          {showDataCollection && (
            <div className="absolute inset-0 bg-white z-10 rounded-lg">
              <DataCollectionFlow
                onComplete={handleDataCollectionComplete}
                onCancel={handleDataCollectionCancel}
              />
            </div>
          )}
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">GRAINKEEPER</CardTitle>
                  <div className="text-xs text-green-100">AI Farming Assistant</div>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-80">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end space-x-2",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                      message.sender === 'user'
                        ? "bg-green-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    )}
                  >
                    {message.text}
                    <div className={cn(
                      "text-xs mt-1 opacity-70",
                      message.sender === 'user' ? "text-green-100" : "text-gray-500"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {messages.length === 1 && !isTyping && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 text-center">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        variant="outline"
                        size="sm"
                        className="h-auto p-2 text-xs justify-start space-x-2 hover:bg-green-50 hover:border-green-200"
                      >
                        {action.icon}
                        <span>{action.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}