'use client';
import Tabs from '@/components/ui/Tabs';
import DataTable from './DataTable';

export default function GlobalTables({ zoneTableData, arrearsData, officersData, rotaryData, newClubsData, trfData, allClubsData }) {
    const districtCols = [
        { header: 'District', id: 'RI District', accessorKey: 'RI District' },
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'Total Clubs', accessorKey: 'Total Clubs' },
        { 
            header: 'Outstanding USD', 
            id: 'TotalUSD',
            accessorFn: row => Number(row.TotalUSD || 0),
            cell: info => `$${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
        },
        { header: 'Arrears Clubs', accessorKey: 'TotalClubsArrears' },
        { header: 'No Officers', accessorKey: 'No Officer Total' },
        { 
            header: 'Total TRF', 
            id: 'trfContributionsUSD',
            accessorFn: row => Number(row['Total Contributions USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        }
    ];

    const arrearsCols = [
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', accessorKey: 'Club Name' },
        { header: 'Base Type', accessorKey: 'Club Base' },
        { 
            header: 'Outstanding USD', 
            id: 'USD Outstanding ',
            accessorFn: row => Number(row[' USD Outstanding '] || 0),
            cell: info => `$${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
        }
    ];

    const officersCols = [
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', accessorKey: 'Rotaract Club Name' },
        { header: 'Base Type', accessorKey: 'Club Base' }
    ];

    const rotaryCols = [
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Rotary Club Name', accessorKey: 'Club Name' },
        { header: 'Members', accessorKey: 'Current Member Count' }
    ];

    const newClubsCols = [
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', accessorKey: 'Club Name' },
        { header: 'Charter Date', accessorKey: 'Club Charter Date' },
        { header: 'Members', accessorKey: 'Member Count' },
        { header: 'Base Type', accessorKey: 'Club Subtype' }
    ];

    const trfCols = [
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', accessorKey: 'Club Name' },
        { 
            header: 'Annual Fund', 
            id: 'Annual Fund Contribution USD',
            accessorFn: row => Number(row['Annual Fund Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'PolioPlus', 
            id: 'PolioPlus Fund Contribution USD',
            accessorFn: row => Number(row['PolioPlus Fund Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'Other Funds', 
            id: 'Other Funds Contribution USD',
            accessorFn: row => Number(row['Other Funds Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'Total TRF', 
            id: 'Total Contributions USD',
            accessorFn: row => Number(row['Total Contributions USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        }
    ];

    const allClubsCols = [
        { header: 'Zone', accessorKey: 'Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club ID', accessorKey: 'Club ID' },
        { header: 'Club Name', accessorKey: 'Club Name' },
        { header: 'Base Type', accessorKey: 'Rotaract Club Base' },
        { header: 'Members', accessorKey: 'Total Reported Members' }
    ];

    const tabsData = [
        { label: 'District Summary', content: <DataTable data={zoneTableData} columns={districtCols} exportFilename="District_Summary" initialSort={[{ id: 'RI District', desc: false }]} /> },
        { label: 'Clubs in Arrears', content: <DataTable data={arrearsData} columns={arrearsCols} exportFilename="Clubs_In_Arrears" initialSort={[{ id: 'District', desc: false }]} /> },
        { label: 'Missing Officers', content: <DataTable data={officersData} columns={officersCols} exportFilename="Missing_Officers" initialSort={[{ id: 'District', desc: false }]} /> },
        { label: 'Rotary w/o Sponsor', content: <DataTable data={rotaryData} columns={rotaryCols} exportFilename="Rotary_Without_Sponsor" initialSort={[{ id: 'District', desc: false }]} /> },
        { label: 'New Clubs', content: <DataTable data={newClubsData} columns={newClubsCols} exportFilename="New_Clubs" initialSort={[{ id: 'District', desc: false }]} /> },
        { label: 'TRF Contributions', content: <DataTable data={trfData} columns={trfCols} exportFilename="TRF_Contributions" initialSort={[{ id: 'District', desc: false }]} /> },
        { label: 'All Clubs Roster', content: <DataTable data={allClubsData} columns={allClubsCols} exportFilename="All_Clubs_Roster" initialSort={[{ id: 'District', desc: false }]} /> }
    ];

    return <Tabs tabs={tabsData} />;
}
