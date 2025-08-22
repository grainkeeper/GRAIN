// Philippine Regions Mapping
// Maps PSGC region codes to proper Philippine region names

export const PHILIPPINE_REGIONS: Record<string, string> = {
  // Region I - Ilocos Region
  '1000000000': 'Region I - Ilocos Region',
  '100000000': 'Region I - Ilocos Region',
  
  // Region II - Cagayan Valley  
  '2000000000': 'Region II - Cagayan Valley',
  '200000000': 'Region II - Cagayan Valley',
  
  // Region III - Central Luzon
  '3000000000': 'Region III - Central Luzon', 
  '300000000': 'Region III - Central Luzon',
  
  // Region IV-A - Calabarzon
  '4000000000': 'Region IV-A - Calabarzon',
  '400000000': 'Region IV-A - Calabarzon',
  
  // Region IV-B - Mimaropa
  '1700000000': 'Region IV-B - Mimaropa',
  '170000000': 'Region IV-B - Mimaropa',
  
  // Region V - Bicol Region
  '5000000000': 'Region V - Bicol Region',
  '500000000': 'Region V - Bicol Region',
  
  // Region VI - Western Visayas
  '6000000000': 'Region VI - Western Visayas',
  '600000000': 'Region VI - Western Visayas',
  
  // Region VII - Central Visayas
  '7000000000': 'Region VII - Central Visayas',
  '700000000': 'Region VII - Central Visayas',
  
  // Region VIII - Eastern Visayas
  '8000000000': 'Region VIII - Eastern Visayas',
  '800000000': 'Region VIII - Eastern Visayas',
  
  // Region IX - Zamboanga Peninsula
  '9000000000': 'Region IX - Zamboanga Peninsula',
  '900000000': 'Region IX - Zamboanga Peninsula',
  
  // Region X - Northern Mindanao
  '10000000000': 'Region X - Northern Mindanao',
  '1000000000': 'Region X - Northern Mindanao',
  '1900000000': 'Region X - Northern Mindanao',
  
  // Region XI - Davao Region
  '11000000000': 'Region XI - Davao Region',
  '1100000000': 'Region XI - Davao Region',
  
  // Region XII - Soccsksargen
  '12000000000': 'Region XII - Soccsksargen',
  '1200000000': 'Region XII - Soccsksargen',
  
  // Region XIII - Caraga
  '13000000000': 'Region XIII - Caraga',
  '1300000000': 'Region XIII - Caraga',
  
  // NCR - National Capital Region
  '14000000000': 'NCR - National Capital Region',
  '1400000000': 'NCR - National Capital Region',
  
  // CAR - Cordillera Administrative Region
  '15000000000': 'CAR - Cordillera Administrative Region',
  '1500000000': 'CAR - Cordillera Administrative Region',
  
  // BARMM - Bangsamoro Autonomous Region in Muslim Mindanao
  '16000000000': 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
  '1600000000': 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao'
}

export function getRegionName(psgcCode: string): string {
  return PHILIPPINE_REGIONS[psgcCode] || psgcCode
}

export function getRegionShortName(psgcCode: string): string {
  const fullName = getRegionName(psgcCode)
  const match = fullName.match(/^(Region [IVX]+|[A-Z]+) - (.+)$/)
  return match ? match[1] : fullName
}

export function getRegionFullName(psgcCode: string): string {
  const fullName = getRegionName(psgcCode)
  const match = fullName.match(/^(Region [IVX]+|[A-Z]+) - (.+)$/)
  return match ? match[2] : fullName
}

// Region codes for filtering
export const REGION_CODES = Object.keys(PHILIPPINE_REGIONS).sort()

// Region options for dropdowns
export const REGION_OPTIONS = REGION_CODES.map(code => ({
  code,
  name: getRegionName(code),
  shortName: getRegionShortName(code),
  fullName: getRegionFullName(code)
})).sort((a, b) => a.name.localeCompare(b.name))
