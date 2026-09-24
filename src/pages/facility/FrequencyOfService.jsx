import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import CommonDataGrid from "../../components/CommonDataGrid";
import DeleteModal from "../../components/DeleteModal";
import Toast from "../../components/Toast";
import { Badge } from "react-bootstrap";
import { BsPenFill, BsTrash3Fill } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { hideModal, showModal, toggleSpinnerAndDisableButton } from "../../Redux/Modals";
import { userService } from "../../../service/service";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MdMoreVert, MdOutlineEdit } from "react-icons/md";


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

export default function FrequencyOfService() {
    const [updateGrid, setupdateGrid] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, type: "success", message: "" });
    const showToast = (type, message) => setToast({ show: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, show: false }));
    const deleteMessage = useSelector((state) => state.removeModal.message);
    const deleteModalData = {
        id: deleteMessage?.area_id,
    };
    const getUser = useSelector((state) => state.getUserRight.data);
    const url = useMemo(() => window.location.pathname.split('/'), []);
    // const isUserRight = useMemo(() => {
    //     if (getUser) {    
    //         const moduleRights = getUser.find(
    //             (val) => val.module_name.toLowerCase() === url[1]
    //         );
    //         const finalModule = moduleRights?.rights.filter(
    //             (val) =>
    //                 val.transaction_code.replace(/ /g, '-').toLowerCase() === url[2]
    //         );
    //         return finalModule?.length > 0
    //             ? finalModule[0]
    //             : {
    //                 can_view: false,
    //                 can_insert: false,
    //                 can_edit: false,
    //                 can_delete: false,
    //                 can_print: false,
    //             };
    //     }
    // }, [getUser, url]);
    const [body, setbody] = useState({
        refresh: '',
    });
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
                accessorKey: 'area',
                header: 'Area Name',
                enableColumnFilter: false,
                size: 200,
            },
            // {
            //     accessorKey: 'type',
            //     header: 'Type',
            //     enableColumnFilter: false,
            //     size: 200,
            // },
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
          canView={true}
          canDelete={isUserRight?.can_delete}
          />
        ),
        },
        ]);
    async function handleDelete(id) {
        const obj = {
            area_id: id,
        };
        try {
            const response = await userService.post(
                '/api/v0/web/delete_checklist_area',
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
                    setupdateGrid(updateGrid + 1);
                }, 1200);
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            console.error('error', err);
        }

        dispatch(hideModal());
    }
    const handlePreview = (data) => {
        const obj = {
            ...data
        };
        obj.type = "preview";
        navigate('/facility/frequency-service/add', {
            state: {
                id: obj.area_id,
                type: 'preview'
            }
        });

    };

    const handleEdit = (data) => {
        const obj = { ...data };
        navigate('/facility/frequency-service/add', {
            state: {
                id: obj.area_id,
                type: 'edit'
            }
        });
    };
    return (
        <>
            <MainLayout
                isShowing={false}
                pageName={'check List'}
                hasAddButton={true}
                // hasAddButton={isUserRight?.can_insert}
                branchDropdown={false}
                linkto={'/facility/frequency-service/add'}

            >
                <CommonDataGrid
                    url={'/api/v0/web/browse_checklist_areas'}
                    columns={gridColumn}
                    body={body}
                    jsonUpd={updateGrid}
                />
                <DeleteModal removeId={handleDelete} data={deleteModalData} />
                <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
            </MainLayout>
        </>
    )
        ;
}