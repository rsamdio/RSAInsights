'use client';
import Tabs from '@/components/ui/Tabs';
import DataTable from './DataTable';

export default function GlobalTables({ zoneTableData, arrearsData, officersData, rotaryData, newClubsData, trfData, allClubsData }) {
    const districtCols = [
        { 
            header: 'District', 
            id: 'RI_District', 
            accessorKey: 'RI District',
            accessorFn: row => String(row['RI District'] || '') 
        },
        { 
            header: 'Zone', 
            id: 'RI_Zone',
            accessorKey: 'RI Zone',
            accessorFn: row => String(row['RI Zone'] || '') 
        },
        { 
            header: 'Total Clubs', 
            id: 'Total_Clubs',
            accessorKey: 'Total Clubs',
            accessorFn: row => Number(row['Total Clubs'] || 0) 
        },
        { 
            header: 'Outstanding USD', 
            id: 'TotalUSD',
            accessorKey: 'TotalUSD',
            accessorFn: row => Number(row.TotalUSD || 0),
            cell: info => `$${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
        },
        { 
            header: 'Arrears Clubs', 
            id: 'TotalClubsArrears',
            accessorKey: 'TotalClubsArrears',
            accessorFn: row => Number(row.TotalClubsArrears || 0) 
        },
        { 
            header: 'No Officers', 
            id: 'No_Officer_Total',
            accessorKey: 'No Officer Total',
            accessorFn: row => Number(row['No Officer Total'] || 0) 
        },
        { 
            header: 'Total TRF', 
            id: 'Total_Contributions_USD',
            accessorKey: 'Total Contributions USD',
            accessorFn: row => Number(row['Total Contributions USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        }
    ];

    const arrearsCols = [
        { header: 'Zone', id: 'RI_Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', id: 'Club_Name', accessorKey: 'Club Name' },
        { header: 'Base Type', id: 'Club_Base', accessorKey: 'Club Base' },
        { 
            header: 'Outstanding USD', 
            id: 'USD_Outstanding',
            accessorKey: ' USD Outstanding ',
            accessorFn: row => Number(row[' USD Outstanding '] || 0),
            cell: info => `$${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
        }
    ];

    const officersCols = [
        { header: 'Zone', id: 'RI_Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', id: 'Rotaract_Club_Name', accessorKey: 'Rotaract Club Name' },
        { header: 'Base Type', id: 'Club_Base', accessorKey: 'Club Base' }
    ];

    const rotaryCols = [
        { header: 'Zone', id: 'RI_Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Rotary Club Name', id: 'Club_Name', accessorKey: 'Club Name' },
        { header: 'Members', id: 'Current_Member_Count', accessorKey: 'Current Member Count' }
    ];

    const newClubsCols = [
        { header: 'Zone', id: 'RI_Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', id: 'Club_Name', accessorKey: 'Club Name' },
        { header: 'Charter Date', id: 'Club_Charter_Date', accessorKey: 'Club Charter Date' },
        { header: 'Members', id: 'Member_Count', accessorKey: 'Member Count' },
        { header: 'Base Type', id: 'Club_Subtype', accessorKey: 'Club Subtype' }
    ];

    const trfCols = [
        { header: 'Zone', id: 'RI_Zone', accessorKey: 'RI Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club Name', id: 'Club_Name', accessorKey: 'Club Name' },
        { 
            header: 'Annual Fund', 
            id: 'Annual_Fund_Contribution_USD',
            accessorKey: 'Annual Fund Contribution USD',
            accessorFn: row => Number(row['Annual Fund Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'PolioPlus', 
            id: 'PolioPlus_Fund_Contribution_USD',
            accessorKey: 'PolioPlus Fund Contribution USD',
            accessorFn: row => Number(row['PolioPlus Fund Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'Other Funds', 
            id: 'Other_Funds_Contribution_USD',
            accessorKey: 'Other Funds Contribution USD',
            accessorFn: row => Number(row['Other Funds Contribution USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        },
        { 
            header: 'Total TRF', 
            id: 'Total_Contributions_USD_TRF',
            accessorKey: 'Total Contributions USD',
            accessorFn: row => Number(row['Total Contributions USD'] || 0),
            cell: info => `$${info.getValue().toLocaleString()}` 
        }
    ];

    const allClubsCols = [
        { header: 'Zone', accessorKey: 'Zone' },
        { header: 'District', accessorKey: 'District' },
        { header: 'Club ID', id: 'Club_ID', accessorKey: 'Club ID' },
        { header: 'Club Name', id: 'Club_Name', accessorKey: 'Club Name' },
        { header: 'Base Type', id: 'Rotaract_Club_Base', accessorKey: 'Rotaract Club Base' },
        { header: 'Members', id: 'Total_Reported_Members', accessorKey: 'Total Reported Members' }
    ];

    const tabsData = [
        { label: 'District Summary', content: <DataTable data={zoneTableData} columns={districtCols} exportFilename="District_Summary" /> },
        { label: 'Clubs in Arrears', content: <DataTable data={arrearsData} columns={arrearsCols} exportFilename="Clubs_In_Arrears" /> },
        { label: 'Missing Officers', content: <DataTable data={officersData} columns={officersCols} exportFilename="Missing_Officers" /> },
        { label: 'Rotary w/o Sponsor', content: <DataTable data={rotaryData} columns={rotaryCols} exportFilename="Rotary_Without_Sponsor" /> },
        { label: 'New Clubs', content: <DataTable data={newClubsData} columns={newClubsCols} exportFilename="New_Clubs" /> },
        { label: 'TRF Contributions', content: <DataTable data={trfData} columns={trfCols} exportFilename="TRF_Contributions" /> },
        { label: 'All Clubs Roster', content: <DataTable data={allClubsData} columns={allClubsCols} exportFilename="All_Clubs_Roster" /> }
    ];

    return <Tabs tabs={tabsData} />;
}
