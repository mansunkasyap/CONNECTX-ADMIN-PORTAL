/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';
import moment from 'moment';
import {
  Badge,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  BsChatLeftDotsFill,
  BsEyeFill,
  BsPenFill,
  BsTrash3Fill,
} from 'react-icons/bs';
import { MdOutlineEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import DeleteModal from '../../components/DeleteModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  hideModal,
  showModal,
  toggleSpinnerAndDisableButton,
} from '../../Redux/Modals';
import { userService } from '../../../service/service';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';
import { MenuItem, TextField } from '@mui/material';
function Facility() {
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );

  const [modalRemarksShow, setModalRemarksShow] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    customer_id: null,
    refresh: '',
  });
  const deleteMessage = useSelector((state) => state.removeModal.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const deleteModalData = {
    id: deleteMessage?.guard_id,
    name: deleteMessage?.full_name,
  };
  // user rights starts
  const getUser = useSelector((state) => state.getUserRight.data);
  const url = useMemo(() => window.location.pathname.split('/'), []);
  const isUserRight = useMemo(() => {
    if (getUser) {      
      const moduleRights = getUser.find(
        (val) => val.module_name.toLowerCase() === url[1]
      );
      const finalModule = moduleRights?.rights.filter(
        (val) =>
          val.transaction_code.replace(/ /g, '-').toLowerCase() === url[2]
      );
      return finalModule?.length > 0
        ? finalModule[0]
        : {
          can_view: false,
          can_insert: false,
          can_edit: false,
          can_delete: false,
          can_print: false,
        };
    }
  }, [getUser, url]);
  // user rights ends 
  async function handleDelete(id) {
    const obj = {
      guard_id: id,
    };
    try {
      const response = await userService.post(
        '/api/v0/web/web_master_guard_delete',
        obj
      );
      if (response.data.valid) {
        showToast("success", "Saved successfully!");
        setFilters({
          ...filters,
          refresh: Math.random(),
        });
        dispatch(toggleSpinnerAndDisableButton(false));
        setTimeout(() => {
        }, 1700);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
    }
    dispatch(hideModal());
  }


  const [remarkUpdate, setRemarksUpdate] = useState({
    guard_id: null,
    new_customer_id: null,
    changed_by: 206,
    remarks: '',
    company_name: '',
  });
  23657;
  const handleChange = (event) => {
    setRemarksUpdate({
      ...remarkUpdate,
      [event.target.name]: event.target.value,
    });
  };

  function handleModalRemarks(row) {
    setModalRemarksShow(true);
    setRemarksUpdate({ ...remarkUpdate, guard_id: row.guard_id });
    // setselectedGuardId(row.guard_id)
  }

  async function handleUpdateRemarks(data) {
    try {
      const response = await userService.post(
        '/api/v0/web/web_guard_customer_update',
        { ...remarkUpdate }
      );
      if (response.status === 200) {

        if (response.data.status === 400) {
          alert(response.data.message || 'Found Duplicate Entries');
          return;
        } else {
          setModalRemarksShow(false);
          setRemarksUpdate();
        }
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const gridColumns = useMemo(
    () => [
    ////   {
    //     accessorKey: 'id',
    //     header: 'S.No.',
    //     enableColumnFilter: false,
    //     Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
    //     size: 90,
    //   },
    //   {
    //     accessorKey: 'emp_code',
    //     header: 'Emp. Code',
    //     enableColumnFilter: false,
    //     size: 150,
    //   },
    //   {
    //     accessorKey: 'full_name',
    //     header: 'Name',
    //     enableColumnFilter: false,
    //     size: 200,
    //   },
    //   {
    //     accessorKey: 'gender',
    //     header: 'Gender',
    //     enableColumnFilter: false,
    //     size: 200,
    //   },
    //   {
    //     accessorKey: 'mobile',
    //     header: 'Mobile',
    //     enableColumnFilter: false,
    //     size: 120,
    //   },
    //   {
    //     accessorKey: 'otp',
    //     header: 'OTP',
    //     enableColumnFilter: false,
    //     size: 120,
    //   },
    //   {
    //     accessorKey: 'email',
    //     header: 'Email',
    //     enableColumnFilter: false,
    //     size: 200,
    //   },
    //   {
    //     accessorKey: 'father_name',
    //     header: 'Father Name',
    //     enableColumnFilter: false,
    //     size: 150,
    //   },
    //   {
    //     accessorKey: 'date_of_joining',
    //     header: 'Date Of Joining',
    //     enableColumnFilter: false,
    //     size: 160,
    //     Cell: ({ renderedCellValue, row }) => {
    //       return <span>{moment(renderedCellValue).format('DD/MM/YYYY')}</span>;
    //     },
    //   },
    //   {
    //     accessorKey: 'date_of_birth',
    //     header: 'Date Of Birth',
    //     enableColumnFilter: false,
    //     size: 160,
    //     Cell: ({ renderedCellValue, row }) => {
    //       return <span>{moment(renderedCellValue).format('DD/MM/YYYY')}</span>;
    //     },
    //   },
    //   {
    //     accessorKey: 'bank_name',
    //     header: 'Bank Name',
    //     enableColumnFilter: false,
    //     size: 200,
    //   },
    //   {
    //     id: 'company_name',
    //     Header: () => {
    //       return (
    //         <div className="tabletopheader">
    //           <AutoCompletedDropdown
    //             url={'/api/v0/web/web_customer_dropdown'}
    //             handleDataChange={(val) => {
    //               setFilters({
    //                 ...filters,
    //                 customer_id: val.customer_id,
    //                 customer_code: val.customer_code,
    //                 company_name: val.company_name,
    //               });
    //             }}
    //             valueInput={filters.company}
    //             objLevel={'company_name'}
    //           />
    //         </div>
    //       );
    //     },
    //     columns: [
    //       {
    //         accessorKey: 'customer_code',
    //         header: 'Customer Details',
    //         enableColumnFilter: false,
    //         size: 350,
    //         Cell: ({ row }) => (
    //           <>
    //             <div>
    //               {row.original.customer_code} - {row.original.company_name}
    //             </div>
    //           </>
    //         ),
    //       },
    //     ],
    //   },
    //   {
    //     accessorKey: 'created_by_name',
    //     header: 'Created by',
    //     enableColumnFilter: false,
    //     size: 180,
    //   },
    //   {
    //     accessorKey: 'created_at',
    //     header: 'Created Date',
    //     enableColumnFilter: false,
    //     size: 180,
    //     Cell: ({ renderedCellValue, row }) => {
    //       return (
    //         <span>
    //           {moment(renderedCellValue).format('DD/MM/YYYY')} (
    //           {moment(renderedCellValue).format('LT')})
    //         </span>
    //       );
    //     },
    //   },
    //   {
    //     accessorKey: 'updated_by_name',
    //     header: 'Updated By',
    //     enableColumnFilter: false,
    //     size: 180,
    //   },
    //   {
    //     accessorKey: 'updated_at',
    //     header: 'Updated Date',
    //     enableColumnFilter: false,
    //     size: 180,
    //     Cell: ({ renderedCellValue, row }) => {
    //       return (
    //         <span>
    //           {renderedCellValue ? (
    //             <>
    //               {moment(renderedCellValue).format('DD/MM/YYYY')} (
    //               {moment(renderedCellValue).format('LT')})
    //             </>
    //           ) : (
    //             'NA'
    //           )}
    //         </span>
    //       );
    //     },
    //   },
    //   {
    //     accessorKey: 'action',
    //     header: 'Action',
    //     enableColumnFilter: false,
    //     size: 130,
    //     // eslint-disable-next-line react/prop-types
    //     Cell: ({ row }) => (
    //       <div className="d-flex align-items-center gap-1">
    //         {isUserRight?.can_edit && (
    //           <Badge
    //             bg="primary"
    //             onClick={() => {
    //               handleEdit(row.original);
    //             }}
    //             title="Edit SRF"
    //           >
    //             <MdOutlineEdit />
    //           </Badge>
    //         )}
    //         {isUserRight?.can_view && (
    //           <Badge bg="success" onClick={() => handlePreview(row.original)}>
    //             <FaEye />
    //           </Badge>
    //         )}
    //         <Badge
    //           bg="info"
    //           className="cursor-pointer"
    //           onClick={() => handleModalRemarks(row.original)}
    //         >
    //           <BsChatLeftDotsFill />
    //         </Badge>
    //         {isUserRight?.can_delete && (
    //           <Badge
    //             bg="danger"
    //             className="cursor-pointer"
    //             onClick={() => dispatch(showModal(row.original))}
    //           >
    //             <BsTrash3Fill />
    //           </Badge>
    //         )}
    //       </div>
    //     ),
    //   },
     ],
    [filters]
  );

  const handlePreview = (data) => {
    const obj = { ...data };
    obj.p_action = 'UPDATE';
    navigate('add', {
      state: {
        id: obj.guard_id,
        type: 'preview',
      },
    });
  };

  const handleEdit = (data) => {
    const obj = { ...data };
    obj.p_action = 'UPDATE';
    navigate('add', {
      state: {
        id: obj.guard_id,
        type: 'edit',
      },
    });
  };
  return (
    <MainLayout
      isShowing={false}
      pageName="Facility"
      hasAddButton={false}
    //   hasAddButton={isUserRight?.can_insert}
      linkto={'add'}
    // branchDropdown={true}
    >
      <CommonDataGrid
        url={'/api/v0/web/web_master_guard_browse'}
        columns={gridColumns}
        body={filters}
        // jsonUpd={updateGrid}
      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      {/* <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} /> */}

      <Modal
        show={modalRemarksShow}
        onHide={() => setModalRemarksShow(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Status Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-4">
                <AutoCompletedDropdown
                  url={'/api/v0/web/web_customer_dropdown'}
                  body={{}}
                  handleDataChange={(val) => {
                    setRemarksUpdate({
                      ...remarkUpdate,
                      customer_id: val.customer_id,
                      customer_code: val.customer_code,
                      company_name: val.company_name,
                    });
                  }}
                  valueInput={remarkUpdate?.company_name}
                  objLevel={'company_name'}
                  labelName={'Customer'}
                />
              </Col>
              <Col md={12} className="mb-4">
                <TextField
                  size="small"
                  fullWidth
                  label={'Remarks'}
                  name="remarks"
                  value={remarkUpdate?.remarks}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalRemarksShow(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="savebutton"
            onClick={handleUpdateRemarks}
            disabled={spinnerButton}
          >
            {spinnerButton ? (
              <Spinner animation="border" size="sm" />
            ) : (
              'Submit'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
}

export default Facility;
