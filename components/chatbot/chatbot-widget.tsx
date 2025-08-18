'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataCollectionFlow } from './data-collection-flow'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'recommendation' | 'data_collection'
}

interface FarmingData {
  location: {
    province: {
      code: string
      name: string
      region_code: string
    } | null
    city: {
      code: string
      name: string
      province_code: string
      city_class: string
    } | null
    barangay: {
      code: string
      name: string
      city_code: string
    } | null
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

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDataCollection, setShowDataCollection] = useState(false)
  const [userFarmingData, setUserFarmingData] = useState<FarmingData | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [conversationId, setConversationId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Initialize conversation and load existing data
  useEffect(() => {
    initializeConversation()
  }, [])

  // Note: Auth state changes are now handled by the ChatbotWrapper component
  // which forces a complete re-render of this component when the user changes

  const initializeConversation = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      logger.info('Initializing conversation for user:', user?.id)
      
      if (user) {
        // Authenticated user - use database
        await initializeAuthenticatedConversation(user)
      } else {
        // Unauthenticated user - use localStorage fallback
        await initializeUnauthenticatedConversation()
      }
    } catch (error) {
      logger.error('Error initializing conversation:', error)
      // Fallback to unauthenticated mode
      await initializeUnauthenticatedConversation()
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAuthenticatedConversation = async (user: any) => {
    try {
      // Try to get existing active conversation
      const { data: existingConversations, error: convError } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
      
      const existingConversation = existingConversations?.[0]

      // If there are multiple active conversations, deactivate all but the most recent one
      if (existingConversations && existingConversations.length > 1) {
        logger.info('Found multiple active conversations, deactivating older ones...')
        const conversationIdsToDeactivate = existingConversations.slice(1).map(conv => conv.id)
        
        await supabase
          .from('chatbot_conversations')
          .update({ is_active: false })
          .in('id', conversationIdsToDeactivate)
      }

      if (existingConversation && !convError) {
        logger.info('Found existing conversation:', existingConversation.id)
        setConversationId(existingConversation.id)
        setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`) // Generate new session ID
        
        // Load messages for this conversation
        const { data: conversationMessages, error: msgError } = await supabase
          .from('chatbot_messages')
          .select('*')
          .eq('conversation_id', existingConversation.id)
          .order('message_timestamp', { ascending: true })

        if (msgError) {
          logger.error('Error loading messages:', msgError)
        }

        if (conversationMessages && !msgError) {
          const formattedMessages: Message[] = conversationMessages.map(msg => ({
            id: msg.id,
            text: msg.message_text,
            sender: msg.message_type as 'user' | 'bot',
            timestamp: new Date(msg.message_timestamp),
            type: msg.message_role as 'text' | 'recommendation' | 'data_collection'
          }))
          setMessages(formattedMessages)
        } else {
          // If no messages found or error loading messages, show welcome message
          logger.info('No messages found in conversation or error loading messages, showing welcome message')
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          setMessages([welcomeMessage])
        }

        // Load farming data from user_farm_context
        if (existingConversation.user_farm_context && existingConversation.user_farm_context.farming_data) {
          setUserFarmingData(existingConversation.user_farm_context.farming_data)
        }
      } else {
        logger.info('No existing conversation found, creating new one...')
        // Create new conversation
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        
        const conversationData = {
          user_id: user.id,
          conversation_title: 'New Conversation',
          conversation_type: 'general',
          is_active: true,
          user_location_province: null,
          user_location_region: null
        }
        
        logger.debug('Attempting to create conversation with data:', conversationData)
        
        const { data: newConversation, error } = await supabase
          .from('chatbot_conversations')
          .insert(conversationData)
          .select()
          .single()

        if (newConversation && !error) {
          setConversationId(newConversation.id)
          
          // Add welcome message
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          
          await saveMessageToDatabase(welcomeMessage, newConversation.id, user.id)
          setMessages([welcomeMessage])
        } else {
          logger.error('Error creating new conversation:', error)
          logger.debug('Error details:', JSON.stringify(error, null, 2))
          logger.debug('User ID:', user.id)
          logger.debug('Session ID:', newSessionId)
          // If database creation fails, still show welcome message but don't save to DB
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
          setMessages([welcomeMessage])
        }
      }
    } catch (error) {
      logger.error('Error initializing authenticated conversation:', error)
      // Even if there's an error, show welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    }
  }

  const initializeUnauthenticatedConversation = async () => {
    try {
      // Try to get existing session ID from localStorage
      const existingSessionId = localStorage.getItem('grainkeeper_session_id')
      if (existingSessionId) {
        setSessionId(existingSessionId)
      } else {
        // Generate new session ID and store it
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        localStorage.setItem('grainkeeper_session_id', newSessionId)
      }

      // Load farming data from localStorage
      const savedFarmingData = localStorage.getItem('grainkeeper_farming_data')
      if (savedFarmingData) {
        try {
          setUserFarmingData(JSON.parse(savedFarmingData))
          // If user has farming data, show welcome message
          setMessages([{
            id: '1',
            text: 'Welcome back! How can I help with your rice farming today?',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }])
        } catch (error) {
          logger.error('Error loading farming data:', error)
        }
      } else {
        // If no farming data, show setup profile message
        setMessages([{
          id: '1',
          text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }])
      }
    } catch (error) {
      logger.error('Error initializing unauthenticated conversation:', error)
      // Set default welcome message
      setMessages([{
        id: '1',
        text: 'Hello! I\'m GRAINKEEPER. Please set up your farming profile to get personalized advice.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }])
    }
  }

    const saveMessageToDatabase = async (message: Message, convId?: string, userId?: string) => {
    logger.debug('Saving message to database:', { convId, userId, messageText: message.text })
    
    // Only save to database if we have both conversationId and userId (authenticated user)
    if (convId && userId) {
      try {
        const { error } = await supabase
          .from('chatbot_messages')
          .insert({
            conversation_id: convId,
            user_id: userId,
            message_text: message.text,
            message_type: message.sender,
            message_role: message.type || 'text',
            message_timestamp: message.timestamp.toISOString(),
            message_context: {
              farming_data: userFarmingData,
              session_id: sessionId
            }
          })

        if (error) {
          logger.error('Error saving message:', error)
        } else {
          logger.debug('Message saved successfully to database')
        }
      } catch (error) {
        logger.error('Error saving message to database:', error)
      }
    } else {
      logger.debug('Not saving to database - missing convId or userId')
    }
    // For unauthenticated users, messages are only stored in memory
  }

  const updateConversation = async (farmingData?: FarmingData) => {
    // Only update database if we have conversationId (authenticated user)
    if (!conversationId) {
      // For unauthenticated users, save farming data to localStorage
      if (farmingData) {
        localStorage.setItem('grainkeeper_farming_data', JSON.stringify(farmingData))
      }
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updateData: any = {
        last_activity: new Date().toISOString(),
        total_messages: messages.length
      }

      if (farmingData) {
        updateData.user_farm_context = {
          farming_data: farmingData
        }
        updateData.user_location_province = farmingData.location.province?.name
        updateData.user_location_region = farmingData.location.province?.region_code
      }

      await supabase
        .from('chatbot_conversations')
        .update(updateData)
        .eq('id', conversationId)
    } catch (error) {
      logger.error('Error updating conversation:', error)
    }
  }

  // Store farming data in database
  useEffect(() => {
    if (userFarmingData && conversationId) {
      updateConversation(userFarmingData)
    }
  }, [userFarmingData, conversationId])

  // Update conversation on message changes
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      updateConversation()
    }
  }, [messages.length, conversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDataCollectionComplete = async (farmingData: FarmingData) => {
    setUserFarmingData(farmingData)
    setShowDataCollection(false)
    
    const { data: { user } } = await supabase.auth.getUser()

    const userMessage: Message = {
      id: Date.now().toString(),
      text: 'I\'ve completed my farming profile setup',
      sender: 'user',
      timestamp: new Date(),
      type: 'data_collection'
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `Profile updated! I can now provide personalized advice for your ${farmingData.crop.variety} rice in ${farmingData.location.city?.name || 'your location'}. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }

    // Save messages (to database if authenticated, or just in memory if not)
    await saveMessageToDatabase(userMessage, conversationId, user?.id)
    await saveMessageToDatabase(botMessage, conversationId, user?.id)

    setMessages(prev => [...prev, userMessage, botMessage])
  }

  const handleDataCollectionCancel = () => {
    setShowDataCollection(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    
    logger.debug('Sending message', { conversationId, userId: user?.id })

    // If no conversationId, try to initialize conversation
    if (!conversationId && user) {
      logger.info('No conversationId found, initializing conversation...')
      await initializeAuthenticatedConversation(user)
      return // Wait for next render cycle
    }

    // Handle profile edit commands
    if (inputValue.toLowerCase().includes('/profile') || inputValue.toLowerCase().includes('/edit')) {
      setShowDataCollection(true)
      setInputValue('')
      return
    }

    // Check if user has farming data, if not, guide them to setup profile
    if (!userFarmingData) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'d love to help you with that! But first, I need to know about your farm to provide personalized advice. Please set up your farming profile so I can give you the best recommendations.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }

      // Save messages (to database if authenticated, or just in memory if not)
      await saveMessageToDatabase(userMessage, conversationId, user?.id)
      await saveMessageToDatabase(botMessage, conversationId, user?.id)

      setMessages(prev => [...prev, userMessage, botMessage])
      setInputValue('')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    // Save user message (to database if authenticated, or just in memory if not)
    await saveMessageToDatabase(userMessage, conversationId, user?.id)
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
          userId: user?.id || null,
          conversationId
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
        
        // Save bot message (to database if authenticated, or just in memory if not)
        await saveMessageToDatabase(botMessage, conversationId, user?.id)
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      logger.error('Error getting chatbot response:', error)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      
      // Save error message (to database if authenticated, or just in memory if not)
      await saveMessageToDatabase(botMessage, conversationId, user?.id)
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

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          size="icon"
          disabled
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
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
                existingData={userFarmingData || undefined}
              />
            </div>
          )}
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-t-xl">
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
              <div className="flex items-center space-x-2">
                {userFarmingData && (
                  <Button
                    onClick={() => setShowDataCollection(true)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    title="Edit Profile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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

              {/* Profile Summary */}
              {userFarmingData && messages.length === 1 && !isTyping && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-xs font-medium text-blue-800 mb-2">Your Farming Profile</div>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>📍 {userFarmingData.location.city?.name || 'N/A'}, {userFarmingData.location.province?.name || 'N/A'}</div>
                    <div>🌾 {userFarmingData.crop.variety} - {userFarmingData.crop.growthStage}</div>
                    <div>🌱 {userFarmingData.soil.type} soil</div>
                  </div>
                </div>
              )}

              {/* Setup Profile Prompt */}
              {!userFarmingData && messages.length === 1 && !isTyping && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-800 mb-2">
                        Set Up Your Farming Profile
                      </div>
                      <div className="text-xs text-green-600 mb-3">
                        Help me provide personalized rice farming advice by sharing your farm details
                      </div>
                      <Button
                        onClick={() => setShowDataCollection(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                        size="sm"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Setup Profile
                      </Button>
                    </div>
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
                  placeholder={userFarmingData ? "Type your message" : "Set up your profile first to start chatting..."}
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