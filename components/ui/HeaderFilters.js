'use client';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function HeaderFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathParams = useParams();
    const [options, setOptions] = useState({ zones: [], districts: [], districtToZone: {} });
    const [mounted, setMounted] = useState(false);
    
    const initialZone = searchParams.get('zone');
    const initialDistrict = searchParams.get('district');
    
    const parsedZones = initialZone ? initialZone.split(',').map(v => ({ value: v, label: v })) : [];
    const parsedDistricts = initialDistrict ? initialDistrict.split(',').map(v => ({ value: v, label: `District ${v}` })) : [];
    
    const [selectedZone, setSelectedZone] = useState(parsedZones);
    const [selectedDistrict, setSelectedDistrict] = useState(parsedDistricts);

    useEffect(() => {
        setMounted(true);
        fetch('/api/filters').then(r => r.json()).then(data => setOptions(data)).catch(() => {});
    }, []);

    const handleFilterChange = (type, selected) => {
        const params = new URLSearchParams(searchParams);
        
        if (type === 'zone') {
            setSelectedZone(selected || []);
            if (selected && selected.length > 0) {
                params.set('zone', selected.map(s => s.value).join(','));
                params.delete('district');
                setSelectedDistrict([]);
            } else {
                params.delete('zone');
            }
        } else if (type === 'district') {
            setSelectedDistrict(selected || []);
            if (selected && selected.length > 0) {
                params.set('district', selected.map(s => s.value).join(','));
                params.delete('zone');
                setSelectedZone([]);
            } else {
                params.delete('district');
            }
        }
        
        router.push(`/?${params.toString()}`);
    };

    const customStyles = {
        control: (provided, state) => ({ 
            ...provided, 
            minWidth: '150px', 
            minHeight: '36px',
            borderRadius: '6px', 
            border: state.isFocused ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
            background: '#ffffff',
            boxShadow: 'none',
            fontSize: '14px',
            cursor: 'pointer'
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 8px'
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '36px'
        }),
        menu: (provided) => ({
            ...provided,
            fontSize: '14px',
            zIndex: 1001
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: 'var(--primary-light)',
            borderRadius: '4px'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'var(--primary)',
            fontWeight: 600,
            padding: '2px 6px'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: 'var(--primary)',
            ':hover': {
                backgroundColor: 'var(--primary)',
                color: 'white',
            }
        })
    };

    if (!mounted) return null;

    const isZoneRoute = !!pathParams?.zoneId;
    const isDistrictRoute = !!pathParams?.districtId;
    
    const pathZoneId = pathParams?.zoneId ? (pathParams.zoneId.startsWith('Zone') ? pathParams.zoneId : `Zone ${pathParams.zoneId}`) : null;
    const pathDistrictId = pathParams?.districtId;
    const effectiveZone = isZoneRoute ? pathZoneId : (isDistrictRoute && options.districtToZone ? options.districtToZone[pathDistrictId] : null);
    
    const displayZone = (isZoneRoute || isDistrictRoute) && effectiveZone ? [{ value: effectiveZone, label: effectiveZone }] : selectedZone;
    const displayDistrict = isDistrictRoute ? [{ value: pathDistrictId, label: `District ${pathDistrictId}` }] : selectedDistrict;

    return (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Select 
                instanceId="zone-select"
                isMulti
                options={options.zones} 
                value={displayZone}
                onChange={(s) => handleFilterChange('zone', s)}
                isClearable={!isZoneRoute && !isDistrictRoute}
                isDisabled={isZoneRoute || isDistrictRoute}
                placeholder="All Zones" 
                styles={customStyles}
            />
            <Select 
                instanceId="district-select"
                isMulti
                options={options.districts} 
                value={displayDistrict}
                onChange={(s) => handleFilterChange('district', s)}
                isClearable={!isZoneRoute && !isDistrictRoute}
                isDisabled={isZoneRoute || isDistrictRoute}
                placeholder="All Districts" 
                styles={customStyles}
            />
        </div>
    );
}
