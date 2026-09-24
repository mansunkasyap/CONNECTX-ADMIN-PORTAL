/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';
import { BsTrash3Fill } from 'react-icons/bs';
import MainLayout from '../../components/MainLayout';
import CommonDataGrid from '../../components/CommonDataGrid';
import DeleteModal from '../../components/DeleteModal';
import { userService } from '../../../service/service';
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
  hideModal,
  showModal,
  toggleSpinnerAndDisableButton,
} from "../../Redux/Modals";
import { useNavigate } from 'react-router-dom';
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";

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

function Trainers() {
  const navigate = useNavigate();
  const deleteMessage = useSelector((state) => state.removeModal.message);
  const [updateGrid, setupdateGrid] = useState(0);
  const dispatch = useDispatch();
  const searchValue = () => {
    const userType = window.location.search;
    if (userType) {
      return userType.split('=')[1];
    }
    return '';
  };
  const [body, setbody] = useState({
    branch_code: '',
    type: searchValue(),
  });
  const deleteModalData = {
    id: deleteMessage?.user_id,
    name: deleteMessage?.emp_code,
  };
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  async function handleDelete(id) {
    const obj = {
      user_id: id,
    };
    try {
      const response = await userService.post(
        '/api/v0/web/web_user_trainer_delete',
        obj
      );
      if (response.data.valid) {
        showToast("success", "Saved successfully!");
        setbody({
          ...body,
          refresh: 2,
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

  const gridColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'S.No.',
        enableColumnFilter: false,
        Cell: ({ renderedCellValue, row }) => Number(row.id) + 1,
        size: 80,
      },
      {
        accessorKey: 'emp_code',
        header: 'EMP. Code',
        enableColumnFilter: false,
        minSize: 100,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableColumnFilter: false,
        minSize: 230,
      },
      {
        accessorKey: 'full_name',
        header: 'Name',
        enableColumnFilter: false,
        minSize: 150,
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile',
        enableColumnFilter: false,
        minSize: 150,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableColumnFilter: false,
        minSize: 150,
      },
      {
        accessorKey: 'created_by',
        header: 'Created by',
        enableColumnFilter: false,
        minSize: 150,
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        Cell: ({ renderedCellValue }) => {
          if (!renderedCellValue) return <span>-</span>;

          const date = moment(renderedCellValue);

          const isValidDate = date.isValid();
          const formattedDate = isValidDate ? date.format('DD-MM-YYYY') : '-';
          const formattedTime = isValidDate ? date.format('HH:mm A') : '-';
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
        accessorKey: 'updated_by',
        header: 'Updated by',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'updated_at',
        header: 'Date',
        Cell: ({ renderedCellValue }) => {
          if (!renderedCellValue) return <span>-</span>;

          const date = moment(renderedCellValue);

          const isValidDate = date.isValid();
          const formattedDate = isValidDate ? date.format('DD-MM-YYYY') : '-';
          const formattedTime = isValidDate ? date.format('HH:mm A') : '-';

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
        minSize: 100,
                Cell: ({ row }) => (
          <RowActionMenu
          row={row.original}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDelete={(data) => dispatch(showModal(data))}
          canEdit={true}
          canView={true}
          canDelete={true}
          />
        ),
        },
    ],
    [body]
  );
  const handlePreview = (data) => {
    const obj = { ...data };
    obj.p_action = 'update';
    navigate('/training/addTrainers', {
      state: {
        id: obj.user_id,
        type: 'preview',
      },
    });
  };
  const handleEdit = (data) => {
    const obj = { ...data };
    obj.p_action = 'update';
    navigate('/training/addTrainers', {
      state: {
        id: obj.user_id,
        type: 'edit',
      },
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setupdateGrid(Math.random() * 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [body]);
  
  return (
    <MainLayout
      isShowing={false}
      pageName="Trainer trainer......"
      // hasAddButton={true}
      hasAddButton={isUserRight?.can_insert}
      linkto={'trainer/add'}
      // branchDropdown={true}
    >
      <CommonDataGrid
        url={`/api/v0/web/web_user_trainer_browse`}
        columns={gridColumns}
        body={body}
        jsonUpd={updateGrid}
      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      {/* <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} /> */}
    </MainLayout>
  );
}

export default Trainers;
