import { NextRequest, NextResponse } from 'next/server';
import { ForecastDataService } from '@/lib/services/historical-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    
    const forecastService = new ForecastDataService();
    
    if (quarter && year) {
      // Get specific quarter/year analysis
      const quarterNum = parseInt(quarter);
      const yearNum = parseInt(year);
      
      const historicalData = forecastService.getHistoricalData(quarterNum, yearNum);
      const comparison = forecastService.compareWithHistorical(
        historicalData?.yield || 0, 
        quarterNum
      );
      const trend = forecastService.getTrendAnalysis(quarterNum);
      
      return NextResponse.json({
        success: true,
        data: {
          historicalData,
          comparison,
          trend
        }
      });
    } else {
      // Get overall performance analysis
      const quarterPerformance = forecastService.getQuarterPerformance();
      const bestQuarter = forecastService.getBestPlantingQuarter();
      
      return NextResponse.json({
        success: true,
        data: {
          quarterPerformance,
          bestQuarter,
          summary: {
            totalQuarters: quarterPerformance.length,
            bestPerformingQuarter: quarterPerformance.find(q => q.quarter === bestQuarter),
            overallTrends: quarterPerformance.map(q => ({
              quarter: q.quarter,
              trend: forecastService.getTrendAnalysis(q.quarter).trend
            }))
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching historical insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical insights' },
      { status: 500 }
    );
  }
}
