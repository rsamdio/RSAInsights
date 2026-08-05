'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function HeaderFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [options, setOptions] = useState({ zones: [], districts: [] });
    const [mounted, setMounted] = useState(false);
    
    // Parse current URL params
    const initialZone = searchParams.get('zone');
    const initialDistrict = searchParams.get('district');
    
    const [selectedZone, setSelectedZone] = useState(initialZone ? { value: initialZone, label: initialZone } : null);
    const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict ? { value: initialDistrict, label: `District ${initialDistrict}` } : null);

    useEffect(() => {
        setMounted(true);
        fetch('/api/filters').then(r => r.json()).then(data => setOptions(data)).catch(() => {});
    }, []);

    const handleFilterChange = (type, selected) => {
        const params = new URLSearchParams(searchParams);
        
        if (type === 'zone') {
            setSelectedZone(selected);
            if (selected) {
                params.set('zone', selected.value);
                params.delete('district');
                setSelectedDistrict(null);
            } else {
                params.delete('zone');
            }
        } else if (type === 'district') {
            setSelectedDistrict(selected);
            if (selected) {
                params.set('district', selected.value);
                params.delete('zone');
                setSelectedZone(null);
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
        })
    };

    if (!mounted) return null;

    return (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Select 
                instanceId="zone-select"
                options={options.zones} 
                value={selectedZone}
                onChange={(s) => handleFilterChange('zone', s)}
                isClearable 
                placeholder="All Zones" 
                styles={customStyles}
            />
            <Select 
                instanceId="district-select"
                options={options.districts} 
                value={selectedDistrict}
                onChange={(s) => handleFilterChange('district', s)}
                isClearable 
                placeholder="All Districts" 
                styles={customStyles}
            />
        </div>
    );
}
