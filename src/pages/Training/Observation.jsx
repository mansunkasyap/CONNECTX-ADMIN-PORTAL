
import { useMemo, useState } from 'react';
import moment from 'moment';
import { Badge, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { TextField , IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import {
  hideModal,
  showModal,
  toggleForm,
  toggleSpinnerAndDisableButton,
} from '../../Redux/Modals';
import { BsTrash3Fill } from 'react-icons/bs';
import DeleteModal from '../../components/DeleteModal';
import CommonDataGrid from '../../components/CommonDataGrid';
import MainLayout from '../../components/MainLayout';
import { userService } from '../../../service/service';
import ModalComponent from '../../components/ModalComponent';
import Toast from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";
import { FaEye } from 'react-icons/fa';


function RowActionMenu({ row, onEdit, onPreview, onDelete, onRemarks, canEdit, canView, canDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < 160);
    setAnchorEl(e.currentTarget);
  };
  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MdMoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: openUpward ? "top" : "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: openUpward ? "bottom" : "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 120, borderRadius: 2 } } }}
      >
        {canEdit && <MenuItem onClick={() => { onEdit(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><MdOutlineEdit size={16} /> Edit</MenuItem>}
        {canView && <MenuItem onClick={() => { onPreview(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><FaEye size={14} /> View</MenuItem>}
        {onRemarks && <MenuItem onClick={() => { onRemarks(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}><BsChatLeftDotsFill size={14} /> Remarks</MenuItem>}
        {canDelete && <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}><BsTrash3Fill size={13} /> Delete</MenuItem>}
      </Menu>
    </>
  );
}

export default function Observation() {
  const dispatch = useDispatch();
  const addButton = useSelector((state) => state.addFormButton.show);
  const spinnerButton = useSelector(
    (state) => state.toggleSpinnerAndDisableButton.show
  );
  const navigate = useNavigate();
  const deleteMessage = useSelector((state) => state.removeModal.message);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const [formTitle, setFormTitle] = useState('Add Observation');

  const deleteModalData = {
    id: deleteMessage?.observation_id,
    name: deleteMessage?.observation,
  };
  const [errors, setErrors] = useState({});

  const initialValues = {
    observation_id: null,
    observation: "",
    description: "",
    is_enable: 'false',
    created_by: 1
  };
  const validateForm = () => {
    const newErrors = {};

    if (!inputValues.observation.trim()) newErrors.observation = 'Observation is required';
    if (!inputValues.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const [inputValues, setinputValues] = useState(initialValues);

  const [disableValue, setdisableValue] = useState({
    p_designation_id: '',
    disable: false,
  });
  const [body, setbody] = useState({
    refresh: '',
  });
  const [updateGrid, setupdateGrid] = useState(0);

  const handleClose = () => {
    setFormTitle('Add Observation');
    setinputValues(initialValues);
    setErrors({});
    dispatch(toggleForm());
  };
  // start userRights
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
  //end UserRights

  const gridColumn = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
        size: 90,
      },
      {
        accessorKey: 'observation',
        header: 'Observation',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableColumnFilter: false,
        size: 200,
      },

      {
        accessorKey: 'is_enable',
        header: 'Disable',
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row, renderedCellValue }) => {
          return (
            <div className="actionswitch">
              <Form.Check
                type="switch"
                size="sm"
                variant="danger"
                defaultChecked={renderedCellValue}
                onChange={() => disableCategory(row)}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'created_by',
        header: 'Created By',
        enableColumnFilter: false,
        size: 270,
      },
      {
        accessorKey: 'created_on',
        header: 'Date',
        enableColumnFilter: false,
        size: 190,
        Cell: ({ row }) => {
          const CheckIn = row.original.created_on;
          if (!CheckIn) return 'N/A';
          return (
            <span>
              {moment(CheckIn).format('DD-MM-YYYY (hh:mm A)')}
            </span>
          );
        },
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableColumnFilter: false,
        size: 100,
                Cell: ({ row }) => (
          <RowActionMenu
          row={row.original}
          onEdit={handleEdit}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
    ],
    [isUserRight]
  );

  const handlePreview = (data) => {
    const obj = { ...data };
    obj.p_action = 'UPDATE';
    navigate('/training/observation', {
      state: {
        id: obj.observation_id,
        type: 'preview',
      },
    });
  };
  const handleEdit = async (data) => {
    dispatch(toggleForm());
    setFormTitle('Edit Observation');
    try {
      const response = await userService.post(
        '/api/v0/web/web_training_visit_observation_preview',
        { observation_id: data.observation_id }
      );
      if (response.data.valid) {
        const value = response.data.data[0];
        setinputValues({
          observation_id: data.observation_id,
          observation: value.observation || "",
          description: value.description || "",
          is_enable: value.is_enable || 'false',
          created_by: value.created_by || 1,
        });
      } else {
        showToast("error", response.data.message || "Failed to load observation.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setinputValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const insertForm = async () => {
    if (!validateForm()) {
      return;
    }
    dispatch(toggleSpinnerAndDisableButton(true));
    try {
      const response = await userService.post(
        '/api/v0/web/web_training_visit_observation_manage',
        inputValues
      );
      if (response.status === 200 && response.data.status !== 400) {
        setinputValues(initialValues);
        showToast("success", "Observation saved successfully!");
        setupdateGrid(updateGrid + 1);
        setbody({ ...body });
        dispatch(toggleForm());
      } else {
        showToast("error", response.data.message || "Duplicate entry detected. Please check the entered details.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred. Please try again.");
    } finally {
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  };

  const disableCategory = async (row) => {
    try {
      const updatedDisableValue = {
        is_enable: !row.original.is_enable,
        observation_id: row.original.observation_id
      };

      const response = await userService.post(
        '/api/v0/web/web_training_visit_observation_disable',
        updatedDisableValue
      );

      if (response.data.valid) {
        showToast("success", "Status updated successfully!");
        setbody({ ...body, refresh: 2 });
      } else {
        showToast("error", response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addFormJsx = (
    <Form>
      <Row>
        <Col md={12} className="mb-4">
          <TextField
            size="small"
            fullWidth
            label="Observation"
            name="observation"
            value={inputValues.observation}
            onChange={handleChange}
            error={!!errors.observation}
            helperText={errors.observation}
            required
          />
        </Col>
        <Col md={12} className="mb-4">
          <TextField
            size="small"
            fullWidth
            label="Description"
            name="description"
            value={inputValues.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
        </Col>
        <Col md={12} className="d-flex justify-content-end gap-2">
          <Button
            size="sm"
            variant="none"
            type="button"
            className="commonBtn"
            onClick={insertForm}
            disabled={spinnerButton}
          >
            {spinnerButton ? (
              <Spinner animation="border" variant="dark" size="sm" />
            ) : (
              'Submit'
            )}
          </Button>
          <Button
            size="sm"
            variant="none"
            className="cancelBtn"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );

  async function handleDelete(id) {
    const obj = {
      observation_id: id,
    };
    try {
      const response = await userService.post(
        '/api/v0/web/web_training_visit_observation_delete',
        obj
      );
      if (response.data.valid) {
        showToast("success", "Observation deleted successfully!");
        setbody({ ...body, refresh: Math.random() });
        setupdateGrid((prev) => prev + 1);
        dispatch(toggleSpinnerAndDisableButton(false));
      } else {
        showToast("error", response.data.message || "Failed to delete observation.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred. Please try again.");
    }
    dispatch(hideModal());
  }

  return (
    <MainLayout
      isShowing={false}
      pageName={'Observation'}
      // hasAddButton={true}
      hasAddButton={isUserRight?.can_insert}
      branchDropdown={false}
    >
      <CommonDataGrid
        url={'/api/v0/web/web_training_visit_observation_browse'}
        columns={gridColumn}
        body={body}
        jsonUpd={updateGrid}
      />
      <ModalComponent
        innerJsx={addFormJsx}
        modalTitle={formTitle}
        hidden={addButton}

      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}
