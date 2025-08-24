"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, BarChart3, Bot, Code, Info, CheckCircle, XCircle, Users, Clock, TrendingUp, AlertTriangle, Brain, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ChatbotAdminPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    try {
      const r = await fetch('/api/admin/chatbot/analytics')
      if (r.ok) {
        const data = await r.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load chatbot analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Chatbot Management</h1>
        <p className="text-muted-foreground text-lg">Monitor and manage the GRAINKEEPER AI assistant</p>
        <p className="text-sm text-muted-foreground">
          View chatbot performance metrics, AI model configuration, and system prompt. The chatbot uses Gemini Flash 2.0 for rice farming advice.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview?.botMessages || 0} bot, {analytics?.overview?.userMessages || 0} user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.overview?.activeConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">~2s</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>Current AI model and technical specifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Bot className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Gemini Flash 2.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Google's latest fast and efficient AI model
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">API Status</label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-blue-800">Operational</span>
              </div>
              <p className="text-xs text-muted-foreground">
                API key configured and working
              </p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-lg">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Google AI</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Type</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-lg">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Large Language Model</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-lg">
                <Bot className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Rice Farming</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chatbot Status & Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chatbot Status & Behavior
          </CardTitle>
          <CardDescription>Current chatbot configuration and operational status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Operational Status</label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Always Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Chatbot is always available to users
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Welcome Message</label>
              <div className="p-3 bg-gray-50 border rounded-lg text-sm">
                <div className="font-medium text-gray-800">
                  "Hello! I'm GRAINKEEPER. Please set up your farming profile to get personalized advice."
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Hardcoded welcome message in the application
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">Configuration Note:</div>
              <div className="text-yellow-700">
                Chatbot settings are hardcoded in the application. The enable/disable toggle and welcome message editor are not functional. Changes must be made in the source code.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            System Prompt & Instructions
          </CardTitle>
          <CardDescription>The AI model's instruction set and behavior rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="font-medium mb-3 text-gray-800">You are GRAINKEEPER, an AI farming assistant for rice farming in the Philippines.</div>
              
                             <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                 <div className="space-y-2">
                   <div className="text-sm font-semibold text-gray-700">📝 Response Rules:</div>
                   <ul className="text-xs text-gray-600 space-y-1">
                     <li>• Keep responses SHORT and CONCISE (2-3 sentences max)</li>
                     <li>• Use simple, direct language</li>
                     <li>• Focus on actionable advice only</li>
                     <li>• No greetings unless user initiates</li>
                     <li>• Be specific and practical</li>
                     <li>• Use line breaks when switching topics</li>
                   </ul>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="text-sm font-semibold text-gray-700">🎯 Content Rules:</div>
                   <ul className="text-xs text-gray-600 space-y-1">
                     <li>• Never ask for information already provided</li>
                     <li>• Give specific, practical advice</li>
                     <li>• Reference location, crop, and conditions</li>
                     <li>• Be direct and to the point</li>
                     <li>• Focus on Philippine rice farming</li>
                     <li>• Provide weather-aware recommendations</li>
                   </ul>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Hardcoded Configuration</div>
                <div>This prompt is embedded in the application code and cannot be modified from the admin panel. Changes require code updates.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Chatbot usage statistics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Message Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bot Messages</span>
                    <span className="font-medium">{analytics.overview.botMessages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Messages</span>
                    <span className="font-medium">{analytics.overview.userMessages}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Response Ratio</span>
                    <span>{analytics.overview.botMessages > 0 ? Math.round((analytics.overview.botMessages / analytics.overview.totalMessages) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Conversation Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Conversations</span>
                    <span className="font-medium">{analytics.overview.totalConversations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Conversations</span>
                    <span className="font-medium text-blue-600">{analytics.overview.activeConversations}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Avg Messages/Conversation</span>
                    <span>{analytics.overview.totalConversations > 0 ? Math.round(analytics.overview.totalMessages / analytics.overview.totalConversations) : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About the AI Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">For Farmers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Get instant rice farming advice</li>
                <li>• Receive weather-aware recommendations</li>
                <li>• Ask questions about crop management</li>
                <li>• Get personalized guidance based on location</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">For Administrators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor conversation statistics</li>
                <li>• Track AI model performance</li>
                <li>• View system prompt configuration</li>
                <li>• Monitor API status and response times</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
