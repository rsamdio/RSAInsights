'use client';
import Tabs from '@/components/ui/Tabs';
import DataTable from './DataTable';

export default function GlobalTables({ zoneTableData, arrearsData, officersData, rotaryData }) {
    const districtCols = [
        { header: 'District', accessorKey: 'RI District' },
        { header: 'Zone', accessorKey: 'RI Zone' },
        { header: 'Total Clubs', accessorKey: 'Total Clubs' },
        { 
            header: 'Outstanding USD', 
            id: 'TotalUSD',
            accessorFn: row => Number(row.TotalUSD || 0),
            cell: info => `$${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
        },
        { header: 'Arrears Clubs', accessorKey: 'TotalClubsArrears' },
        { header: 'Missing Officers', accessorKey: 'No Officer Total' }
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

    const tabsData = [
        { label: 'District Summary', content: <DataTable data={zoneTableData} columns={districtCols} /> },
        { label: 'Clubs in Arrears', content: <DataTable data={arrearsData} columns={arrearsCols} /> },
        { label: 'Missing Officers', content: <DataTable data={officersData} columns={officersCols} /> },
        { label: 'Rotary w/o Sponsor', content: <DataTable data={rotaryData} columns={rotaryCols} /> }
    ];

    return <Tabs tabs={tabsData} />;
}
