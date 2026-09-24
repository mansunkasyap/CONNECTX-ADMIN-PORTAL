import React, { useMemo, useState } from 'react';
import { Badge, Modal } from 'react-bootstrap';
import { MdOutlineEdit } from 'react-icons/md';
import { FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import moment from 'moment';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';

function QRConnect() {
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  const handleOpenMap = (latitude, longitude) => {
    setLocation({ latitude, longitude });
    setShowModal(true);
  };

  const handleCloseMap = () => {
    setShowModal(false);
    setLocation({ latitude: null, longitude: null });
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
        accessorKey: 'r_emp_code',
        header: 'Emp. Code',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'r_guard_name',
        header: 'Guard Name',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'r_checkpoint_code',
        header: 'Checkpoint Code',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'r_customer_name',
        header: 'Customer Name',
        enableColumnFilter: false,
        size: 220,
      },
      {
        accessorKey: 'r_scan_time',
        header: 'Scan Time',
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          return <span>{moment(row.original.r_scan_time).format('LT')}</span>;
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        enableColumnFilter: false,
        size: 150,
        Cell: ({ row }) => {
          const { r_latitude, r_longitude } = row.original;
          if (r_latitude && r_longitude) {
            return (
              <FaMapMarkerAlt
                size={20}
                className="text-primary cursor-pointer"
                onClick={() => handleOpenMap(r_latitude, r_longitude)}
              />
            );
          }
          return null;
        },
      },
      // {
      //   accessorKey: 'action',
      //   header: 'Action',
      //   enableColumnFilter: false,
      //   size: 90,
      //   Cell: ({ row }) => (
      //     <div className="d-flex align-items-center gap-1">
      //       <Badge bg="primary">
      //         <MdOutlineEdit />
      //       </Badge>
      //       <Badge bg="success">
      //         <FaEye />
      //       </Badge>
      //     </div>
      //   ),
      // },
    ],
    []
  );

  return (
    <MainLayout pageName="QR Connect" hasAddButton={false}>
      <CommonDataGrid
        url={'/api/v0/web/web_checkpoint_scans'}
        columns={gridColumns}
      />

      {/* Modal for Map */}
      <Modal show={showModal} onHide={handleCloseMap} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {location.latitude && location.longitude ? (
            <iframe
              title="Google Maps Location"
              width="100%"
              height="400"
              src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=es;z=14&output=embed`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          ) : (
            <p>Loading location...</p>
          )}
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
}

export default QRConnect;
