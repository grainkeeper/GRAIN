import { NextRequest, NextResponse } from 'next/server'
import { conversationExportService, ConversationExport } from '@/lib/services/conversation-export'
import { sessionManager } from '@/lib/services/session-management'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, format = 'txt' } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get session data
    const session = sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Create conversation export object
    const conversation: ConversationExport = {
      sessionId: session.sessionId,
      exportDate: new Date(),
      farmingData: session.farmingData,
      messages: [], // In real implementation, this would come from database
      summary: conversationExportService.generateSummary([], session.farmingData),
      metadata: {
        language: session.conversationContext.preferences.language,
        region: session.conversationContext.preferences.region,
        expertiseLevel: session.conversationContext.preferences.expertiseLevel,
        duration: `${Math.round((Date.now() - session.createdAt.getTime()) / (1000 * 60))} minutes`
      }
    }

    // Generate export based on format
    let exportData
    switch (format) {
      case 'json':
        exportData = conversationExportService.exportToJSON(conversation)
        break
      case 'csv':
        exportData = conversationExportService.exportToCSV(conversation)
        break
      case 'txt':
      default:
        exportData = conversationExportService.exportToTXT(conversation)
        break
    }

    // Generate shareable link
    const shareableLink = conversationExportService.createShareableLink(conversation)

    return NextResponse.json({
      success: true,
      export: {
        format: exportData.type,
        filename: exportData.filename,
        content: exportData.content,
        shareableLink
      },
      summary: conversation.summary
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const format = searchParams.get('format') || 'txt'

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get session data
    const session = sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Create conversation export object
    const conversation: ConversationExport = {
      sessionId: session.sessionId,
      exportDate: new Date(),
      farmingData: session.farmingData,
      messages: [], // In real implementation, this would come from database
      summary: conversationExportService.generateSummary([], session.farmingData),
      metadata: {
        language: session.conversationContext.preferences.language,
        region: session.conversationContext.preferences.region,
        expertiseLevel: session.conversationContext.preferences.expertiseLevel,
        duration: `${Math.round((Date.now() - session.createdAt.getTime()) / (1000 * 60))} minutes`
      }
    }

    // Generate export based on format
    let exportData
    switch (format) {
      case 'json':
        exportData = conversationExportService.exportToJSON(conversation)
        break
      case 'csv':
        exportData = conversationExportService.exportToCSV(conversation)
        break
      case 'txt':
      default:
        exportData = conversationExportService.exportToTXT(conversation)
        break
    }

    // Return file download
    const response = new NextResponse(exportData.content as string)
    response.headers.set('Content-Type', 'text/plain')
    response.headers.set('Content-Disposition', `attachment; filename="${exportData.filename}"`)
    
    return response

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    )
  }
}
