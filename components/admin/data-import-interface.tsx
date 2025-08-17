'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react'

type DataType = 'historical' | 'farm_profiles' | 'weather' | 'chatbot_knowledge'

export function DataImportInterface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dataType, setDataType] = useState<DataType>('historical')
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setMessage(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setMessage(null)

    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({
        type: 'success',
        text: `Successfully imported ${dataType} data from ${selectedFile.name}`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Import failed. Please check your file format and try again.'
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    setMessage(null)

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create dummy CSV content
      const csvContent = `province,region,date,data_source\nSample Province,Sample Region,2024-01-01,PAGASA`
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: `Successfully exported ${dataType} data`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Export failed. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Import/Export</h2>
        <p className="text-muted-foreground">
          Import and export data in CSV format for various GrainKeeper entities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Upload CSV files to import data into the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-type">Data Type</Label>
              <Select value={dataType} onValueChange={(value: DataType) => setDataType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical Geo-Climatic Data</SelectItem>
                  <SelectItem value="farm_profiles">Farm Profiles</SelectItem>
                  <SelectItem value="weather">Weather Data</SelectItem>
                  <SelectItem value="chatbot_knowledge">Chatbot Knowledge Base</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            <Button 
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="w-full"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Export data from the system in CSV format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-data-type">Data Type</Label>
              <Select value={dataType} onValueChange={(value: DataType) => setDataType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical Geo-Climatic Data</SelectItem>
                  <SelectItem value="farm_profiles">Farm Profiles</SelectItem>
                  <SelectItem value="weather">Weather Data</SelectItem>
                  <SelectItem value="chatbot_knowledge">Chatbot Knowledge Base</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Data Type Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Type Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Historical Geo-Climatic Data</h4>
              <p className="text-sm text-muted-foreground">
                Weather and climate data from 2010-2024 including temperature, rainfall, humidity, and rice yield data.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Farm Profiles</h4>
              <p className="text-sm text-muted-foreground">
                Farmer and farm information including location, soil type, farm size, and contact details.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Weather Data</h4>
              <p className="text-sm text-muted-foreground">
                Real-time weather information including current conditions and forecasts.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Chatbot Knowledge Base</h4>
              <p className="text-sm text-muted-foreground">
                Farming advice and recommendations for the AI chatbot.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

