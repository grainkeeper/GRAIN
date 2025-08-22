// Philippine Provinces PSGC Mapping
// Maps PSGC codes to proper Philippine province names
// Based on analysis of all files in provdist-sources directory

export const PSGC_TO_PROVINCE: Record<string, string> = {
  // Region I - Ilocos Region
  '100130000': 'Ilocos Norte',
  '100140000': 'Ilocos Sur',
  '100150000': 'La Union',
  '100160000': 'Pangasinan',
  '102800000': 'Ilocos Norte',
  '102900000': 'Ilocos Sur',
  '103300000': 'La Union',
  '105500000': 'Pangasinan',
  
  // Region II - Cagayan Valley
  '200130000': 'Batanes',
  '200140000': 'Cagayan',
  '200150000': 'Isabela',
  '200160000': 'Nueva Vizcaya',
  '200170000': 'Quirino',
  '200900000': 'Batanes',
  '201500000': 'Cagayan',
  '203100000': 'Isabela',
  '205000000': 'Nueva Vizcaya',
  '205700000': 'Quirino',
  
  // Region III - Central Luzon
  '300800000': 'Aurora',
  '301400000': 'Bulacan',
  '304900000': 'Nueva Ecija',
  '305400000': 'Pampanga',
  '306900000': 'Tarlac',
  '307100000': 'Zambales',
  '307700000': 'Aurora',
  
  // Region IV-A - Calabarzon
  '401000000': 'Batangas',
  '402100000': 'Cavite',
  '403400000': 'Laguna',
  '405600000': 'Quezon',
  '405800000': 'Rizal',
  
  // Region IV-B - Mimaropa
  '1704000000': 'Marinduque',
  '1705100000': 'Occidental Mindoro',
  '1705200000': 'Oriental Mindoro',
  '1705300000': 'Palawan',
  '1705900000': 'Romblon',
  
  // Region V - Bicol Region
  '500500000': 'Albay',
  '501600000': 'Camarines Norte',
  '501700000': 'Camarines Sur',
  '502000000': 'Catanduanes',
  '504100000': 'Masbate',
  '506200000': 'Sorsogon',
  
  // Region VI - Western Visayas
  '600400000': 'Aklan',
  '600600000': 'Antique',
  '601900000': 'Capiz',
  '603000000': 'Guimaras',
  '604500000': 'Iloilo',
  '607900000': 'Negros Occidental',
  
  // Region VII - Central Visayas
  '701200000': 'Bohol',
  '702200000': 'Cebu',
  '704600000': 'Negros Oriental',
  '706100000': 'Siquijor',
  
  // Region VIII - Eastern Visayas
  '803700000': 'Biliran',
  '804800000': 'Eastern Samar',
  '806000000': 'Leyte',
  '806400000': 'Northern Samar',
  '807800000': 'Samar',
  
  // Region IX - Zamboanga Peninsula
  '907200000': 'Zamboanga del Norte',
  '907300000': 'Zamboanga del Sur',
  '908300000': 'Zamboanga Sibugay',
  
  // Region X - Northern Mindanao
  '1001300000': 'Bukidnon',
  '1001800000': 'Camiguin', 
  '1003500000': 'Lanao del Norte',
  '1004200000': 'Misamis Occidental',
  '1004300000': 'Misamis Oriental',
  
  // Region XI - Davao Region
  '1102300000': 'Davao de Norte',
  '1102400000': 'Davao del Sur',
  '1102500000': 'Davao Oriental',
  '1108200000': 'Davao de Oro',
  '1108600000': 'Davao Occidental',
  
  // Region XII - Soccsksargen
  '1204700000': 'Cotabato',
  '1206300000': 'South Cotabato',
  '1206500000': 'Sultan Kudarat',
  '1208000000': 'Sarangani',
  
  // Region XIII - Caraga
  '1303900000': 'Agusan del Norte',
  '1307400000': 'Agusan del Sur',
  '1307500000': 'Dinagat Islands',
  '1307600000': 'Surigao del Norte',
  
  // NCR - National Capital Region
  '1400100000': 'Abra',
  '1401100000': 'Benguet',
  '1402700000': 'Ifugao',
  '1403200000': 'Kalinga',
  '1404400000': 'Mountain Province',
  '1408100000': 'Apayao',
  
  // CAR - Cordillera Administrative Region
  '1600200000': 'Agusan del Norte',
  '1600300000': 'Agusan del Sur',
  '1606700000': 'Surigao del Norte',
  '1606800000': 'Surigao del Sur',
  '1608500000': 'Dinagat Islands',
  
  // BARMM - Bangsamoro Autonomous Region in Muslim Mindanao
  '1900700000': 'Basilan',
  '1903600000': 'Lanao del Sur',
  '1906600000': 'Sulu',
  '1907000000': 'Tawi-Tawi',
  '1908700000': 'Maguindanao del Norte',
  '1908800000': 'Maguindanao del Sur',
  
}

export function getProvinceName(psgcCode: string): string {
  return PSGC_TO_PROVINCE[psgcCode] || psgcCode
}

export function getProvinceNameFromAdm2(adm2Psgc: string): string {
  // Handle both 9-digit and 10-digit codes
  const normalized = adm2Psgc.length === 10 ? 
    (adm2Psgc.slice(0, 2) + adm2Psgc.slice(3)).slice(0, 9) : 
    adm2Psgc
  
  return PSGC_TO_PROVINCE[normalized] || adm2Psgc
}
