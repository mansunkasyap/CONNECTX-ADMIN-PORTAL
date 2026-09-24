/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import CommonDataGrid from '../../components/CommonDataGrid';
import MainLayout from '../../components/MainLayout';
import { useMemo } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';
import { Badge, Col, Modal, Row, Table } from 'react-bootstrap';
import config from '../../../service/config';

function SurpriseVisitsReport() {
  const [updateGrid, setupdateGrid] = useState(0);
  const [showImages, setShowImages] = useState(false);
  const [trainersData, setTrainerData] = useState([]);
  const [showTrainer, setShowTrainer] = useState(false);
  const [processedImageUrls, setProcessedImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filters, setFilters] = useState({});

  function handleViewTrainer(data) {
    setTrainerData(data.trainers);
    setShowTrainer(true);
  }

  function handleClickImagePreview(image) {
    setProcessedImageUrls(image);
    setCurrentImageIndex(0);
    setShowImages(true);
  }
  const gridColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ row }) => Number(row.id) + 1,
        size: 80,
      },
      {
        accessorKey: 'visit_created_on',
        header: 'Date',
        enableColumnFilter: false,
        size: 120,
      },
      {
        id: 'company_name',
        columns: [
          {
            accessorKey: 'company_name',
            header: 'Customer',
            enableColumnFilter: false,
            size: 100,
          },
        ],
      },
      {
        accessorKey: 'latitude_longitude',
        header: 'Location',
        enableColumnFilter: false,
        size: 120,
        Cell: ({ row }) => {
          const { r_latitude, location } = row.original;
          if (r_latitude && location) {
            const googleMapsUrl = `https://www.google.com/maps?q=${location},${r_latitude}`;

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
      {
        accessorKey: 'Trainer',
        header: 'Trainer',
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row }) => (
          <Badge
            pill
            bg="warning"
            onClick={() => handleViewTrainer(row.original)}
            className="cursor-pointer"
          >
            View
          </Badge>
        ),
      },
      {
        accessorKey: 'observation',
        header: 'Observation',
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <div className="text-justify">
            {row.original.observations[0].observation}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: 'image',
        header: 'Image',
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row }) => {
          return (
            <Badge
              pill
              onClick={() =>
                handleClickImagePreview(
                  JSON.parse(row.original.observations[0].image_paths)
                )
              }
              className="lh-2 cursor-pointer"
              bg="warning"
            >
              <span>View</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: 'report_to',
        header: 'Report To',
        enableColumnFilter: false,
        size: 100,
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        enableColumnFilter: false,
        size: 200,
      },
    ],
    []
  );
  return (
    <MainLayout
      pageName="Surprise Visits Report"
      hasAddButton={false}
      //   linkto={'/guards/guards/add'}
      // branchDropdown={true}
    >
      <CommonDataGrid
        url={'/api/v0/web/surprise_visits_report'}
        columns={gridColumns}
        body={{}}
        // jsonUpd={updateGrid}
      />
      {/* <DeleteModal removeId={handleDelete} data={deleteModalData} /> */}
      {/* <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} /> */}

      <Modal
        show={showImages}
        size="md"
        centered
        onHide={() => setShowImages(false)}
      >
        <Modal.Header
          closeButton
          style={{ borderBottom: '2px solid #d05356', backgroundColor: '#fff' }}
        >
          <Modal.Title style={{ color: '#333', fontSize: '1rem', fontWeight: 600 }}>
            Image Preview{processedImageUrls.length > 1 ? ` (${currentImageIndex + 1} / ${processedImageUrls.length})` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#fff', padding: '1.25rem', textAlign: 'center' }}>
          {processedImageUrls.length > 0 ? (
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img
                src={processedImageUrls[currentImageIndex]}
                alt={`Preview ${currentImageIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=Image+Not+Found';
                }}
              />
              {processedImageUrls.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? processedImageUrls.length - 1 : prev - 1
                      )
                    }
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#d05356',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === processedImageUrls.length - 1 ? 0 : prev + 1
                      )
                    }
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#d05356',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <FaChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="text-center">No image</p>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={showTrainer} onHide={() => setShowTrainer(false)}>
        <Modal.Body>
          <h3>Trainers</h3>
          <Table size="sm" bordered className="mt-3 mb-0">
            <thead>
              <tr>
                <td className="bg-dark text-white">Trainer ID</td>
                <td className="bg-dark text-white">Employee Code</td>
                <td className="bg-dark text-white">Full Name</td>
              </tr>
            </thead>
            <tbody>
              {trainersData.length <= 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    No Data
                  </td>
                </tr>
              ) : (
                trainersData.map((item, index) => (
                  <tr key={index + item.emp_code}>
                    <td>{item.emp_code}</td>
                    <td>{item.trainer_id}</td>
                    <td>{item.full_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
}

export default SurpriseVisitsReport;
