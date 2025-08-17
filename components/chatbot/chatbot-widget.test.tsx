import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatbotWidget from './chatbot-widget'

// Mock the API calls
global.fetch = jest.fn()

describe('ChatbotWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chatbot toggle button', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('opens chatbot when toggle button is clicked', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    
    fireEvent.click(toggleButton)
    
    expect(screen.getByText(/GRAINKEEPER/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument()
  })

  it('closes chatbot when close button is clicked', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    
    // Open chatbot
    fireEvent.click(toggleButton)
    expect(screen.getByText(/GRAINKEEPER/i)).toBeInTheDocument()
    
    // Close chatbot
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(screen.queryByText(/GRAINKEEPER/i)).not.toBeInTheDocument()
  })

  it('displays welcome message when opened', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    
    fireEvent.click(toggleButton)
    
    expect(screen.getByText(/Hello! I'm GRAINKEEPER/i)).toBeInTheDocument()
  })

  it('shows quick action buttons', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    
    fireEvent.click(toggleButton)
    
    expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument()
    expect(screen.getByText(/Set Location/i)).toBeInTheDocument()
    expect(screen.getByText(/Irrigation Advice/i)).toBeInTheDocument()
    expect(screen.getByText(/Yield Prediction/i)).toBeInTheDocument()
  })

  it('allows user to type and send messages', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        response: {
          text: 'Thank you for your message!',
          confidence: 0.8,
          recommendations: [],
          weatherAlert: false,
          nextActions: []
        }
      })
    })

    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const input = screen.getByPlaceholderText(/type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Hello, I need help with rice farming' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello, I need help with rice farming')).toBeInTheDocument()
    })
  })

  it('shows typing indicator when sending message', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          success: true,
          response: { text: 'Response', confidence: 0.8, recommendations: [], weatherAlert: false, nextActions: [] }
        })
      }), 100))
    )

    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const input = screen.getByPlaceholderText(/type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    expect(screen.getByText(/GRAINKEEPER is typing/i)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const input = screen.getByPlaceholderText(/type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/I apologize, but I'm having trouble/i)).toBeInTheDocument()
    })
  })

  it('opens data collection flow when profile button is clicked', () => {
    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const profileButton = screen.getByText(/Setup Profile/i)
    fireEvent.click(profileButton)
    
    expect(screen.getByText(/Farming Profile Setup/i)).toBeInTheDocument()
  })

  it('handles quick action button clicks', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        response: {
          text: 'Weather forecast for your area...',
          confidence: 0.8,
          recommendations: [],
          weatherAlert: false,
          nextActions: []
        }
      })
    })

    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const weatherButton = screen.getByText(/Weather Forecast/i)
    fireEvent.click(weatherButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Weather forecast for your area/i)).toBeInTheDocument()
    })
  })

  it('maintains conversation history', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          response: { text: 'First response', confidence: 0.8, recommendations: [], weatherAlert: false, nextActions: [] }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          response: { text: 'Second response', confidence: 0.8, recommendations: [], weatherAlert: false, nextActions: [] }
        })
      })

    render(<ChatbotWidget />)
    const toggleButton = screen.getByRole('button', { name: /chat/i })
    fireEvent.click(toggleButton)
    
    const input = screen.getByPlaceholderText(/type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    // Send first message
    fireEvent.change(input, { target: { value: 'First message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument()
    })
    
    // Send second message
    fireEvent.change(input, { target: { value: 'Second message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Second response')).toBeInTheDocument()
      expect(screen.getByText('First response')).toBeInTheDocument()
    })
  })
})
