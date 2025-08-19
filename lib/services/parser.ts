import * as XLSX from 'xlsx'

export type ParseResult = {
  headers: string[]
  rowCount: number
  errors: { row: number; column?: string; message: string }[]
  summary?: {
    uniqueProvinces: string[]
    uniqueYears: number[]
    uniqueQuarters: number[]
    provinceCount: number
    yearCount: number
    quarterCount: number
    dataCoverage: {
      provinces: number
      years: number
      quarters: number
    }
  }
}

const REQUIRED_COLUMNS = ['province', 'year', 'quarter', 'yield']

export async function parseCsvOrXlsx(file: Buffer): Promise<string[][]> {
  // Try CSV first by sniffing
  const asString = file.toString('utf-8')
  if (asString.includes(',') || asString.includes('\n')) {
    return asString
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.split(','))
  }
  const wb = XLSX.read(file, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<string[]>({ ...ws, '!ref': ws['!ref'] as string }, { header: 1 }) as string[][]
  return data
}

export function validateGrid(rows: string[][]): ParseResult {
  const errors: ParseResult['errors'] = []
  if (rows.length === 0) return { headers: [], rowCount: 0, errors: [{ row: 0, message: 'Empty file' }] }
  
  const headers = rows[0].map((h) => String(h).trim().toLowerCase())
  for (const req of REQUIRED_COLUMNS) {
    if (!headers.includes(req)) errors.push({ row: 0, column: req, message: `Missing required column: ${req}` })
  }
  
  const colIndex = (name: string) => headers.indexOf(name)
  const idxProvince = colIndex('province')
  const idxYear = colIndex('year')
  const idxQuarter = colIndex('quarter')
  const idxYield = colIndex('yield')
  
  const provinces = new Set<string>()
  const years = new Set<number>()
  const quarters = new Set<number>()
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r || r.every((c) => String(c || '').trim() === '')) continue
    
    if (!r[idxProvince]) {
      errors.push({ row: i + 1, column: 'province', message: 'Province is required' })
    } else {
      provinces.add(String(r[idxProvince]).trim())
    }
    
    const y = Number(r[idxYear])
    if (!Number.isFinite(y) || y < 2000 || y > 2100) {
      errors.push({ row: i + 1, column: 'year', message: 'Invalid year' })
    } else {
      years.add(y)
    }
    
    const q = Number(r[idxQuarter])
    if (![1, 2, 3, 4].includes(q)) {
      errors.push({ row: i + 1, column: 'quarter', message: 'Quarter must be 1-4' })
    } else {
      quarters.add(q)
    }
    
    const yld = Number(r[idxYield])
    if (!Number.isFinite(yld) || yld < 0) {
      errors.push({ row: i + 1, column: 'yield', message: 'Yield must be >= 0' })
    }
  }
  
  const summary = {
    uniqueProvinces: Array.from(provinces).sort(),
    uniqueYears: Array.from(years).sort((a, b) => a - b),
    uniqueQuarters: Array.from(quarters).sort((a, b) => a - b),
    provinceCount: provinces.size,
    yearCount: years.size,
    quarterCount: quarters.size,
    dataCoverage: {
      provinces: provinces.size,
      years: years.size,
      quarters: quarters.size
    }
  }
  
  return { 
    headers, 
    rowCount: rows.length - 1, 
    errors: errors.slice(0, 100),
    summary
  }
}


