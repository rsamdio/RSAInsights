import { NextResponse } from 'next/server';
import { 
    getArrears, 
    getNoOfficers, 
    getRotaryNoSponsor, 
    getRotaryNoInteract, 
    getNewClubs, 
    getTRFContributions, 
    getAllClubs 
} from '@/lib/api';
import { withApiTelemetry } from '@/lib/telemetry/axiom';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Netlify-Vary': 'query',
    'Access-Control-Allow-Origin': '*'
};

function normalizeZone(val) {
    if (!val) return '';
    const s = String(val).trim();
    return s.startsWith('Zone') ? s : `Zone ${s}`;
}

function matchesZoneFilter(itemZone, selectedZones) {
    if (!selectedZones || selectedZones.length === 0) return true;
    if (!itemZone) return false;
    const normItem = normalizeZone(itemZone);
    return selectedZones.some(z => normalizeZone(z) === normItem);
}

function matchesDistrictFilter(itemDist, selectedDistricts) {
    if (!selectedDistricts || selectedDistricts.length === 0) return true;
    if (!itemDist) return false;
    const cleanDist = String(itemDist).replace(/^District\s*/i, '').trim();
    return selectedDistricts.includes(cleanDist);
}

export const GET = withApiTelemetry(async function GET(request, { params }) {
    try {
        const { tab } = await params;
        const { searchParams } = new URL(request.url);
        const districtParam = searchParams.get('district') || '';
        const zoneParam = searchParams.get('zone') || '';

        const selectedDistricts = districtParam 
            ? districtParam.split(',').map(d => d.replace(/^District\s*/i, '').trim()).filter(Boolean) 
            : [];
        const selectedZones = zoneParam 
            ? zoneParam.split(',').map(z => z.trim()).filter(Boolean) 
            : [];

        switch (tab) {
            case 'arrears': {
                let data = await getArrears() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(c => matchesDistrictFilter(c.District || c.district, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(c => matchesZoneFilter(c['RI Zone'] || c['Current Zone'] || c.Zone, selectedZones));
                }
                const trimmed = data.map(c => ({
                    'RI Zone': c['RI Zone'] || c['Current Zone'] || c.Zone,
                    'District': c.District || c.district,
                    'Club Name': c['Club Name'] || c.name,
                    'Club Base': c['Club Base'] || c.base,
                    'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                    'Billable Member Count': c['Billable Member Count'] ?? c.billableMembers ?? c.members ?? 0,
                    'Outstanding INR': c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? 0,
                    'outstanding': c['Outstanding INR'] ?? c.outstanding ?? c.outstandingINR ?? 0,
                    ' USD Outstanding ': c[' USD Outstanding '] ?? c.outstandingUSD ?? 0,
                    'NF Cust Number': c['NF Cust Number'] || c['Club ID'] || c.id,
                    'Club ID': c['Club ID'] || c['NF Cust Number'] || c.id
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'officers': {
                let data = await getNoOfficers() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(c => matchesDistrictFilter(c.District || c.district, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(c => matchesZoneFilter(c['RI Zone'] || c.Zone, selectedZones));
                }
                const trimmed = data.map(c => ({
                    'RI Zone': c['RI Zone'] || c.Zone,
                    'District': c.District || c.district,
                    'Rotaract Club Name': c['Rotaract Club Name'] || c['Club Name'] || c.name,
                    'Club Base': c['Club Base'] || c['Rotaract Club Base'] || c.base,
                    'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                    'Club Status': c['Club Status'] || 'Active',
                    'Club ID': c['Club ID'] || c['Rotaract Club ID'] || c.id
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'rotary': {
                let data = await getRotaryNoSponsor() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(r => matchesDistrictFilter(r.District || r.district, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(r => matchesZoneFilter(r['RI Zone'] || r.Zone, selectedZones));
                }
                const trimmed = data.map(r => ({
                    'RI Zone': r['RI Zone'] || r.Zone,
                    'District': r.District || r.district,
                    'Club Name': r['Club Name'] || r.name,
                    'Current Member Count': r['Current Member Count'] ?? r.members ?? 0
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'rotary_no_interact': {
                let data = await getRotaryNoInteract() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(r => matchesDistrictFilter(r.District || r.district, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(r => matchesZoneFilter(r['RI Zone'] || r.Zone, selectedZones));
                }
                const trimmed = data.map(r => ({
                    'RI Zone': r['RI Zone'] || r.Zone,
                    'District': r.District || r.district,
                    'Club Name': r['Club Name'] || r.name,
                    'Current Member Count': r['Current Member Count'] ?? r.members ?? 0,
                    'Total Rotaract Sponsored': Number(r['Total Rotaract Sponsored'] ?? 0)
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'new_clubs': {
                let data = await getNewClubs() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(c => matchesDistrictFilter(c.District || c.DISTRICT, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(c => matchesZoneFilter(c['RI Zone'] || c.ZONE || c.Zone, selectedZones));
                }
                const trimmed = data.map(c => ({
                    'RI Zone': c['RI Zone'] || (c.ZONE ? `Zone ${c.ZONE}` : '') || c.Zone,
                    'District': c.District || c.DISTRICT,
                    'Club ID': c['Club ID'] || c.id,
                    'Club Name': c['Club Name'] || c.name,
                    'Club Subtype': c['Club Subtype'] || c.base || 'Community',
                    'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                    'Club Charter Date': c['Club Charter Date'] || c.charterDate || '',
                    'Member Count': c['Member Count'] ?? c.members ?? 0
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'trf': {
                let data = await getTRFContributions() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(c => matchesDistrictFilter(c.District, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(c => matchesZoneFilter(c['RI Zone'] || c['Current Zone'] || c.Zone, selectedZones));
                }
                const trimmed = data.map(c => ({
                    'RI Zone': c['RI Zone'] || (c['Current Zone'] ? `Zone ${c['Current Zone']}` : '') || c.Zone,
                    'District': c.District,
                    'Club No.': c['Club No.'] || c['Club No'] || c.id,
                    'Club No': c['Club No.'] || c['Club No'] || c.id,
                    'Club Name': c['Club Name'] || c.Name || c.name,
                    'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                    'Annual Fund Contribution USD': Number(c['Annual Fund Contribution USD'] ?? c['Annual Fund\nYTD'] ?? 0),
                    'PolioPlus Fund Contribution USD': Number(c['PolioPlus Fund Contribution USD'] ?? c['PolioPlus Fund\nYTD'] ?? 0),
                    'Other Funds Contribution USD': Number(c['Other Funds Contribution USD'] ?? c['Other Funds\nYTD'] ?? 0),
                    'Total Contributions USD': Number(c['Total Contributions USD'] ?? c['-- Total --'] ?? 0)
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            case 'all_clubs': {
                let data = await getAllClubs() || [];
                if (selectedDistricts.length > 0) {
                    data = data.filter(c => matchesDistrictFilter(c.District || c.district, selectedDistricts));
                }
                if (selectedZones.length > 0) {
                    data = data.filter(c => matchesZoneFilter(c['RI Zone'] || c.Zone || c.zone, selectedZones));
                }
                const trimmed = data.map(c => ({
                    'Zone': c['RI Zone'] || c.Zone || c.zone,
                    'District': c.District || c.district,
                    'Club ID': c['Club ID'] || c.id,
                    'Club Name': c['Club Name'] || c.name,
                    'Rotaract Club Base': c['Rotaract Club Base'] || c.base,
                    'Sponsor Clubs': c['Sponsor Clubs'] || c.sponsorClubs || 'None Reported',
                    'Total Reported Members': c['Total Reported Members'] ?? c.members ?? 0
                }));
                return NextResponse.json(trimmed, { headers: CACHE_HEADERS });
            }

            default:
                return NextResponse.json({ error: `Unknown table tab: ${tab}` }, { status: 400 });
        }
    } catch (error) {
        console.error('API /api/table-data/[tab] error:', error);
        return NextResponse.json({ error: 'Failed to retrieve table data' }, { status: 500 });
    }
}, { route: '/api/table-data/[tab]' });
