/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import CommonDataGrid from '../../components/CommonDataGrid';
import MainLayout from '../../components/MainLayout';
import { useMemo } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import SelfieProfleImage from '../../components/SelfieProfleImage';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';

function TrainingReport() {
  const [updateGrid, setupdateGrid] = useState(0);
  const [filters, setFilters] = useState({
    r_customer: '',
    r_guard_name: '',
    customer_id: null,
    guard_id: null,
    company_name: '',
    company: '',
  });

  const handleFilterChange = (filterKey, value, filterKeyId, id) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value === '' ? null : value,
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
            accessorKey: 'r_customer',
            header: 'Customer',
            enableColumnFilter: false,
            size: 300,
            Cell: ({ row }) => (
              <>
                <div>{row.original.r_customer}</div>
              </>
            ),
          },
        ],
      },
      {
        accessorKey: 'r_emp_code',
        header: 'Emp. Code',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'r_guard_name',
        header: 'Guard Name',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'r_selfie_path',
        header: 'Image',
        enableColumnFilter: false,
        size: 200,
        Cell: ({ row }) => (
          <SelfieProfleImage profileData={row.original.r_selfie_path} />
        ),
      },

      {
        accessorKey: 'r_check_type',
        header: 'Type',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'r_created_at',
        header: 'Created at',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'r_check_time',
        header: 'Check Time',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'latitude_longitude',
        header: 'Location',
        enableColumnFilter: false,
        size: 120,
        Cell: ({ row }) => {
          const { r_latitude, r_longitude } = row.original;
          if (r_latitude && r_longitude) {
            const googleMapsUrl = `https://www.google.com/maps?q=${r_latitude},${r_longitude}`;

            return (
              <Link
                to={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaMapMarkerAlt
                  size={20}
                  className="text-primary cursor-pointer"
                />
              </Link>
            );
          }
          return null;
        },
      },
    ],
    [filters]
  );
  return (
    <MainLayout
      pageName="Attendance"
      hasAddButton={false}
      //   linkto={'/guards/guards/add'}
      // branchDropdown={true}
    >
      <CommonDataGrid
        url={'/api/v0/web/web_guard_attendance'}
        columns={gridColumns}
        body={filters}
        // jsonUpd={updateGrid}
      />
      {/* <DeleteModal removeId={handleDelete} data={deleteModalData} /> */}
      {/* <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} /> */}
    </MainLayout>
  );
}

export default TrainingReport;
