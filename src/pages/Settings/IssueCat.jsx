import { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { TextField, IconButton, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import {
  hideModal,
  showModal,
  toggleForm,
  toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";
import { FaEye } from 'react-icons/fa';
import { BsTrash3Fill } from 'react-icons/bs';
import DeleteModal from '../../components/DeleteModal';
import CommonDataGrid from '../../components/CommonDataGrid';
import MainLayout from '../../components/MainLayout';
import { userService } from '../../../service/service';
import ModalComponent from '../../components/ModalComponent';
import Toast from '../../components/Toast';


function RowActionMenu({ row, onEdit, onDelete, canEdit, canDelete }) {
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
        {canEdit && (
          <MenuItem onClick={() => { onEdit(row); handleClose(); }} sx={{ gap: 1, fontSize: 14 }}>
            <MdOutlineEdit size={16} /> Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={() => { onDelete(row); handleClose(); }} sx={{ gap: 1, fontSize: 14, color: "error.main" }}>
            <BsTrash3Fill size={13} /> Delete
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default function IssueCat() {
  const dispatch = useDispatch();
  const addButton = useSelector((state) => state.addFormButton.show);
  const spinnerButton = useSelector((state) => state.toggleSpinnerAndDisableButton.show);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
  const [formTitle, setFormTitle] = useState('Add Issue Category');

  const initialValues = {
    action: 'INSERT',
    category_id: 1,
    category_name: '',
    description: '',
    is_disabled: false,
  };

  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    if (!inputValues.category_name.trim()) newErrors.category_name = 'Category Name is required.';
    if (!inputValues.description.trim()) newErrors.description = 'Description is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const deleteMessage = useSelector((state) => state.removeModal.message);
  const deleteModalData = {
    id: deleteMessage?.category_id,
    name: deleteMessage?.category_name,
  };

  const [inputValues, setinputValues] = useState(initialValues);
  const [body, setbody] = useState({ refresh: '' });
  const [updateGrid, setupdateGrid] = useState(0);

  const handleClose = () => {
    setFormTitle('Add Issue Category');
    setinputValues(initialValues);
    setErrors({});
    dispatch(toggleForm());
  };

  // start userRights
  const getUser = useSelector((state) => state.getUserRight.data);
  const url = useMemo(() => window.location.pathname.split('/'), []);
  const isUserRight = useMemo(() => {
    if (getUser) {
      const moduleRights = getUser.find((val) => val.module_name.toLowerCase() === url[1]);
      const finalModule = moduleRights?.rights.filter(
        (val) => val.transaction_code.replace(/ /g, '-').toLowerCase() === url[2]
      );
      return finalModule?.length > 0
        ? finalModule[0]
        : { can_view: false, can_insert: false, can_edit: false, can_delete: false, can_print: false };
    }
  }, [getUser, url]);
  // end userRights

  const disableCategory = async (row) => {
    try {
      const response = await userService.post('/api/v0/web/issue_category_disable', {
        p_is_disabled: !row.original.is_disabled,
        p_category_id: row.original.category_id,
        p_updated_by: row.original.updated_by,
      });
      if (response.data.valid) {
        showToast("success", "Status updated successfully!");
        setbody({ ...body, refresh: 2 });
      } else {
        showToast("error", response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleEdit = async (data) => {
    dispatch(toggleForm());
    setFormTitle("Edit Issue Category");
    try {
      const response = await userService.post('/api/v0/web/issue_category_preview', {
        category_id: data.category_id,
      });
      if (response.data.valid) {
        const value = response.data.data[0];
        let tempData = { ...inputValues };
        for (let key in tempData) {
          if (value.hasOwnProperty(key)) tempData[key] = value[key];
        }
        tempData.action = 'UPDATE';
        setinputValues(tempData);
      } else {
        showToast("error", response.data.message || "Failed to load issue category.");
      }
    } catch (err) {
      console.error('Error while fetching Issue Category data:', err);
      showToast("error", "An unexpected error occurred. Please try again.");
    }
  };

  const gridColumn = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ row }) => Number(row.id) + 1,
        size: 90,
      },
      {
        accessorKey: 'category_name',
        header: 'Category Name',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableColumnFilter: false,
        size: 260,
      },
      {
        accessorKey: 'is_disabled',
        header: 'Disable',
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row, renderedCellValue }) => (
          <div className="actionswitch">
            <Form.Check
              type="switch"
              size="sm"
              variant="danger"
              defaultChecked={renderedCellValue}
              onChange={() => disableCategory(row)}
            />
          </div>
        ),
      },
      {
        accessorKey: 'created_by_name',
        header: 'Created By',
        enableColumnFilter: false,
        size: 270,
      },
      {
        accessorKey: 'created_at',
        header: 'Created Date',
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const createdAt = row.original.created_at;
          if (!createdAt) return 'N/A';
          return <span>{moment(createdAt).format('DD/MM/YYYY')} ({moment(createdAt).format('LT')})</span>;
        },
      },
      {
        accessorKey: 'updated_by_name',
        header: 'Updated By',
        enableColumnFilter: false,
        size: 200,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated Date',
        enableColumnFilter: false,
        size: 160,
        Cell: ({ row }) => {
          const updatedAt = row.original.updated_at;
          if (!updatedAt) return 'N/A';
          return <span>{moment(updatedAt).format('DD/MM/YYYY')} ({moment(updatedAt).format('LT')})</span>;
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setinputValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const insertForm = async () => {
    if (!validateForm()) return;
    dispatch(toggleSpinnerAndDisableButton(true));
    try {
      const response = await userService.post('/api/v0/web/issue_category_manage', inputValues);
      if (response.status === 200 && response.data.status !== 400) {
        setinputValues(initialValues);
        showToast("success", "Issue category saved successfully!");
        setupdateGrid(updateGrid + 1);
        setbody({ ...body, refresh: 2 });
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

  const addFormJsx = (
    <Form>
      <Row>
        <Col md={12} className="mb-4">
          <TextField
            size="small"
            fullWidth
            label="Category Name"
            name="category_name"
            value={inputValues.category_name}
            onChange={handleChange}
            error={!!errors.category_name}
            helperText={errors.category_name}
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
          <Button size="sm" variant="none" className="cancelBtn" onClick={handleClose}>
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );

  async function handleDelete(id) {
    try {
      const response = await userService.post('/api/v0/web/issue_category_delete', { category_id: id });
      if (response.data.valid) {
        showToast("success", "Issue category deleted successfully!");
        setupdateGrid((prev) => prev + 1);
        setbody({ ...body, refresh: Math.random() });
        dispatch(toggleSpinnerAndDisableButton(false));
      } else {
        showToast("error", response.data.message || "Failed to delete issue category.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "An unexpected error occurred. Please try again.");
    } finally {
      dispatch(hideModal());
    }
  }

  return (
    <MainLayout
      isShowing={false}
      pageName="Issue Category"
      hasAddButton={isUserRight?.can_insert}
      branchDropdown={false}
    >
      <CommonDataGrid
        url="/api/v0/web/issue_category_browse"
        columns={gridColumn}
        body={body}
        jsonUpd={updateGrid}
      />
      <ModalComponent innerJsx={addFormJsx} modalTitle={formTitle} hidden={addButton} />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}
