import { useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';
import { Col, Row } from 'react-bootstrap';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';
import ModalComponent from '../../components/ModalComponent';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { ConnectXDateRange } from '../../components/DateRange';
import { TextField } from '@mui/material';

function QRScanReports() {
  const dispatch = useDispatch();
  const [formTitle, setFormTitle] = useState('');

  const date = new Date();
  const [updateGrid, setupdateGrid] = useState(0);
  const [filters, setFilters] = useState({
    company: '',
    customer_id: null,
    area: '',
    from_date: moment().format('YYYY-MM-DD'),
    to_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1
      }`,
  });

  const handleFilterChange = (filterKey, value, filterKeyId, id) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value || '',
      [filterKeyId]: id,
    }));
    setupdateGrid((prev) => prev + 1);
  };

  const gridColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ row }) => Number(row.id) + 1,
        size: 90,
      },
      {
        id: 'company_name',
        Header: () => {
          return (
            <div className="tabletopheader">
              <AutoCompletedDropdown
                url={'/api/v0/web/web_customer_dropdown'}
                handleDataChange={(value) =>
                  handleFilterChange(
                    'company',
                    value?.company_name,
                    'customer_id',
                    value.customer_id
                  )
                }
                valueInput={filters.company}
                objLevel={'company_name'}
              />
            </div>
          );
        },
        columns: [
          {
            accessorKey: 'customer_code',
            header: 'Customer Name',
            width: 280,
            enableColumnFilter: false,
            minSize: 350,
            cell: ({ row }) => {
              const customerCode = row.original.customer_code || '';
              const companyName = row.original.company_name || '';
              return `${customerCode}-${companyName}`;
            },
          },
        ],
      },
      {
        accessorKey: 'emp_code',
        header: 'Emp. Code',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'full_name',
        header: 'Full Name',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'checkpoint_code',
        header: 'CheckPoints',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'area',
        header: 'Area',
        Header: () => (
          <>
            <TextField
              fullWidth
              id="area"
              size="small"
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              name="area"
              value={filters.area}
              variant="outlined"
            />
          </>
        ),
        columns: [
          {
            accessorKey: "area",
            size: 220,
            header: "Area",
            enableColumnFilter: false,
            minSize: 207,
          },
        ],
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'scan_status',
        header: 'Scan Status',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'scan_time',
        header: 'Scan Time',
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const time = row.original.scan_time;
          return <span>{time ? moment(time).format('HH:MM') : 'N/A'}</span>;
        },
      },
    ],
    [filters]
  );
  const dateFilter = (date) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      from_date: moment(date.startDate || new Date()).format('YYYY-MM-DD'),
      to_date: moment(date.endDate || new Date()).format('YYYY-MM-DD'),
    }));
    setupdateGrid((prev) => prev + 1);
  };

  return (
    <MainLayout pageName="Qr Scan Reports" hasAddButton={false}>
      <Row className="mb-3">
        <Col md={12}>
          <div className="picker text-end">
            <ConnectXDateRange
              onChange={dateFilter}
              dateLevel="Date Filter"
              getData={{
                startDate: filters.from_date
                  ? moment(filters.from_date).toDate()
                  : moment().toDate(),
                endDate: filters.to_date
                  ? moment(filters.to_date).toDate()
                  : moment().toDate(),
              }}
            />
          </div>
        </Col>
      </Row>
      <CommonDataGrid
        url={'/api/v0/web/report_qr_scan_report'}
        columns={gridColumns}
        body={filters}
        jsonUpd={updateGrid}
      />

      <ModalComponent modalTitle={formTitle} />
    </MainLayout>
  );
}

export default QRScanReports;
