import { useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';
// import ModalComponent from '../../components/ModalComponent';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';
import { TextField } from '@mui/material';
function GuardEvent() {
  const [filters, setFilters] = useState({
    company: '',
    customer_id: null,
    event_type: null,
    emp_code: null,
    checkpoint_code: '',
  });
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
        accessorKey: 'event_date',
        header: 'Event Date',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'event_time',
        header: 'Event Time',
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const time = row.original.event_time;
          return (
            <span>
              {time ? moment(time, 'HH:mm:ss').format('HH:mm A') : 'N/A'}
            </span>
          );
        },
      },
      {
        id: 'event_type',
        Header: () => {
          return (
            <div className="tabletopheader">
              <select
                className="form-select"
                value={filters.event_type}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    event_type: e.target.value === '' ? null : e.target.value,
                  })
                }
              >
                <option value="">All</option>
                <option value="QR Scan Missed">QR Scan Missed</option>
                <option value="QR Scan">QR Scan</option>
                <option value="Incident Report">Incident Report</option>
                <option value="SOS Alert">SOS Alert</option>
              </select>
            </div>
          );
        },
        columns: [
          {
            accessorKey: 'event_type',
            header: 'Event Type',
            enableColumnFilter: false,
            size: 250,
            Cell: ({ row }) => (
              <>
                <div>{row.original.event_type}</div>
              </>
            ),
          },
        ],
      },
      {
        id: 'company_name',
        columns: [
          {
            accessorKey: 'client_location',
            header: 'Client Location',
            enableColumnFilter: false,
            size: 350,
            Cell: ({ row }) => (
              <>
                <div>
                  {row.original.client_location} - {row.original.company_name}
                </div>
              </>
            ),
          },
        ],
      },
      // {
      //   accessorKey: 'city',
      //   header: 'City',
      //   enableColumnFilter: false,
      //   size: 250,
      // },
      {
        accessorKey: 'state',
        header: 'State',
        enableColumnFilter: false,
        size: 250,
      },

      // {
      //   accessorKey: 'checkpoint_code',
      //   header: 'CheckPoints',
      //   enableColumnFilter: false,
      //   size: 250,
      // },
      {
        accessorKey: 'r_checkpoint_area',
        header: 'CheckPoints Area',
        enableColumnFilter: false,
        size: 250,
      },

      {
        id: 'r_checkpoint_code',
        accessorKey: 'r_checkpoint_code',
        header: 'CheckPoints',
        enableColumnFilter: false,
        minSize: 100,
      },
      {
        accessorKey: 'r_guard_name',
        header: 'Guard Name',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'r_latitude',
        header: 'Latitude',
        enableColumnFilter: false,
        size: 140,
      },
      {
        accessorKey: 'r_longitude',
        header: 'Longitude',
        enableColumnFilter: false,
        size: 140,
      },
      {
        id: 'r_emp_code',
        Header: () => {
          return (
            <div className="tabletopheader">
              <TextField
                size="small"
                // value={filters.emp_code}
                onChange={(e) => handleFilterChange('emp_code', e.target.value)}
              />
            </div>
          );
        },
        columns: [
          {
            accessorKey: 'r_emp_code',
            header: 'Emp. Code',
            enableColumnFilter: false,
            minSize: 100,
          },
        ],
      },
    ],
    [filters]
  );
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  const handleFilterChange = debounce((filterKey, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
  }, 600);
  return (
    <MainLayout pageName="Guard Event Reports" hasAddButton={false}>
      <div className="gaurdtable_topbars">
        <div className="tabletopheader">
          <AutoCompletedDropdown
            url={'/api/v0/web/web_customer_dropdown'}
            handleDataChange={(value) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                company: value?.company_name,
                customer_id: value.customer_id,
              }))
            }
            labelName={'Company Name'}
            valueInput={filters.company}
            objLevel={'company_name'}
          />
        </div>
        <div className="tabletopheader">
          <TextField
            label="Qr Code"
            size="small"
            // value={filters.checkpoint_code}
            onChange={(e) =>
              handleFilterChange('checkpoint_code', e.target.value)
            }
          />
        </div>
      </div>

      {filters.customer_id ? (
        <CommonDataGrid
          url={'/api/v0/web/report_guard_events'}
          columns={gridColumns}
          body={filters}
          jsonUpd={''}
        />
      ) : null}

      {/* </div>
        </Col>
      </Row> */}

      {/* <ModalComponent modalTitle={formTitle} /> */}
    </MainLayout>
  );
}

export default GuardEvent;
