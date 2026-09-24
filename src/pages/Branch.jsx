import { useMemo, useState } from 'react';
import CommonDataGrid from '../components/CommonDataGrid';
import MainLayout from '../components/MainLayout';
import moment from 'moment';
import { userService } from '../../service/service';
import DeleteModal from '../components/DeleteModal';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';
import { BsEyeFill, BsPenFill, BsTrash3Fill } from 'react-icons/bs';
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
  hideModal,
  showModal,
  toggleForm,
  toggleSpinnerAndDisableButton,
} from "../Redux/Modals";
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import config from '../../service/config';
import Toast from '../components/Toast';


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

function Branch() {
  const deleteMessage = useSelector((state) => state.removeModal.message);
  const [updateGrid, setupdateGrid] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [body, setbody] = useState({
    refresh: '',
  });
  const deleteModalData = {
    id: deleteMessage?.branch_id,
    name: deleteMessage?.branch_code,
  };
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

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
      p_action: 'delete',
      branch_id: id,
    };
    try {
      const response = await userService.post(
        '/api/v0/web/web_master_branch_delete',
        obj
      );
      if (response.data.valid) {
        showToast("success", "Branch deleted successfully!");
        setbody({ ...body, refresh: Math.random() });
        setupdateGrid(updateGrid + 1);
      } else {
        showToast("error", response.data.message || "Failed to delete branch.");
      }
    } catch (err) {
      console.error('Error occurred while deleting:', err);
      showToast("error", "An unexpected error occurred. Please try again.");
    } finally {
      dispatch(hideModal());
      dispatch(toggleSpinnerAndDisableButton(false));
    }
  }

  const gridColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
        size: 90,
      },
      {
        accessorKey: 'branch_code',
        header: 'Branch Code',
        enableColumnFilter: false,
        size: 130,
      },
      {
        accessorKey: 'city',
        header: 'City',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'state',
        header: 'State',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'country',
        header: 'Country',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'address',
        header: 'Address',
        enableColumnFilter: false,
        size: 250,
      },
      {
        accessorKey: 'gstin',
        header: 'GSTIN',
        enableColumnFilter: false,
        size: 180,
      },
      {
        accessorKey: 'created_by_name',
        header: 'Created by',
        enableColumnFilter: false,
        size: 150,
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        Cell: ({ renderedCellValue }) => {
          if (!renderedCellValue) return <span>-</span>;
          const formattedDate = moment(renderedCellValue).isValid()
            ? moment(renderedCellValue).format('DD-MM-YYYY')
            : '-';
          const formattedTime = moment(renderedCellValue).isValid()
            ? moment(renderedCellValue).format('LT')
            : '-';
          return (
            <span>
              {formattedDate} ({formattedTime})
            </span>
          );
        },
        enableColumnFilter: false,
        size: 180,
      },
      {
        accessorKey: 'updated_by_name',
        header: 'Updated by',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated Date',
        Cell: ({ renderedCellValue }) => {
          if (!renderedCellValue) return <span>-</span>;
          const formattedDate = moment(renderedCellValue).isValid()
            ? moment(renderedCellValue).format('DD-MM-YYYY')
            : '-';
          const formattedTime = moment(renderedCellValue).isValid()
            ? moment(renderedCellValue).format('LT')
            : '-';
          return (
            <span>
              {formattedDate} ({formattedTime})
            </span>
          );
        },
        enableColumnFilter: false,
        size: 180,
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
          onPreview={handlePreview}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={isUserRight?.can_edit}
          canView={isUserRight?.can_view}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
    ],
    [isUserRight]
  );

  const handlePreview = (data) => {
    const obj = {
      ...data,
    };
    obj.type = 'Preview';
    navigate('add', {
      state: {
        id: obj.branch_id,
        type: 'preview',
      },
    });
  };

  const handleEdit = (data) => {
    const obj = { ...data };
    obj.p_action = 'update';
    navigate('add', {
      state: {
        id: obj.branch_id,
        type: 'edit',
      },
    });
  };
  return (
    <MainLayout
      isShowing={false}
      pageName="Branch"
      // hasAddButton={true}
      hasAddButton={isUserRight?.can_insert}
      linkto={'add'}
    // branchDropdown={true}
    >
      <CommonDataGrid
        url={'/api/v0/web/web_branch_browse'}
        columns={gridColumns}
        body={body}
        jsonUpd={updateGrid}
      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}

export default Branch;
