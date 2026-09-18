'use client';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function HeaderFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathParams = useParams();
    const pathname = usePathname();
    const [options, setOptions] = useState({ zones: [], districts: [], districtToZone: {} });
    const [mounted, setMounted] = useState(false);
    
    const initialZone = searchParams.get('zone');
    const initialDistrict = searchParams.get('district');
    
    const parsedZones = initialZone ? initialZone.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : [];
    const parsedDistricts = initialDistrict ? initialDistrict.split(',').filter(Boolean).map(v => ({ value: v, label: `District ${v}` })) : [];
    
    const [selectedZone, setSelectedZone] = useState(parsedZones);
    const [selectedDistrict, setSelectedDistrict] = useState(parsedDistricts);

    // Keep dropdowns in sync with active URL search parameters across all navigations
    useEffect(() => {
        const zoneParam = searchParams.get('zone');
        const districtParam = searchParams.get('district');
        
        const newZones = zoneParam ? zoneParam.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : [];
        const newDistricts = districtParam ? districtParam.split(',').filter(Boolean).map(v => ({ value: v, label: `District ${v}` })) : [];
        
        setSelectedZone(newZones);
        setSelectedDistrict(newDistricts);
    }, [searchParams, pathname]);

    useEffect(() => {
        setMounted(true);
        fetch('/api/filters').then(r => r.json()).then(data => setOptions(data)).catch(() => {});
    }, []);

    const isZoneRoute = !!pathParams?.zoneId;
    const isDistrictRoute = !!pathParams?.districtId;
    const isClubRoute = !!pathParams?.clubId;
    const isWorldwideRoute = pathname === '/worldwide';

    const handleFilterChange = (type, selected) => {
        // Trigger visual feedback before navigation
        document.documentElement.setAttribute('data-loading', 'true');
        if (typeof window !== 'undefined' && window.triggerNavigationProgress) {
            window.triggerNavigationProgress();
        }

        if (type === 'zone') {
            const selectedList = selected || [];
            setSelectedZone(selectedList);

            if (selectedList.length === 0) {
                // All zones cleared
                setSelectedDistrict([]);
                router.push('/', { scroll: false });
                return;
            }

            if (isZoneRoute) {
                if (selectedList.length === 1) {
                    const nextZoneNum = selectedList[0].value.replace(/[^0-9]/g, '');
                    router.push(`/zone/${nextZoneNum}`, { scroll: false });
                } else {
                    const zoneQuery = selectedList.map(s => s.value).join(',');
                    router.push(`/?zone=${encodeURIComponent(zoneQuery)}`, { scroll: false });
                }
                return;
            }

            if (isDistrictRoute) {
                if (selectedList.length === 1) {
                    const nextZoneNum = selectedList[0].value.replace(/[^0-9]/g, '');
                    router.push(`/zone/${nextZoneNum}`, { scroll: false });
                } else {
                    const zoneQuery = selectedList.map(s => s.value).join(',');
                    router.push(`/?zone=${encodeURIComponent(zoneQuery)}`, { scroll: false });
                }
                return;
            }

            // On home page /
            const params = new URLSearchParams(searchParams);
            params.set('zone', selectedList.map(s => s.value).join(','));

            // Filter selected districts to only those within the newly selected zones
            const validZones = new Set(selectedList.map(s => s.value));
            const validSelectedDistricts = selectedDistrict.filter(d => {
                const distZone = options.districtToZone[d.value.replace('District ', '')] || options.districtToZone[d.value];
                return validZones.has(distZone);
            });

            if (validSelectedDistricts.length > 0) {
                params.set('district', validSelectedDistricts.map(s => s.value).join(','));
                setSelectedDistrict(validSelectedDistricts);
            } else {
                params.delete('district');
                setSelectedDistrict([]);
            }

            router.push(`/?${params.toString()}`, { scroll: false });
        } else if (type === 'district') {
            const selectedList = selected || [];
            setSelectedDistrict(selectedList);

            if (isDistrictRoute) {
                if (selectedList.length === 1) {
                    router.push(`/district/${selectedList[0].value}`, { scroll: false });
                } else if (selectedList.length > 1) {
                    const distQuery = selectedList.map(s => s.value).join(',');
                    router.push(`/?district=${encodeURIComponent(distQuery)}`, { scroll: false });
                } else {
                    const distZone = options.districtToZone[pathParams.districtId];
                    if (distZone) {
                        router.push(`/zone/${distZone.replace(/[^0-9]/g, '')}`, { scroll: false });
                    } else {
                        router.push('/', { scroll: false });
                    }
                }
                return;
            }

            if (isZoneRoute) {
                const params = new URLSearchParams();
                if (selectedList.length > 0) {
                    params.set('district', selectedList.map(s => s.value).join(','));
                    router.push(`/zone/${pathParams.zoneId}?${params.toString()}`, { scroll: false });
                } else {
                    router.push(`/zone/${pathParams.zoneId}`, { scroll: false });
                }
                return;
            }

            // On home page /
            const params = new URLSearchParams(searchParams);
            if (selectedList.length > 0) {
                params.set('district', selectedList.map(s => s.value).join(','));
            } else {
                params.delete('district');
            }
            router.push(`/?${params.toString()}`, { scroll: false });
        }
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

    if (!mounted || isClubRoute || isWorldwideRoute) return null;
    
    const pathZoneId = pathParams?.zoneId ? (pathParams.zoneId.startsWith('Zone') ? pathParams.zoneId : `Zone ${pathParams.zoneId}`) : null;
    const pathDistrictId = pathParams?.districtId;
    const effectiveZone = isZoneRoute ? pathZoneId : (isDistrictRoute && options.districtToZone ? options.districtToZone[pathDistrictId] : null);
    
    const displayZone = (isZoneRoute || isDistrictRoute) && effectiveZone ? [{ value: effectiveZone, label: effectiveZone }] : selectedZone;
    const displayDistrict = isDistrictRoute ? [{ value: pathDistrictId, label: `District ${pathDistrictId}` }] : selectedDistrict;

    const activeZoneValues = new Set(displayZone.map(z => z.value));
    const availableDistricts = activeZoneValues.size > 0 
        ? options.districts.filter(d => activeZoneValues.has(d.zone))
        : options.districts;

    return (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Select 
                instanceId="zone-select"
                isMulti
                options={options.zones} 
                value={displayZone}
                onChange={(s) => handleFilterChange('zone', s)}
                isClearable={true}
                placeholder="All Zones" 
                styles={customStyles}
            />
            <Select 
                instanceId="district-select"
                isMulti
                options={availableDistricts} 
                value={displayDistrict}
                onChange={(s) => handleFilterChange('district', s)}
                isClearable={true}
                placeholder="All Districts" 
                styles={customStyles}
            />
        </div>
    );
}
