import { MaterialReactTable } from 'material-react-table';
import React from 'react';
export default function BasicTable({ column, gridData, gridHeight }) {
  return (
    <div className="pick_table_data_grid">
      <MaterialReactTable
        columns={column}
        data={gridData}
        enablePagination={false}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableSorting={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        enableStickyHeader
        initialState={{
          density: 'compact',
        }}
        enableFullScreenToggle={false}
        muiTableContainerProps={{
          sx: { maxHeight: `calc(100vh - ${gridHeight}px)` },
        }}
      />
    </div>
  );
}
