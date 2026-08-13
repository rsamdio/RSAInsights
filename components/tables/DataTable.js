'use client';
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DataTable({ data, columns, onRowClick, exportFilename, initialSort = [] }) {
    const [sorting, setSorting] = useState(initialSort);
    const [globalFilter, setGlobalFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setGlobalFilter(searchTerm);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 15 } }
    });

    const exportToCSV = () => {
        const rows = table.getFilteredRowModel().rows;
        const headers = table.getAllColumns()
            .filter(col => col.id !== 'action' && col.getIsVisible())
            .map(col => col.columnDef.header);
            
        const csvData = rows.map(row => {
            return table.getAllColumns()
                .filter(col => col.id !== 'action' && col.getIsVisible())
                .map(col => {
                    let val = row.getValue(col.id);
                    if (val === null || val === undefined) val = '';
                    // Escape quotes and wrap in quotes for CSV safety
                    return `"${val.toString().replace(/"/g, '""')}"`;
                }).join(',');
        });

        const csvContent = [headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', exportFilename ? `${exportFilename}.csv` : 'export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search all columns..."
                    style={{
                        padding: '10px 15px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        width: '300px',
                        fontFamily: 'Inter'
                    }}
                />
                <button 
                    onClick={exportToCSV}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontFamily: 'Inter',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export CSV
                </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Inter' }}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ 
                                        padding: '12px 15px', 
                                        borderBottom: '2px solid var(--border-color)',
                                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                        backgroundColor: '#f8f9fa',
                                        color: 'var(--text-muted)',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                        asc: ' 🔼',
                                        desc: ' 🔽',
                                    }[header.column.getIsSorted()] ?? null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr 
                            key={row.id}
                            onClick={() => onRowClick && onRowClick(row.original)}
                            style={{ 
                                cursor: onRowClick ? 'pointer' : 'default',
                                borderBottom: '1px solid var(--border-color)',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} style={{ padding: '12px 15px', fontSize: '14px', color: 'var(--text-main)' }}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed' }}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => table.nextPage()} 
                        disabled={!table.getCanNextPage()}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed' }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
