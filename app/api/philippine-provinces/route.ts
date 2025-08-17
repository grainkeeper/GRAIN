import { NextRequest, NextResponse } from 'next/server';
import { PhilippineGeoService } from '@/lib/services/philippine-geo-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const riceOnly = searchParams.get('rice_only') === 'true';

    const geoService = new PhilippineGeoService();
    let provinces;

    if (search) {
      provinces = await geoService.searchProvinces(search);
    } else if (region) {
      provinces = await geoService.getProvincesByRegion(region);
    } else {
      provinces = await geoService.getAllProvinces();
    }

    // Filter for rice-producing provinces only if requested
    if (riceOnly) {
      provinces = provinces.filter(province => province.rice_producing);
    }

    return NextResponse.json({
      success: true,
      count: provinces.length,
      provinces,
      message: `Found ${provinces.length} provinces`
    });

  } catch (error) {
    console.error('Error fetching Philippine provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { search, region, rice_only } = await request.json();
    
    const geoService = new PhilippineGeoService();
    let provinces;

    if (search) {
      provinces = await geoService.searchProvinces(search);
    } else if (region) {
      provinces = await geoService.getProvincesByRegion(region);
    } else {
      provinces = await geoService.getAllProvinces();
    }

    // Filter for rice-producing provinces only if requested
    if (rice_only) {
      provinces = provinces.filter(province => province.rice_producing);
    }

    return NextResponse.json({
      success: true,
      count: provinces.length,
      provinces,
      message: `Found ${provinces.length} provinces`
    });

  } catch (error) {
    console.error('Error fetching Philippine provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces data' },
      { status: 500 }
    );
  }
}
