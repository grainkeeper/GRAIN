'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PSGCItem {
  code: string;
  name: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
}

interface CascadingDropdownProps {
  onLocationChange: (location: {
    region: PSGCItem | null;
    province: PSGCItem | null;
    city: PSGCItem | null;
    barangay: PSGCItem | null;
  }) => void;
}

export default function CascadingDropdown({ onLocationChange }: CascadingDropdownProps) {
  const [regions, setRegions] = useState<PSGCItem[]>([]);
  const [provinces, setProvinces] = useState<PSGCItem[]>([]);
  const [cities, setCities] = useState<PSGCItem[]>([]);
  const [barangays, setBarangays] = useState<PSGCItem[]>([]);
  
  const [selectedRegion, setSelectedRegion] = useState<PSGCItem | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<PSGCItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<PSGCItem | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<PSGCItem | null>(null);
  
  const [loading, setLoading] = useState({
    regions: true,
    provinces: false,
    cities: false,
    barangays: false
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Load regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Update parent component when selection changes
  useEffect(() => {
    onLocationChange({
      region: selectedRegion,
      province: selectedProvince,
      city: selectedCity,
      barangay: selectedBarangay
    });
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay, onLocationChange]);

  const fetchRegions = async () => {
    try {
      setLoading(prev => ({ ...prev, regions: true }));
      const response = await fetch('https://psgc.gitlab.io/api/regions/');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      // Fallback data
      setRegions([
        { code: '01', name: 'Ilocos Region' },
        { code: '02', name: 'Cagayan Valley' },
        { code: '03', name: 'Central Luzon' },
        { code: '04A', name: 'CALABARZON' },
        { code: '04B', name: 'MIMAROPA Region' },
        { code: '05', name: 'Bicol Region' },
        { code: '06', name: 'Western Visayas' },
        { code: '07', name: 'Central Visayas' },
        { code: '08', name: 'Eastern Visayas' },
        { code: '09', name: 'Zamboanga Peninsula' },
        { code: '10', name: 'Northern Mindanao' },
        { code: '11', name: 'Davao Region' },
        { code: '12', name: 'SOCCSKSARGEN' },
        { code: '13', name: 'Caraga' },
        { code: '14', name: 'Cordillera Administrative Region' },
        { code: '15', name: 'National Capital Region' },
        { code: '16', name: 'Bangsamoro Autonomous Region in Muslim Mindanao' }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  const fetchProvinces = async (regionCode: string) => {
    try {
      setLoading(prev => ({ ...prev, provinces: true }));
      const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      setLoading(prev => ({ ...prev, cities: true }));
      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    try {
      setLoading(prev => ({ ...prev, barangays: true }));
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
      const data = await response.json();
      setBarangays(data);
    } catch (error) {
      console.error('Error fetching barangays:', error);
      setBarangays([]);
    } finally {
      setLoading(prev => ({ ...prev, barangays: false }));
    }
  };

  const handleRegionChange = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode) || null;
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setOpenDropdown(null);
    
    if (region) {
      fetchProvinces(regionCode);
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find(p => p.code === provinceCode) || null;
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCities([]);
    setBarangays([]);
    setOpenDropdown(null);
    
    if (province) {
      fetchCities(provinceCode);
    }
  };

  const handleCityChange = (cityCode: string) => {
    const city = cities.find(c => c.code === cityCode) || null;
    setSelectedCity(city);
    setSelectedBarangay(null);
    setBarangays([]);
    setOpenDropdown(null);
    
    if (city) {
      fetchBarangays(cityCode);
    }
  };

  const handleBarangayChange = (barangayCode: string) => {
    const barangay = barangays.find(b => b.code === barangayCode) || null;
    setSelectedBarangay(barangay);
    setOpenDropdown(null);
  };

  const DropdownItem = ({ 
    item, 
    isSelected, 
    onClick, 
    disabled = false 
  }: { 
    item: PSGCItem; 
    isSelected: boolean; 
    onClick: () => void; 
    disabled?: boolean;
  }) => (
    <div
      className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-green-50 ${
        isSelected ? 'bg-green-100 text-green-900' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{item.name}</span>
        {isSelected && <CheckIcon className="h-4 w-4 text-green-600" />}
      </div>
    </div>
  );

  const Dropdown = ({ 
    title, 
    items, 
    selectedItem, 
    onSelect, 
    loading, 
    disabled, 
    placeholder,
    dropdownKey 
  }: {
    title: string;
    items: PSGCItem[];
    selectedItem: PSGCItem | null;
    onSelect: (code: string) => void;
    loading: boolean;
    disabled: boolean;
    placeholder: string;
    dropdownKey: string;
  }) => (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {title}
      </label>
      <div className="relative">
        <button
          type="button"
          className={`w-full px-4 py-3 text-left bg-white border rounded-lg shadow-sm transition-all duration-200 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
              : openDropdown === dropdownKey
              ? 'border-green-500 ring-2 ring-green-200'
              : 'border-gray-300 hover:border-gray-400 focus:border-green-500'
          }`}
          onClick={() => !disabled && setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)}
          disabled={disabled}
        >
          <div className="flex items-center justify-between">
            <span className={selectedItem ? 'text-gray-900' : 'text-gray-500'}>
              {selectedItem ? selectedItem.name : placeholder}
            </span>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                openDropdown === dropdownKey ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>
        {openDropdown === dropdownKey && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No options available
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <DropdownItem
                    key={item.code}
                    item={item}
                    isSelected={selectedItem?.code === item.code}
                    onClick={() => onSelect(item.code)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <Dropdown
          title="Region"
          items={regions}
          selectedItem={selectedRegion}
          onSelect={handleRegionChange}
          loading={loading.regions}
          disabled={false}
          placeholder="Select Region"
          dropdownKey="region"
        />

        <Dropdown
          title="Province"
          items={provinces}
          selectedItem={selectedProvince}
          onSelect={handleProvinceChange}
          loading={loading.provinces}
          disabled={!selectedRegion}
          placeholder="Select Province"
          dropdownKey="province"
        />

        <Dropdown
          title="City/Municipality"
          items={cities}
          selectedItem={selectedCity}
          onSelect={handleCityChange}
          loading={loading.cities}
          disabled={!selectedProvince}
          placeholder="Select City/Municipality"
          dropdownKey="city"
        />

        <Dropdown
          title="Barangay"
          items={barangays}
          selectedItem={selectedBarangay}
          onSelect={handleBarangayChange}
          loading={loading.barangays}
          disabled={!selectedCity}
          placeholder="Select Barangay"
          dropdownKey="barangay"
        />
      </div>

      {/* Selected Values Display */}
      {(selectedRegion || selectedProvince || selectedCity || selectedBarangay) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedRegion && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Region</p>
                <p className="text-sm font-medium text-gray-900">{selectedRegion.name}</p>
              </div>
            )}
            {selectedProvince && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Province</p>
                <p className="text-sm font-medium text-gray-900">{selectedProvince.name}</p>
              </div>
            )}
            {selectedCity && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">City/Municipality</p>
                <p className="text-sm font-medium text-gray-900">{selectedCity.name}</p>
              </div>
            )}
            {selectedBarangay && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Barangay</p>
                <p className="text-sm font-medium text-gray-900">{selectedBarangay.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
