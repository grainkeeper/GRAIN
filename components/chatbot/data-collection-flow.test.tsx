import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DataCollectionFlow from './data-collection-flow'

describe('DataCollectionFlow', () => {
  const mockOnComplete = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the data collection form', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/Farming Profile Setup/i)).toBeInTheDocument()
    expect(screen.getByText(/Location Information/i)).toBeInTheDocument()
  })

  it('shows location step by default', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/Location Information/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Province/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/City\/Municipality/i)).toBeInTheDocument()
  })

  it('allows navigation between steps', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Fill location step
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    // Go to next step
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Should show crop information step
    expect(screen.getByText(/Crop Information/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Rice Variety/i)).toBeInTheDocument()
  })

  it('allows going back to previous step', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Fill location and go to next step
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Go back
    const backButton = screen.getByText(/Back/i)
    fireEvent.click(backButton)
    
    // Should show location step again
    expect(screen.getByText(/Location Information/i)).toBeInTheDocument()
  })

  it('validates required fields', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Should show validation errors
    expect(screen.getByText(/Please select a province/i)).toBeInTheDocument()
    expect(screen.getByText(/Please enter a city/i)).toBeInTheDocument()
  })

  it('completes the entire flow successfully', async () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Step 1: Location
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Step 2: Crop Information
    await waitFor(() => {
      expect(screen.getByText(/Crop Information/i)).toBeInTheDocument()
    })
    
    const varietySelect = screen.getByLabelText(/Rice Variety/i)
    const plantingDateInput = screen.getByLabelText(/Planting Date/i)
    const growthStageSelect = screen.getByLabelText(/Current Growth Stage/i)
    
    fireEvent.change(varietySelect, { target: { value: 'NSIC Rc160' } })
    fireEvent.change(plantingDateInput, { target: { value: '2024-01-15' } })
    fireEvent.change(growthStageSelect, { target: { value: 'vegetative' } })
    
    fireEvent.click(screen.getByText(/Next/i))
    
    // Step 3: Soil Information
    await waitFor(() => {
      expect(screen.getByText(/Soil Information/i)).toBeInTheDocument()
    })
    
    const soilTypeSelect = screen.getByLabelText(/Soil Type/i)
    const moistureSelect = screen.getByLabelText(/Soil Moisture/i)
    const phInput = screen.getByLabelText(/Soil pH Level/i)
    
    fireEvent.change(soilTypeSelect, { target: { value: 'clay loam' } })
    fireEvent.change(moistureSelect, { target: { value: 'moderate' } })
    fireEvent.change(phInput, { target: { value: '6.5' } })
    
    fireEvent.click(screen.getByText(/Next/i))
    
    // Step 4: Weather Information
    await waitFor(() => {
      expect(screen.getByText(/Weather Information/i)).toBeInTheDocument()
    })
    
    const currentConditionsSelect = screen.getByLabelText(/Current Weather Conditions/i)
    const rainfallSelect = screen.getByLabelText(/Recent Rainfall/i)
    
    fireEvent.change(currentConditionsSelect, { target: { value: 'sunny' } })
    fireEvent.change(rainfallSelect, { target: { value: 'light' } })
    
    // Complete the setup
    fireEvent.click(screen.getByText(/Complete Setup/i))
    
    // Should call onComplete with the collected data
    expect(mockOnComplete).toHaveBeenCalledWith({
      location: {
        province: 'South Cotabato',
        city: 'General Santos City',
        barangay: ''
      },
      crop: {
        variety: 'NSIC Rc160',
        plantingDate: '2024-01-15',
        growthStage: 'vegetative'
      },
      soil: {
        type: 'clay loam',
        moisture: 'moderate',
        ph: '6.5'
      },
      weather: {
        currentConditions: 'sunny',
        rainfall: 'light'
      }
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByText(/Cancel/i)
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows progress indicator', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Should show step 1 of 4
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
    
    // Fill and go to next step
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Should show step 2 of 4
    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument()
    })
  })

  it('handles optional fields correctly', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Fill required fields
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    // Fill optional barangay field
    const barangayInput = screen.getByLabelText(/Barangay \(Optional\)/i)
    fireEvent.change(barangayInput, { target: { value: 'Barangay 1' } })
    
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Should proceed to next step
    waitFor(() => {
      expect(screen.getByText(/Crop Information/i)).toBeInTheDocument()
    })
  })

  it('validates date format', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Navigate to crop step
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Try invalid date
    const plantingDateInput = screen.getByLabelText(/Planting Date/i)
    fireEvent.change(plantingDateInput, { target: { value: 'invalid-date' } })
    
    // Should show validation error
    expect(screen.getByText(/Please enter a valid date/i)).toBeInTheDocument()
  })

  it('validates pH range', () => {
    render(<DataCollectionFlow onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    // Navigate to soil step
    const provinceSelect = screen.getByLabelText(/Province/i)
    const cityInput = screen.getByLabelText(/City\/Municipality/i)
    
    fireEvent.change(provinceSelect, { target: { value: 'South Cotabato' } })
    fireEvent.change(cityInput, { target: { value: 'General Santos City' } })
    
    let nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Fill crop step
    const varietySelect = screen.getByLabelText(/Rice Variety/i)
    const plantingDateInput = screen.getByLabelText(/Planting Date/i)
    const growthStageSelect = screen.getByLabelText(/Current Growth Stage/i)
    
    fireEvent.change(varietySelect, { target: { value: 'NSIC Rc160' } })
    fireEvent.change(plantingDateInput, { target: { value: '2024-01-15' } })
    fireEvent.change(growthStageSelect, { target: { value: 'vegetative' } })
    
    nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Try invalid pH
    const phInput = screen.getByLabelText(/Soil pH Level/i)
    fireEvent.change(phInput, { target: { value: '15' } })
    
    // Should show validation error
    expect(screen.getByText(/pH must be between 0 and 14/i)).toBeInTheDocument()
  })
})
