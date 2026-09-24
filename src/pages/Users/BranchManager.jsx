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
import {
  hideModal,
  showModal,
  toggleSpinnerAndDisableButton,
} from '../../Redux/Modals';
import { AutoCompletedDropdown } from '../../components/AutoCompleteDropdown';
import { useNavigate } from 'react-router-dom';
import { MdOutlineEdit , MdMoreVert } from "react-icons/md";
import { TextField , IconButton, Menu, MenuItem } from "@mui/material";
import Toast from '../../components/Toast';

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

function BranchManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const deleteMessage = useSelector((state) => state.removeModal.message);
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
  const [updateGrid, setupdateGrid] = useState(0);
  const [body, setbody] = useState({
    branch_code: null,
    type: null,
  });
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  const deleteModalData = useMemo(
    () => ({
      id: deleteMessage?.user_id,
      name: deleteMessage?.emp_code,
    }),
    [deleteMessage]
  );

  async function handleDelete(id) {
    const obj = { user_id: id };
    try {
      const response = await userService.post(
        '/api/v0/web/web_user_branch_delete',
        obj
      );
      if (response.data.valid) {
        showToast("success", "Saved successfully!");
        setbody((prevBody) => ({ ...prevBody, refresh: 2 }));
        dispatch(toggleSpinnerAndDisableButton(false));
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
        Cell: ({ row }) => Number(row.id) + 1,
        size: 80,
      },
      {
        accessorKey: 'emp_code',
        header: 'EMP. Code',
        enableColumnFilter: false,
        minSize: 100,
      },
      {
        id: 'branch_code',
        Header: () => (
          <div className="tabletopheader">
            <AutoCompletedDropdown
              url={'/api/v0/web/web_branch_dropdown'}
              handleDataChange={(value) =>
                setbody((prevBody) => ({
                  ...prevBody,
                  branch_code: value.branch_code,
                }))
              }
              valueInput={body.branch_code}
              objLevel={'branch_code'}
            />
          </div>
        ),
        columns: [
          {
            accessorKey: 'branch_code',
            header: 'Branch Code',
            width: 280,
            enableColumnFilter: false,
            minSize: 200,
          },
        ],
      },
      {
        accessorKey: 'city',
        header: 'City',
        enableColumnFilter: false,
        minSize: 100,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableColumnFilter: false,
        minSize: 200,
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
        id: 'type',
        Header: () => (
          <div className="tabletopheader">
            <TextField
              size="small"
              value={body.type}
              onChange={(e) =>
                setbody((prevBody) => ({ ...prevBody, type: e.target.value }))
              }
            />
          </div>
        ),
        columns: [
          {
            accessorKey: 'type',
            header: 'Type',
            minSize: 100,
          },
        ],
      },
      {
        accessorKey: 'created_by_name',
        header: 'Created by',
        enableColumnFilter: false,
        minSize: 150,
      },
      {
        accessorKey: 'created_by_time',
        header: 'Date',
        enableColumnFilter: false,
        size: 190,
        Cell: ({ row }) => {
          const CheckIn = row.original.created_by_time;
          return CheckIn
            ? moment(CheckIn).format('DD-MM-YYYY (hh:mm A)')
            : 'N/A';
        },
      },
      {
        accessorKey: 'updated_by_name',
        header: 'Updated by',
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorKey: 'updated_by_time',
        header: 'Updated Date',
        enableColumnFilter: false,
        size: 190,
        Cell: ({ row }) => {
          const CheckIn = row.original.updated_by_time;
          return CheckIn
            ? moment(CheckIn).format('DD-MM-YYYY (hh:mm A)')
            : 'N/A';
        },
      },
      {
        accessorKey: 'action',
        header: 'Action',
        enableColumnFilter: false,
        maxSize: 100,
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
    [body, isUserRight]
  );

  const handlePreview = (data) => {
    navigate('/users/branch-manager/add', {
      state: {
        id: data.user_id,
        type: 'preview',
      },
    });
  };

  const handleEdit = (data) => {
    navigate('/users/branch-manager/add', {
      state: {
        id: data.user_id,
        type: 'edit',
      },
    });
  };

  useEffect(() => {
    setupdateGrid(Math.random());
  }, [body]);

  return (
    <MainLayout
      isShowing={false}
      pageName="Branch Users"
      // hasAddButton={true}
      hasAddButton={isUserRight?.can_insert}
      linkto={'/users/branch-manager/add'}
    >
      <CommonDataGrid
        url={`/api/v0/web/web_user_branch_browse`}
        columns={gridColumns}
        body={body}
        jsonUpd={updateGrid}
      />
      <DeleteModal removeId={handleDelete} data={deleteModalData} />
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </MainLayout>
  );
}

export default BranchManager;
