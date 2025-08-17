export interface UserSession {
  sessionId: string
  userId?: string
  createdAt: Date
  lastActive: Date
  farmingData?: any
  conversationContext: {
    currentTopic: string
    recentQuestions: string[]
    preferences: {
      language: 'en' | 'tl'
      region: string
      expertiseLevel: 'beginner' | 'intermediate' | 'expert'
    }
    farmingStage: string
    lastRecommendations: string[]
  }
  messageCount: number
  isActive: boolean
}

export interface SessionContext {
  sessionId: string
  farmingData?: any
  conversationHistory: any[]
  currentTopic: string
  userPreferences: {
    language: 'en' | 'tl'
    region: string
    expertiseLevel: 'beginner' | 'intermediate' | 'expert'
  }
}

class SessionManager {
  private sessions: Map<string, UserSession> = new Map()
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  createSession(userId?: string): UserSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: UserSession = {
      sessionId,
      userId,
      createdAt: new Date(),
      lastActive: new Date(),
      conversationContext: {
        currentTopic: 'general',
        recentQuestions: [],
        preferences: {
          language: 'en',
          region: 'general',
          expertiseLevel: 'beginner'
        },
        farmingStage: 'planning',
        lastRecommendations: []
      },
      messageCount: 0,
      isActive: true
    }

    this.sessions.set(sessionId, session)
    return session
  }

  getSession(sessionId: string): UserSession | undefined {
    const session = this.sessions.get(sessionId)
    if (session && this.isSessionValid(session)) {
      session.lastActive = new Date()
      return session
    }
    return undefined
  }

  updateSession(sessionId: string, updates: Partial<UserSession>): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      Object.assign(session, updates)
      session.lastActive = new Date()
      return true
    }
    return false
  }

  updateFarmingData(sessionId: string, farmingData: any): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.farmingData = farmingData
      session.lastActive = new Date()
      return true
    }
    return false
  }

  updateConversationContext(sessionId: string, context: Partial<UserSession['conversationContext']>): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      Object.assign(session.conversationContext, context)
      session.lastActive = new Date()
      return true
    }
    return false
  }

  addMessage(sessionId: string, message: string, isUser: boolean = true): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.messageCount++
      session.lastActive = new Date()
      
      if (isUser) {
        // Track user questions for context
        const questionKeywords = ['what', 'how', 'when', 'where', 'why', 'which', 'can you', 'could you', 'please help']
        const isQuestion = questionKeywords.some(keyword => 
          message.toLowerCase().includes(keyword)
        )
        
        if (isQuestion) {
          session.conversationContext.recentQuestions.push(message)
          // Keep only last 10 questions
          if (session.conversationContext.recentQuestions.length > 10) {
            session.conversationContext.recentQuestions = session.conversationContext.recentQuestions.slice(-10)
          }
        }
        
        // Update current topic based on message content
        const topics = {
          'weather': ['weather', 'rain', 'sunny', 'forecast', 'climate'],
          'irrigation': ['irrigation', 'water', 'drought', 'flood'],
          'fertilizer': ['fertilizer', 'nutrient', 'nitrogen', 'phosphorus', 'potassium'],
          'pest': ['pest', 'insect', 'disease', 'fungus', 'virus'],
          'harvest': ['harvest', 'yield', 'production', 'milling'],
          'planting': ['planting', 'seed', 'germination', 'transplanting']
        }
        
        for (const [topic, keywords] of Object.entries(topics)) {
          if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
            session.conversationContext.currentTopic = topic
            break
          }
        }
      }
      
      return true
    }
    return false
  }

  setUserPreferences(sessionId: string, preferences: Partial<UserSession['conversationContext']['preferences']>): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      Object.assign(session.conversationContext.preferences, preferences)
      session.lastActive = new Date()
      return true
    }
    return false
  }

  getSessionContext(sessionId: string): SessionContext | undefined {
    const session = this.getSession(sessionId)
    if (session) {
      return {
        sessionId: session.sessionId,
        farmingData: session.farmingData,
        conversationHistory: [], // This would be populated from database in real implementation
        currentTopic: session.conversationContext.currentTopic,
        userPreferences: session.conversationContext.preferences
      }
    }
    return undefined
  }

  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      return true
    }
    return false
  }

  cleanupExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActive.getTime() > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId)
      }
    }
  }

  private isSessionValid(session: UserSession): boolean {
    const now = new Date()
    return session.isActive && (now.getTime() - session.lastActive.getTime() <= this.SESSION_TIMEOUT)
  }

  getActiveSessions(): UserSession[] {
    this.cleanupExpiredSessions()
    return Array.from(this.sessions.values()).filter(session => session.isActive)
  }

  getSessionStats(): { totalSessions: number; activeSessions: number; averageMessages: number } {
    this.cleanupExpiredSessions()
    const activeSessions = this.getActiveSessions()
    const totalMessages = activeSessions.reduce((sum, session) => sum + session.messageCount, 0)
    
    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      averageMessages: activeSessions.length > 0 ? Math.round(totalMessages / activeSessions.length) : 0
    }
  }
}

export const sessionManager = new SessionManager()

// Helper functions for context retention
export function buildContextPrompt(session: UserSession, currentMessage: string): string {
  const context = session.conversationContext
  let prompt = `CONVERSATION CONTEXT:
- Language: ${context.preferences.language}
- Region: ${context.preferences.region}
- Expertise Level: ${context.preferences.expertiseLevel}
- Current Farming Stage: ${context.farmingStage}
- Current Topic: ${context.currentTopic}
- Total Messages in Session: ${session.messageCount}`

  if (context.recentQuestions.length > 0) {
    prompt += `\n- Recent Questions Asked: ${context.recentQuestions.slice(-5).join(', ')}`
  }

  if (context.lastRecommendations.length > 0) {
    prompt += `\n- Previous Recommendations Given: ${context.lastRecommendations.slice(-3).join(', ')}`
  }

  if (session.farmingData) {
    prompt += `\n\nFARMER PROFILE (DO NOT ASK FOR THIS INFORMATION AGAIN):
- Location: ${session.farmingData.location?.city}, ${session.farmingData.location?.province}
- Rice Variety: ${session.farmingData.crop?.variety}
- Growth Stage: ${session.farmingData.crop?.growthStage}
- Soil Type: ${session.farmingData.soil?.type}
- Current Weather: ${session.farmingData.weather?.currentConditions}`
  }

  prompt += `\n\nCURRENT USER MESSAGE: ${currentMessage}
  
RESPONSE GUIDELINES:
- If the user has already provided their location, crop details, or other farming information, acknowledge this and provide specific advice based on that information
- Do not ask for information they have already given
- If they ask follow-up questions, reference the context from their profile
- Be specific and actionable in your recommendations
- If they mention a problem, ask clarifying questions only if the context doesn't provide enough information`
  
  return prompt
}

export function updateContextFromResponse(sessionId: string, response: string, topic?: string): void {
  const session = sessionManager.getSession(sessionId)
  if (session) {
    if (topic) {
      sessionManager.updateConversationContext(sessionId, { currentTopic: topic })
    }
    
    // Extract key recommendations from response
    const recommendations = response.split('\n')
      .filter(line => {
        const trimmed = line.trim()
        return (trimmed.includes('•') || 
                trimmed.includes('-') || 
                trimmed.includes('*') ||
                trimmed.includes('1.') ||
                trimmed.includes('2.') ||
                trimmed.includes('3.') ||
                trimmed.includes('Recommendation:') ||
                trimmed.includes('Advice:') ||
                trimmed.includes('Tip:'))
      })
      .map(line => line.trim().replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''))
      .filter(line => line.length > 10 && line.length < 200) // Filter out too short or too long lines
      .slice(0, 3)
    
    if (recommendations.length > 0) {
      sessionManager.updateConversationContext(sessionId, {
        lastRecommendations: recommendations
      })
    }
    
    // Add bot response to session (not as a user message)
    sessionManager.addMessage(sessionId, response, false)
  }
}
