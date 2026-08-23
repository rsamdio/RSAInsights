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
import Select from 'react-select';

const pageSizeOptions = [
    { value: 15, label: 'Show 15' },
    { value: 25, label: 'Show 25' },
    { value: 50, label: 'Show 50' },
    { value: 100, label: 'Show 100' },
];

const pageSizeSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '32px',
        height: '32px',
        width: '115px',
        borderRadius: '6px',
        border: state.isFocused ? '1px solid var(--primary)' : '1px solid var(--border-color)',
        background: '#ffffff',
        boxShadow: 'none',
        fontSize: '13px',
        cursor: 'pointer',
        '&:hover': {
            borderColor: 'var(--primary)'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 8px',
        height: '32px',
        display: 'flex',
        alignItems: 'center'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        padding: '0px'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'var(--text-main)',
        fontWeight: 500,
        margin: 0
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '32px'
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px 6px',
        color: 'var(--text-muted)',
        '&:hover': {
            color: 'var(--primary)'
        }
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: '13px',
        borderRadius: '6px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        zIndex: 9999
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
            ? 'var(--primary)' 
            : state.isFocused 
                ? 'var(--primary-light)' 
                : 'transparent',
        color: state.isSelected 
            ? '#ffffff' 
            : state.isFocused 
                ? 'var(--primary)' 
                : 'var(--text-main)',
        cursor: 'pointer',
        padding: '6px 12px',
        fontWeight: state.isSelected ? 600 : 400
    })
};

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
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search all columns..."
                        style={{
                            padding: '10px 15px',
                            paddingRight: searchTerm ? '30px' : '15px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            width: '300px',
                            fontFamily: 'Inter'
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '16px',
                                padding: '0'
                            }}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
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
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={table.getAllColumns().length} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔍</div>
                                <p style={{ margin: 0, fontWeight: 500 }}>No results found.</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Try a different search term.</p>
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
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
                        ))
                    )}
                </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} results
                    </span>
                    <div style={{ width: '120px' }}>
                        <Select
                            instanceId={`page-size-select-${exportFilename || 'table'}`}
                            isSearchable={false}
                            options={pageSizeOptions}
                            value={pageSizeOptions.find(opt => opt.value === table.getState().pagination.pageSize) || { value: table.getState().pagination.pageSize, label: `Show ${table.getState().pagination.pageSize}` }}
                            onChange={opt => opt && table.setPageSize(Number(opt.value))}
                            styles={pageSizeSelectStyles}
                            menuPlacement="auto"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()}
                        style={{ 
                            padding: '6px 14px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)', 
                            background: '#ffffff', 
                            fontSize: '13px',
                            fontWeight: 500,
                            color: table.getCanPreviousPage() ? 'var(--text-main)' : 'var(--text-muted)',
                            cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease',
                            opacity: table.getCanPreviousPage() ? 1 : 0.6
                        }}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => table.nextPage()} 
                        disabled={!table.getCanNextPage()}
                        style={{ 
                            padding: '6px 14px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)', 
                            background: '#ffffff', 
                            fontSize: '13px',
                            fontWeight: 500,
                            color: table.getCanNextPage() ? 'var(--text-main)' : 'var(--text-muted)',
                            cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease',
                            opacity: table.getCanNextPage() ? 1 : 0.6
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
