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

  addMessage(sessionId: string, message: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.messageCount++
      session.lastActive = new Date()
      
      // Update recent questions (keep last 5)
      session.conversationContext.recentQuestions.push(message)
      if (session.conversationContext.recentQuestions.length > 5) {
        session.conversationContext.recentQuestions.shift()
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
  let prompt = `User Context:
- Language: ${context.preferences.language}
- Region: ${context.preferences.region}
- Expertise Level: ${context.preferences.expertiseLevel}
- Current Farming Stage: ${context.farmingStage}
- Current Topic: ${context.currentTopic}`

  if (context.recentQuestions.length > 0) {
    prompt += `\n- Recent Questions: ${context.recentQuestions.slice(-3).join(', ')}`
  }

  if (context.lastRecommendations.length > 0) {
    prompt += `\n- Previous Recommendations: ${context.lastRecommendations.slice(-2).join(', ')}`
  }

  if (session.farmingData) {
    prompt += `\n- Farming Data: ${JSON.stringify(session.farmingData, null, 2)}`
  }

  prompt += `\n\nCurrent Message: ${currentMessage}`
  
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
      .filter(line => line.includes('•') || line.includes('-'))
      .slice(0, 3)
    
    if (recommendations.length > 0) {
      sessionManager.updateConversationContext(sessionId, {
        lastRecommendations: recommendations
      })
    }
  }
}
