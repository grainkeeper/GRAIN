import { createClient } from '@/lib/supabase/client'

export interface UserAnalyticsEvent {
  interactionType: string
  interactionSubtype?: string
  interactionSessionId?: string
  userLocationProvince?: string
  userLocationRegion?: string
  interactionContext?: Record<string, any>
  deviceInfo?: Record<string, any>
  interactionDurationSeconds?: number
  interactionSuccess?: boolean
  userSatisfactionScore?: number
  featureUsed?: string
  featureVersion?: string
  featurePerformanceMs?: number
  userIntent?: string
  userFlowPath?: string[]
  userEngagementLevel?: 'low' | 'medium' | 'high'
}

export class UserAnalyticsService {
  private supabase = createClient()
  private sessionId: string | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') return {}
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    }
  }

  async trackEvent(event: UserAnalyticsEvent): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      // Get user's farm profile
      const { data: farmProfile } = await this.supabase
        .from('user_farm_profiles')
        .select('id, province, region')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      const analyticsRecord = {
        user_id: user.id,
        farm_profile_id: farmProfile?.id || null,
        interaction_type: event.interactionType,
        interaction_subtype: event.interactionSubtype || null,
        interaction_session_id: event.interactionSessionId || this.sessionId,
        user_location_province: event.userLocationProvince || farmProfile?.province || null,
        user_location_region: event.userLocationRegion || farmProfile?.region || null,
        interaction_context: event.interactionContext || {},
        device_info: event.deviceInfo || this.getDeviceInfo(),
        interaction_duration_seconds: event.interactionDurationSeconds || null,
        interaction_success: event.interactionSuccess || null,
        user_satisfaction_score: event.userSatisfactionScore || null,
        feature_used: event.featureUsed || null,
        feature_version: event.featureVersion || null,
        feature_performance_ms: event.featurePerformanceMs || null,
        user_intent: event.userIntent || null,
        user_flow_path: event.userFlowPath || [],
        user_engagement_level: event.userEngagementLevel || null,
        interaction_timestamp: new Date().toISOString()
      }

      await this.supabase
        .from('user_analytics')
        .insert(analyticsRecord)

    } catch (error) {
      console.error('Failed to track user analytics event:', error)
      // Don't throw error to avoid breaking user experience
    }
  }

  // Convenience methods for common events
  async trackPageView(page: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      interactionType: 'page_view',
      interactionSubtype: 'navigation',
      featureUsed: page,
      interactionContext: context,
      interactionSuccess: true
    })
  }

  async trackPredictionCalculation(
    calculationData: any,
    performanceMs: number,
    success: boolean
  ): Promise<void> {
    await this.trackEvent({
      interactionType: 'prediction',
      interactionSubtype: 'calculation',
      featureUsed: 'yield_prediction',
      featurePerformanceMs: performanceMs,
      interactionSuccess: success,
      interactionContext: {
        riceVariety: calculationData.riceVariety,
        year: calculationData.year,
        hectares: calculationData.hectares,
        location: calculationData.location
      }
    })
  }

  async trackCalculationSave(calculationId: string, calculationName: string): Promise<void> {
    await this.trackEvent({
      interactionType: 'prediction',
      interactionSubtype: 'save_calculation',
      featureUsed: 'save_calculation',
      interactionSuccess: true,
      interactionContext: {
        calculationId,
        calculationName
      }
    })
  }

  async trackMapInteraction(
    interactionType: 'view' | 'zoom' | 'click' | 'search',
    location?: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      interactionType: 'map_interaction',
      interactionSubtype: interactionType,
      featureUsed: 'map',
      interactionContext: {
        location,
        ...context
      },
      interactionSuccess: true
    })
  }

  async trackChatbotInteraction(
    messageType: 'user_message' | 'bot_response',
    messageLength?: number,
    satisfactionScore?: number
  ): Promise<void> {
    await this.trackEvent({
      interactionType: 'chatbot',
      interactionSubtype: messageType,
      featureUsed: 'chatbot',
      interactionContext: {
        messageLength
      },
      userSatisfactionScore: satisfactionScore,
      interactionSuccess: true
    })
  }

  async trackFeatureUsage(
    feature: string,
    success: boolean = true,
    performanceMs?: number,
    context?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      interactionType: 'feature_usage',
      interactionSubtype: 'interaction',
      featureUsed: feature,
      featurePerformanceMs: performanceMs,
      interactionSuccess: success,
      interactionContext: context
    })
  }

  async trackUserSatisfaction(
    feature: string,
    score: number,
    context?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      interactionType: 'satisfaction',
      interactionSubtype: 'rating',
      featureUsed: feature,
      userSatisfactionScore: score,
      interactionContext: context,
      interactionSuccess: true
    })
  }
}

// Create a singleton instance
export const userAnalytics = new UserAnalyticsService()

