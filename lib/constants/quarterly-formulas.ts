/**
 * Quarterly MLR Formulas for Rice Yield Prediction
 * 
 * These formulas have been tested to provide 96.01% accuracy for rice yield prediction.
 * Each formula uses geoclimatic variables that will be replaced by actual weather data:
 * - T = Temperature (from 2025-2100 weather data)
 * - D = Dew Point (from 2025-2100 weather data)
 * - P = Precipitation (from 2025-2100 weather data)
 * - W = Wind Speed (from 2025-2100 weather data)
 * - H = Humidity (from 2025-2100 weather data)
 */

export interface QuarterlyFormula {
  quarter: 1 | 2 | 3 | 4;
  name: string;
  formula: string;
  coefficients: {
    temperature: number;  // Coefficient for T (Temperature)
    dewPoint: number;     // Coefficient for D (Dew Point)
    precipitation: number; // Coefficient for P (Precipitation)
    windSpeed: number;     // Coefficient for W (Wind Speed)
    humidity: number;      // Coefficient for H (Humidity)
    constant: number;      // Constant term
  };
}

export const QUARTERLY_FORMULAS: QuarterlyFormula[] = [
  {
    quarter: 1,
    name: "Quarter 1 Formula",
    formula: "Ŷ = 8478.474259T - 16643.35313D + 36502.00765P - 5998.639807W - 787.357142H + 420307.9461",
    coefficients: {
      temperature: 8478.474259,
      dewPoint: -16643.35313,
      precipitation: 36502.00765,
      windSpeed: -5998.639807,
      humidity: -787.357142,
      constant: 420307.9461
    }
  },
  {
    quarter: 2,
    name: "Quarter 2 Formula",
    formula: "Ŷ = -3835.953799T - 6149.597523D - 4483.424128P - 2593.991107W - 8024.420014H + 1067116.384",
    coefficients: {
      temperature: -3835.953799,
      dewPoint: -6149.597523,
      precipitation: -4483.424128,
      windSpeed: -2593.991107,
      humidity: -8024.420014,
      constant: 1067116.384
    }
  },
  {
    quarter: 3,
    name: "Quarter 3 Formula",
    formula: "Ŷ = 16630.77076T - 1018.254139D + 403.126612P + 74623.00801W + 25918.43338H - 2410001.76",
    coefficients: {
      temperature: 16630.77076,
      dewPoint: -1018.254139,
      precipitation: 403.126612,
      windSpeed: 74623.00801,
      humidity: 25918.43338,
      constant: -2410001.76
    }
  },
  {
    quarter: 4,
    name: "Quarter 4 Formula",
    formula: "Ŷ = 8993.693672T + 5844.061829D - 30748.53656P - 33023.39764W - 1155.458549H + 410764.6506",
    coefficients: {
      temperature: 8993.693672,
      dewPoint: 5844.061829,
      precipitation: -30748.53656,
      windSpeed: -33023.39764,
      humidity: -1155.458549,
      constant: 410764.6506
    }
  }
];

/**
 * Calculate predicted yield for a specific quarter using the MLR formula
 * @param quarter - The quarter (1-4)
 * @param weatherData - Weather data from 2025-2100 dataset containing T, D, P, W, H values
 * @returns Predicted yield value
 */
export function calculateQuarterlyYield(
  quarter: 1 | 2 | 3 | 4,
  weatherData: {
    temperature: number;  // T value from 2025-2100 weather data
    dewPoint: number;     // D value from 2025-2100 weather data
    precipitation: number; // P value from 2025-2100 weather data
    windSpeed: number;     // W value from 2025-2100 weather data
    humidity: number;      // H value from 2025-2100 weather data
  }
): number {
  const formula = QUARTERLY_FORMULAS.find(f => f.quarter === quarter);
  
  if (!formula) {
    throw new Error(`Invalid quarter: ${quarter}. Must be 1, 2, 3, or 4.`);
  }

  const { coefficients } = formula;
  const { temperature: T, dewPoint: D, precipitation: P, windSpeed: W, humidity: H } = weatherData;

  // Apply the MLR formula: Ŷ = aT + bD + cP + dW + eH + f
  // Where a,b,c,d,e are coefficients and T,D,P,W,H are actual weather values from 2025-2100 data
  return (
    coefficients.temperature * T +      // a * T
    coefficients.dewPoint * D +         // b * D  
    coefficients.precipitation * P +    // c * P
    coefficients.windSpeed * W +        // d * W
    coefficients.humidity * H +         // e * H
    coefficients.constant               // f (constant term)
  );
}

/**
 * Get formula for a specific quarter
 * @param quarter - The quarter (1-4)
 * @returns The formula object for the specified quarter
 */
export function getQuarterlyFormula(quarter: 1 | 2 | 3 | 4): QuarterlyFormula {
  const formula = QUARTERLY_FORMULAS.find(f => f.quarter === quarter);
  
  if (!formula) {
    throw new Error(`Invalid quarter: ${quarter}. Must be 1, 2, 3, or 4.`);
  }

  return formula;
}

/**
 * Get all quarterly formulas
 * @returns Array of all quarterly formulas
 */
export function getAllQuarterlyFormulas(): QuarterlyFormula[] {
  return QUARTERLY_FORMULAS;
}
