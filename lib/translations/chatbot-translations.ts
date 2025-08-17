export type Language = 'en' | 'tl'

export interface ChatbotTranslations {
  welcome: string
  placeholder: string
  send: string
  quickActions: {
    weather: string
    location: string
    irrigation: string
    yield: string
    profile: string
  }
  dataCollection: {
    title: string
    location: {
      title: string
      province: string
      city: string
      barangay: string
    }
    crop: {
      title: string
      variety: string
      plantingDate: string
      growthStage: string
    }
    soil: {
      title: string
      type: string
      moisture: string
      ph: string
    }
    weather: {
      title: string
      currentConditions: string
      rainfall: string
    }
    buttons: {
      next: string
      back: string
      complete: string
      cancel: string
    }
  }
  messages: {
    typing: string
    error: string
    profileComplete: string
  }
  systemPrompts: {
    en: string
    tl: string
  }
}

export const TRANSLATIONS: Record<Language, ChatbotTranslations> = {
  en: {
    welcome: "Hello! I'm GRAINKEEPER, your AI farming assistant. I can help you with rice farming advice, weather recommendations, and yield optimization. What would you like to know?",
    placeholder: "Type your message here...",
    send: "Send",
    quickActions: {
      weather: "Weather Forecast",
      location: "Set Location",
      irrigation: "Irrigation Advice",
      yield: "Yield Prediction",
      profile: "Setup Profile"
    },
    dataCollection: {
      title: "Farming Profile Setup",
      location: {
        title: "Location Information",
        province: "Province",
        city: "City/Municipality",
        barangay: "Barangay (Optional)"
      },
      crop: {
        title: "Crop Information",
        variety: "Rice Variety",
        plantingDate: "Planting Date",
        growthStage: "Current Growth Stage"
      },
      soil: {
        title: "Soil Information",
        type: "Soil Type",
        moisture: "Soil Moisture",
        ph: "Soil pH Level"
      },
      weather: {
        title: "Weather Information",
        currentConditions: "Current Weather Conditions",
        rainfall: "Recent Rainfall"
      },
      buttons: {
        next: "Next",
        back: "Back",
        complete: "Complete Setup",
        cancel: "Cancel"
      }
    },
    messages: {
      typing: "GRAINKEEPER is typing...",
      error: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      profileComplete: "Perfect! I now have your farming profile. I can now provide personalized recommendations based on your specific conditions. What would you like to know about?"
    },
    systemPrompts: {
      en: `You are GRAINKEEPER, an AI farming assistant specialized in rice farming in the Philippines, with particular expertise in Region 12 (SOCCSKSARGEN). 
      
      Key Knowledge Areas:
      - Planting seasons and timing for different regions
      - Irrigation management and water conservation
      - Fertilizer application and soil management
      - Pest and disease control
      - Harvest and post-harvest practices
      - Weather adaptation strategies
      - Rice variety selection
      
      Provide helpful, practical advice based on scientific farming practices. Keep responses concise and encouraging.`,
      tl: `Ikaw ay GRAINKEEPER, isang AI farming assistant na dalubhasa sa rice farming sa Pilipinas, na may partikular na kadalubhasaan sa Region 12 (SOCCSKSARGEN).
      
      Mga Pangunahing Kaalaman:
      - Mga panahon ng pagtatanim at timing para sa iba't ibang rehiyon
      - Pamamahala ng irigasyon at pagtitipid ng tubig
      - Paglalapat ng pataba at pamamahala ng lupa
      - Kontrol ng peste at sakit
      - Mga gawi sa pag-aani at post-harvest
      - Mga estratehiya sa pag-angkop sa panahon
      - Pagpili ng uri ng bigas
      
      Magbigay ng kapaki-pakinabang, praktikal na payo batay sa siyentipikong farming practices. Panatilihing maikli at nakakapagpasigla ang mga sagot.`
    }
  },
  tl: {
    welcome: "Kamusta! Ako si GRAINKEEPER, ang iyong AI farming assistant. Makatutulong ako sa rice farming advice, weather recommendations, at yield optimization. Ano ang gusto mong malaman?",
    placeholder: "I-type ang iyong mensahe dito...",
    send: "Ipadala",
    quickActions: {
      weather: "Weather Forecast",
      location: "Itakda ang Lokasyon",
      irrigation: "Payo sa Irigasyon",
      yield: "Hula sa Yield",
      profile: "I-setup ang Profile"
    },
    dataCollection: {
      title: "Setup ng Farming Profile",
      location: {
        title: "Impormasyon sa Lokasyon",
        province: "Lalawigan",
        city: "Lungsod/Bayan",
        barangay: "Barangay (Opsiyonal)"
      },
      crop: {
        title: "Impormasyon sa Tanim",
        variety: "Uri ng Bigas",
        plantingDate: "Petsa ng Pagtatanim",
        growthStage: "Kasalukuyang Growth Stage"
      },
      soil: {
        title: "Impormasyon sa Lupa",
        type: "Uri ng Lupa",
        moisture: "Kahalumigmigan ng Lupa",
        ph: "Antas ng pH ng Lupa"
      },
      weather: {
        title: "Impormasyon sa Panahon",
        currentConditions: "Kasalukuyang Kondisyon ng Panahon",
        rainfall: "Kamakailang Pag-ulan"
      },
      buttons: {
        next: "Susunod",
        back: "Bumalik",
        complete: "Kumpletuhin ang Setup",
        cancel: "Kanselahin"
      }
    },
    messages: {
      typing: "Nagta-type si GRAINKEEPER...",
      error: "Humihingi ako ng paumanhin, ngunit may problema ako sa pagproseso ng iyong kahilingan ngayon. Pakisubukan ulit sa ilang sandali.",
      profileComplete: "Perpekto! Mayroon na akong iyong farming profile. Maaari na akong magbigay ng personalized na mga rekomendasyon batay sa iyong partikular na kondisyon. Ano ang gusto mong malaman?"
    },
    systemPrompts: {
      en: `You are GRAINKEEPER, an AI farming assistant specialized in rice farming in the Philippines, with particular expertise in Region 12 (SOCCSKSARGEN). 
      
      Key Knowledge Areas:
      - Planting seasons and timing for different regions
      - Irrigation management and water conservation
      - Fertilizer application and soil management
      - Pest and disease control
      - Harvest and post-harvest practices
      - Weather adaptation strategies
      - Rice variety selection
      
      Provide helpful, practical advice based on scientific farming practices. Keep responses concise and encouraging.`,
      tl: `Ikaw ay GRAINKEEPER, isang AI farming assistant na dalubhasa sa rice farming sa Pilipinas, na may partikular na kadalubhasaan sa Region 12 (SOCCSKSARGEN).
      
      Mga Pangunahing Kaalaman:
      - Mga panahon ng pagtatanim at timing para sa iba't ibang rehiyon
      - Pamamahala ng irigasyon at pagtitipid ng tubig
      - Paglalapat ng pataba at pamamahala ng lupa
      - Kontrol ng peste at sakit
      - Mga gawi sa pag-aani at post-harvest
      - Mga estratehiya sa pag-angkop sa panahon
      - Pagpili ng uri ng bigas
      
      Magbigay ng kapaki-pakinabang, praktikal na payo batay sa siyentipikong farming practices. Panatilihing maikli at nakakapagpasigla ang mga sagot.`
    }
  }
}

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.')
  let value: any = TRANSLATIONS[language]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

export function getSystemPrompt(language: Language): string {
  return TRANSLATIONS[language].systemPrompts[language]
}
