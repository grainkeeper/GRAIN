import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bot, Send } from 'lucide-react'

export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GRAINKEEPER Chatbot</h1>
        <p className="text-muted-foreground">Get personalized farming advice from our AI assistant</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
            </CardTitle>
            <CardDescription>
              Your farming expert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-muted-foreground">Ready to help</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Conversations</span>
            </CardTitle>
            <CardDescription>
              Your chat history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Total chats</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Today's Chats</span>
            </CardTitle>
            <CardDescription>
              Recent conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat with GRAINKEEPER</CardTitle>
          <CardDescription>
            Ask questions about rice farming, weather, or yield predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-96 bg-muted rounded-lg p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">GRAINKEEPER</p>
                    <p className="text-sm text-muted-foreground">
                      Hello! I'm GRAINKEEPER, your rice farming assistant. How can I help you today?
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium">You</p>
                    <p className="text-sm text-muted-foreground">
                      What's the best time to plant rice in Nueva Ecija?
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">U</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">GRAINKEEPER</p>
                    <p className="text-sm text-muted-foreground">
                      For Nueva Ecija, the optimal planting window is typically March 15-22. 
                      This period offers the best weather conditions with moderate rainfall 
                      and temperatures ideal for rice growth. Would you like me to check 
                      the current weather forecast for this period?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
