import { saveAs } from 'file-saver';
import { Button, Spinner } from 'react-bootstrap';
import XLSX from 'xlsx-js-style';
import { excelImage } from '../utils/images';
import { useEffect, useState } from 'react';

export const authUser = (data) => {
  localStorage.setItem('auth', JSON.stringify(data));
};
// eslint-disable-next-line react-refresh/only-export-components
export const getAuthUser = () => {
  return localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
};
export const authShareUser = (data) => {
  sessionStorage.setItem('auth', JSON.stringify(data));
};
export const getAuthShareUser = () => {
  return sessionStorage.getItem('auth')
    ? JSON.parse(sessionStorage.getItem('auth'))
    : null;
};

export const TableExportButton = ({ excelData, fileName, handleExport }) => {
  const [loading, setLoading] = useState(false);
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';
  function styleSheet(ws) {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Style header row
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: '2C3E50' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          bottom: { style: 'thin', color: { rgb: 'D05356' } },
        },
      };
    }

    // Color-code Yes/No cells
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        const val = String(ws[addr].v || '');

        if (val === 'Yes') {
          ws[addr].s = {
            font: { bold: true, color: { rgb: '006100' } },
            fill: { fgColor: { rgb: 'C6EFCE' } },
            alignment: { horizontal: 'center' },
          };
        } else if (val === 'No') {
          ws[addr].s = {
            font: { bold: true, color: { rgb: '9C0006' } },
            fill: { fgColor: { rgb: 'FFC7CE' } },
            alignment: { horizontal: 'center' },
          };
        } else if (!ws[addr].s && R % 2 === 0) {
          ws[addr].s = { fill: { fgColor: { rgb: 'F4F6F8' } } };
        }
      }
    }

    // Auto-width columns
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLen = 10;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[addr] && ws[addr].v != null) {
          maxLen = Math.max(maxLen, String(ws[addr].v).length + 2);
        }
      }
      colWidths.push({ wch: Math.min(maxLen, 40) });
    }
    ws['!cols'] = colWidths;
  }

  const excelExportButton = async () => {
    // Multi-sheet: location-wise asset breakdown
    if (excelData && excelData._multiSheet && excelData.sheets) {
      const wb = XLSX.utils.book_new();
      const sheetNames = Object.keys(excelData.sheets).sort();
      sheetNames.forEach((name) => {
        const rows = excelData.sheets[name];
        if (!rows || rows.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(rows);
        styleSheet(ws);
        // Sheet name max 31 chars, no special chars
        const safeName = name.replace(/[\\/*?[\]:]/g, '').slice(0, 31) || 'Sheet';
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      });
      if (wb.SheetNames.length === 0) return;
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      saveAs(data, fileName + fileExtension);
      return;
    }

    // Single sheet (default)
    const ws = XLSX.utils.json_to_sheet(excelData);
    styleSheet(ws);
    const excelBuffer = XLSX.write(
      { Sheets: { data: ws }, SheetNames: ['data'] },
      { bookType: 'xlsx', type: 'array' }
    );
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, fileName + fileExtension);
  };
  useEffect(() => {
    const hasData = excelData?._multiSheet
      ? Object.keys(excelData.sheets || {}).length > 0
      : excelData?.length > 0;
    if (loading && hasData) {
      excelExportButton();
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excelData]);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await handleExport();
    } catch (err) {
      console.error('Export failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="exportbutton">
      <Button
        size="sm"
        variant="success"
        className="d-flex align-items-center gap-2"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <img src={excelImage} alt="excel" className="excelicon" />
        )}
        {loading ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );
};
