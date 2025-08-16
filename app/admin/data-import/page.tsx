import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react'

export default function DataImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Import</h1>
          <p className="text-muted-foreground">Import farmer data and yield information via CSV/Excel</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Successful imports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Imported</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Import errors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Farmer Data</CardTitle>
            <CardDescription>
              Upload CSV/Excel files with farmer information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your CSV/Excel file here, or click to browse
                </p>
                <Button variant="outline">Choose File</Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Supported formats: .csv, .xlsx, .xls (Max 10MB)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Yield Data</CardTitle>
            <CardDescription>
              Upload historical yield and prediction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your yield data file here, or click to browse
                </p>
                <Button variant="outline">Choose File</Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Supported formats: .csv, .xlsx, .xls (Max 10MB)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Templates</CardTitle>
          <CardDescription>
            Download sample templates for data import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4" />
                <h4 className="font-medium">Farmer Data Template</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Template for importing farmer information including contact details, location, and farm size.
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download CSV
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4" />
                <h4 className="font-medium">Yield Data Template</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Template for importing historical yield data with weather conditions and farming practices.
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download CSV
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4" />
                <h4 className="font-medium">Weather Data Template</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Template for importing weather data including temperature, rainfall, and humidity.
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Track your recent data imports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg">
              <div className="p-4 text-center text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2" />
                <p>No import history found. Start by uploading your first data file.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
