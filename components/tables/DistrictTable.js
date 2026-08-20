'use client';
import DataTable from './DataTable';
import Link from 'next/link';

export default function DistrictTable({ districtClubs }) {
    const columns = [
        { header: 'Club Name', accessorKey: 'name' },
        { header: 'Club Base', accessorKey: 'base' },
        { 
            header: 'Outstanding (₹)*', 
            id: 'outstanding',
            accessorFn: row => Number(row.outstanding || 0),
            cell: info => `₹${Math.round(info.getValue()).toLocaleString('en-IN')}`
        },
        { 
            header: 'At Risk', 
            accessorKey: 'isAtRisk',
            cell: info => info.getValue() ? '🚨 Yes' : 'No'
        },
        { 
            header: 'Missing Officers', 
            accessorKey: 'isNoOfficers',
            cell: info => info.getValue() ? '❌ Yes' : '✅ Reported'
        },
        {
            header: 'Action',
            id: 'action',
            cell: info => (
                <Link 
                    href={`/club/${info.row.original.id}`}
                    style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                    View Report →
                </Link>
            )
        }
    ];

    return <DataTable data={districtClubs} columns={columns} exportFilename="District_Clubs" />;
}
